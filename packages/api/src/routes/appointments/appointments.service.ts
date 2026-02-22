import { getPrisma } from '../../lib/prisma';

/**
 * Resolves the user and their role (landlord or tenant) relative to an application.
 */
async function getParticipantRole(cognitoSub: string, applicationId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: { property: true },
  });
  const role: 'landlord' | 'tenant' =
    application.property.ownerId === user.id ? 'landlord' : 'tenant';
  if (role === 'tenant' && application.applicantId !== user.id) {
    throw Object.assign(new Error('No tienes acceso a esta aplicacion'), { statusCode: 403 });
  }
  return { user, application, role };
}

/**
 * Creates an appointment for an accepted application.
 */
export async function createAppointment(cognitoSub: string, applicationId: string) {
  const prisma = getPrisma();
  const { application } = await getParticipantRole(cognitoSub, applicationId);

  if (application.status !== 'ACCEPTED') {
    throw Object.assign(
      new Error('Solo se puede agendar cita para aplicaciones aceptadas'),
      { statusCode: 400 },
    );
  }

  // Check if appointment already exists
  const existing = await prisma.appointment.findUnique({
    where: { applicationId },
  });
  if (existing) {
    throw Object.assign(new Error('Ya existe una cita para esta aplicacion'), { statusCode: 409 });
  }

  return prisma.appointment.create({
    data: { applicationId },
    include: { availabilitySlots: true },
  });
}

/**
 * Get appointment by application ID.
 */
export async function getAppointmentByApplication(cognitoSub: string, applicationId: string) {
  await getParticipantRole(cognitoSub, applicationId);
  const prisma = getPrisma();
  return prisma.appointment.findUnique({
    where: { applicationId },
    include: {
      availabilitySlots: {
        include: { user: true },
        orderBy: { startTime: 'asc' },
      },
    },
  });
}

/**
 * Add availability slots.
 */
export async function addSlots(
  cognitoSub: string,
  appointmentId: string,
  slots: { startTime: string; endTime: string }[],
) {
  const prisma = getPrisma();
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
  });

  if (appointment.status !== 'SCHEDULING') {
    throw Object.assign(
      new Error('Solo se pueden agregar horarios cuando la cita esta en agendamiento'),
      { statusCode: 400 },
    );
  }

  const { user } = await getParticipantRole(cognitoSub, appointment.applicationId);

  const created = await prisma.availabilitySlot.createMany({
    data: slots.map((s) => ({
      appointmentId,
      userId: user.id,
      startTime: new Date(s.startTime),
      endTime: new Date(s.endTime),
    })),
  });

  const allSlots = await prisma.availabilitySlot.findMany({
    where: { appointmentId },
    include: { user: true },
    orderBy: { startTime: 'asc' },
  });

  return { created: created.count, slots: allSlots };
}

/**
 * Delete own availability slot.
 */
export async function deleteSlot(cognitoSub: string, appointmentId: string, slotId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const slot = await prisma.availabilitySlot.findUniqueOrThrow({ where: { id: slotId } });

  if (slot.appointmentId !== appointmentId) {
    throw Object.assign(new Error('El slot no pertenece a esta cita'), { statusCode: 400 });
  }
  if (slot.userId !== user.id) {
    throw Object.assign(new Error('Solo puedes eliminar tus propios horarios'), { statusCode: 403 });
  }

  return prisma.availabilitySlot.delete({ where: { id: slotId } });
}

/**
 * Compute matching time windows between landlord and tenant slots.
 * A match is valid if the overlap is >= 30 minutes.
 */
export async function getMatches(cognitoSub: string, appointmentId: string) {
  const prisma = getPrisma();
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    include: {
      application: { include: { property: true } },
    },
  });

  await getParticipantRole(cognitoSub, appointment.applicationId);

  const slots = await prisma.availabilitySlot.findMany({
    where: { appointmentId },
    orderBy: { startTime: 'asc' },
  });

  const landlordId = appointment.application.property.ownerId;
  const tenantId = appointment.application.applicantId;

  const landlordSlots = slots.filter((s) => s.userId === landlordId);
  const tenantSlots = slots.filter((s) => s.userId === tenantId);

  const MIN_OVERLAP_MS = 30 * 60 * 1000; // 30 minutes
  const matches: { start: Date; end: Date }[] = [];

  for (const ls of landlordSlots) {
    for (const ts of tenantSlots) {
      const start = new Date(Math.max(ls.startTime.getTime(), ts.startTime.getTime()));
      const end = new Date(Math.min(ls.endTime.getTime(), ts.endTime.getTime()));
      if (end.getTime() - start.getTime() >= MIN_OVERLAP_MS) {
        matches.push({ start, end });
      }
    }
  }

  return {
    matches,
    landlordSlotsCount: landlordSlots.length,
    tenantSlotsCount: tenantSlots.length,
  };
}

/**
 * Confirm a time slot.
 */
export async function confirmAppointment(
  cognitoSub: string,
  appointmentId: string,
  confirmedStart: string,
  confirmedEnd: string,
) {
  const prisma = getPrisma();
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
  });

  if (appointment.status !== 'SCHEDULING') {
    throw Object.assign(new Error('La cita ya esta confirmada o completada'), { statusCode: 400 });
  }

  const { user } = await getParticipantRole(cognitoSub, appointment.applicationId);

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'CONFIRMED',
      confirmedStart: new Date(confirmedStart),
      confirmedEnd: new Date(confirmedEnd),
      confirmedById: user.id,
    },
    include: { availabilitySlots: true },
  });
}

/**
 * Mark appointment as completed (landlord only).
 */
export async function completeAppointment(cognitoSub: string, appointmentId: string) {
  const prisma = getPrisma();
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
  });

  if (appointment.status !== 'CONFIRMED') {
    throw Object.assign(
      new Error('Solo se puede completar una cita confirmada'),
      { statusCode: 400 },
    );
  }

  const { role } = await getParticipantRole(cognitoSub, appointment.applicationId);
  if (role !== 'landlord') {
    throw Object.assign(
      new Error('Solo el arrendador puede marcar la cita como completada'),
      { statusCode: 403 },
    );
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'COMPLETED' },
  });
}

/**
 * Cancel appointment.
 */
export async function cancelAppointment(cognitoSub: string, appointmentId: string) {
  const prisma = getPrisma();
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
  });

  if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
    throw Object.assign(
      new Error('No se puede cancelar una cita completada o ya cancelada'),
      { statusCode: 400 },
    );
  }

  await getParticipantRole(cognitoSub, appointment.applicationId);

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED' },
  });
}
