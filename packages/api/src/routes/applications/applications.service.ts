import { getPrisma } from '../../lib/prisma';

export async function createApplication(cognitoSub: string, data: Record<string, unknown>) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
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
