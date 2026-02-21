import { getPrisma } from '../../lib/prisma';

export async function getMatches(cognitoSub: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });

  const matches = await prisma.match.findMany({
    where: { OR: [{ user1Id: user.id }, { user2Id: user.id }] },
    orderBy: { createdAt: 'desc' },
  });

  const matchedUserIds = matches.map((m) => (m.user1Id === user.id ? m.user2Id : m.user1Id));
  const users = await prisma.user.findMany({
    where: { id: { in: matchedUserIds } },
    select: { id: true, firstName: true, lastName: true, avatarUrl: true, roommateProfile: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return matches.map((m) => {
    const matchedUserId = m.user1Id === user.id ? m.user2Id : m.user1Id;
    return { id: m.id, createdAt: m.createdAt, matchedUser: userMap.get(matchedUserId) || null };
  });
}

export async function unmatch(cognitoSub: string, matchId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const match = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
  if (match.user1Id !== user.id && match.user2Id !== user.id) {
    throw Object.assign(new Error('No tienes permiso para eliminar este match'), { statusCode: 403 });
  }
  await prisma.match.delete({ where: { id: matchId } });
}
