import { getPrisma } from '../../lib/prisma';

/**
 * Create a lease. Only the landlord can create a lease, and only when
 * both CC and WORK_CERT documents are approved.
 */
export async function createLease(
  cognitoSub: string,
  data: {
    applicationId: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
  },
) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: data.applicationId },
    include: {
      property: true,
      documents: true,
      lease: true,
    },
  });

  // Must be the landlord
  if (application.property.ownerId !== user.id) {
    throw Object.assign(new Error('Solo el arrendador puede crear contratos'), { statusCode: 403 });
  }

  // Must not already have a lease
  if (application.lease) {
    throw Object.assign(new Error('Ya existe un contrato para esta aplicacion'), { statusCode: 409 });
  }

  // Check required documents are approved
  const approvedTypes = new Set(
    application.documents
      .filter((d) => d.status === 'APPROVED')
      .map((d) => d.type),
  );

  if (!approvedTypes.has('CC') || !approvedTypes.has('WORK_CERT')) {
    throw Object.assign(
      new Error('Se requiere CC y Certificado Laboral aprobados para crear el contrato'),
      { statusCode: 400 },
    );
  }

  return prisma.lease.create({
    data: {
      applicationId: data.applicationId,
      tenantId: application.applicantId,
      propertyId: application.property.id,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      monthlyRent: data.monthlyRent,
      signedAt: new Date(),
    },
    include: {
      property: true,
      tenant: true,
    },
  });
}

/**
 * List leases for the current user (as tenant or landlord).
 */
export async function getMyLeases(cognitoSub: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });

  return prisma.lease.findMany({
    where: {
      OR: [
        { tenantId: user.id },
        { property: { ownerId: user.id } },
      ],
    },
    include: {
      property: {
        include: { images: { orderBy: { order: 'asc' }, take: 1 } },
      },
      tenant: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get lease by ID.
 */
export async function getLeaseById(cognitoSub: string, leaseId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const lease = await prisma.lease.findUniqueOrThrow({
    where: { id: leaseId },
    include: {
      property: {
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          owner: true,
        },
      },
      tenant: true,
    },
  });

  // Must be tenant or landlord
  if (lease.tenantId !== user.id && lease.property.ownerId !== user.id) {
    throw Object.assign(new Error('No tienes acceso a este contrato'), { statusCode: 403 });
  }

  return lease;
}

/**
 * End a lease (landlord only).
 */
export async function endLease(cognitoSub: string, leaseId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const lease = await prisma.lease.findUniqueOrThrow({
    where: { id: leaseId },
    include: { property: true },
  });

  if (lease.property.ownerId !== user.id) {
    throw Object.assign(new Error('Solo el arrendador puede finalizar contratos'), { statusCode: 403 });
  }

  if (lease.status !== 'ACTIVE') {
    throw Object.assign(new Error('Solo se pueden finalizar contratos activos'), { statusCode: 400 });
  }

  return prisma.lease.update({
    where: { id: leaseId },
    data: { status: 'ENDED' },
  });
}
