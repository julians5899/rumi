import { getPrisma } from '../../lib/prisma';

export async function createApplication(cognitoSub: string, data: Record<string, unknown>) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });

  // Prevent self-application
  const property = await prisma.property.findUniqueOrThrow({ where: { id: data.propertyId as string } });
  if (property.ownerId === user.id) {
    throw Object.assign(new Error('No puedes aplicar a tu propia propiedad'), { statusCode: 400 });
  }

  return prisma.application.create({
    data: { propertyId: data.propertyId as string, applicantId: user.id, message: data.message as string | undefined },
    include: {
      property: { select: { id: true, title: true, city: true, price: true } },
      applicant: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  });
}

export async function getSentApplications(cognitoSub: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  return prisma.application.findMany({
    where: { applicantId: user.id },
    include: { property: { select: { id: true, title: true, city: true, price: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getReceivedApplications(cognitoSub: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  return prisma.application.findMany({
    where: { property: { ownerId: user.id } },
    include: {
      property: { select: { id: true, title: true, city: true, price: true } },
      applicant: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getApplicationWorkflow(cognitoSub: string, applicationId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });

  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: {
      property: {
        include: { owner: true },
      },
      applicant: true,
      appointment: {
        include: {
          availabilitySlots: {
            include: { user: true },
            orderBy: { startTime: 'asc' },
          },
        },
      },
      documents: { orderBy: { createdAt: 'desc' } },
      lease: {
        include: {
          property: true,
          tenant: true,
        },
      },
    },
  });

  // Verify access — must be landlord or tenant
  const isLandlord = application.property.ownerId === user.id;
  const isTenant = application.applicantId === user.id;
  if (!isLandlord && !isTenant) {
    throw Object.assign(new Error('No tienes acceso a esta aplicacion'), { statusCode: 403 });
  }

  // Compute current workflow stage
  let currentStage = 'ACCEPTED';

  if (application.lease) {
    currentStage = application.lease.status === 'ACTIVE' ? 'LEASE_ACTIVE' : 'LEASE_ENDED';
  } else if (application.documents.length > 0) {
    const approvedTypes = new Set(
      application.documents.filter((d) => d.status === 'APPROVED').map((d) => d.type),
    );
    if (approvedTypes.has('CC') && approvedTypes.has('WORK_CERT')) {
      currentStage = 'READY_FOR_LEASE';
    } else {
      currentStage = 'DOCUMENTS_PENDING';
    }
  } else if (application.appointment) {
    switch (application.appointment.status) {
      case 'SCHEDULING':
        currentStage = 'SCHEDULING';
        break;
      case 'CONFIRMED':
        currentStage = 'VISIT_CONFIRMED';
        break;
      case 'COMPLETED':
        currentStage = 'VISIT_COMPLETED';
        break;
      case 'CANCELLED':
        currentStage = 'VISIT_CANCELLED';
        break;
    }
  }

  // Document summary
  const docs = application.documents;
  const documentsSummary = {
    total: docs.length,
    approved: docs.filter((d) => d.status === 'APPROVED').length,
    pending: docs.filter((d) => d.status === 'PENDING').length,
    rejected: docs.filter((d) => d.status === 'REJECTED').length,
    items: docs,
  };

  return {
    application: {
      id: application.id,
      status: application.status,
      message: application.message,
      createdAt: application.createdAt,
    },
    property: application.property,
    applicant: application.applicant,
    role: isLandlord ? 'landlord' : 'tenant',
    currentStage,
    appointment: application.appointment,
    documents: documentsSummary,
    lease: application.lease,
  };
}

export async function updateApplicationStatus(cognitoSub: string, applicationId: string, status: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: { property: true },
  });
  if (application.property.ownerId !== user.id) {
    throw Object.assign(new Error('No tienes permiso para actualizar esta aplicacion'), { statusCode: 403 });
  }
  return prisma.application.update({
    where: { id: applicationId },
    data: { status: status as 'ACCEPTED' | 'REJECTED' },
  });
}
