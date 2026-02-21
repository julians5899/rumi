import { getPrisma } from '../../lib/prisma';

export async function createRating(cognitoSub: string, data: Record<string, unknown>) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });

  if (user.id === data.ratedUserId) {
    throw Object.assign(new Error('No puedes calificarte a ti mismo'), { statusCode: 400 });
  }

  return prisma.rating.create({
    data: {
      raterId: user.id,
      ratedUserId: data.ratedUserId as string,
      context: data.context as 'LANDLORD' | 'TENANT' | 'ROOMMATE',
      score: data.score as number,
      comment: data.comment as string | undefined,
    },
  });
}

export async function getGivenRatings(cognitoSub: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  return prisma.rating.findMany({
    where: { raterId: user.id },
    include: { ratedUser: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getReceivedRatings(cognitoSub: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  return prisma.rating.findMany({
    where: { ratedUserId: user.id },
    include: { rater: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
}
