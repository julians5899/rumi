import { getPrisma } from '../../lib/prisma';

export async function getConversations(cognitoSub: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participant1Id: user.id }, { participant2Id: user.id }] },
    include: {
      participant1: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      participant2: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
  });

  return conversations.map((c) => {
    const otherParticipant = c.participant1Id === user.id ? c.participant2 : c.participant1;
    const lastMessage = c.messages[0] || null;
    return {
      id: c.id,
      participant: otherParticipant,
      lastMessage: lastMessage
        ? { content: lastMessage.content, senderId: lastMessage.senderId, createdAt: lastMessage.createdAt }
        : null,
      createdAt: c.createdAt,
    };
  });
}

export async function getMessages(cognitoSub: string, conversationId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const conversation = await prisma.conversation.findUniqueOrThrow({ where: { id: conversationId } });
  if (conversation.participant1Id !== user.id && conversation.participant2Id !== user.id) {
    throw Object.assign(new Error('No tienes acceso a esta conversacion'), { statusCode: 403 });
  }
  return prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } });
}

export async function sendMessage(cognitoSub: string, conversationId: string, content: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const conversation = await prisma.conversation.findUniqueOrThrow({ where: { id: conversationId } });
  if (conversation.participant1Id !== user.id && conversation.participant2Id !== user.id) {
    throw Object.assign(new Error('No tienes acceso a esta conversacion'), { statusCode: 403 });
  }
  const [message] = await prisma.$transaction([
    prisma.message.create({ data: { conversationId, senderId: user.id, content } }),
    prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } }),
  ]);
  return message;
}
