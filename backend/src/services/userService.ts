import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ 
    where: { id }, 
    include: { 
      achievements: {
        include: { achievement: true }
      } 
    } 
  });
  if (!user) return null;

  // Group achievements by achievementId and count
  const achievementMap = new Map();
  user.achievements.forEach(ua => {
    const achId = ua.achievementId;
    if (achievementMap.has(achId)) {
      achievementMap.get(achId).count += 1;
    } else {
      achievementMap.set(achId, {
        ...ua.achievement,
        count: 1,
        awardedAt: ua.awardedAt // use the first one
      });
    }
  });

  return {
    ...user,
    achievements: Array.from(achievementMap.values())
  };
};

export const getUserByTwitchId = async (twitchId: string) => {
  return prisma.user.findUnique({ where: { twitchId } });
};

export const createUser = async (data: { twitchId: string; username: string }) => {
  return prisma.user.create({ data });
};

export const updateUserPoints = async (id: string, points: number) => {
  return prisma.user.update({
    where: { id },
    data: { currentPoints: { increment: points }, totalPoints: { increment: points } }
  });
};

export const deductUserPoints = async (id: string, points: number) => {
  return prisma.user.update({
    where: { id },
    data: { currentPoints: { decrement: points } }
  });
};

export const incrementEmoteCount = async (id: string, count: number) => {
  return prisma.user.update({
    where: { id },
    data: { emoteCount: { increment: count } }
  });
};

export const incrementMessageCount = async (id: string) => {
  return prisma.user.update({
    where: { id },
    data: { messageCount: { increment: 1 } }
  });
};

export const deleteUser = async (id: string) => {
  // Delete related data first
  await prisma.userAchievement.deleteMany({ where: { userId: id } });
  await prisma.pointTransaction.deleteMany({ where: { userId: id } });
  return prisma.user.delete({ where: { id } });
};