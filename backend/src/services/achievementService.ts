import { PrismaClient } from '@prisma/client';
import * as twitchChatService from './twitchChatService';

const prisma = new PrismaClient();

export const getActiveAchievements = async () => {
  return prisma.achievement.findMany({ where: { isActive: true } });
};

export const createAchievement = async (data: { name: string; description: string; points: number; category: string }) => {
  return prisma.achievement.create({ data });
};

export const getAchievementById = async (id: string) => {
  return prisma.achievement.findUnique({ where: { id } });
};

export const assignAchievementToUser = async (userId: string, achievementName: string) => {
  const achievement = await prisma.achievement.findFirst({ where: { name: achievementName } });
  if (!achievement) throw new Error('Achievement not found');

  if (!achievement.isRepeatable) {
    const existing = await prisma.userAchievement.findFirst({ where: { userId, achievementId: achievement.id } });
    if (existing) return; // already has
  }

  await prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } });
  // Also update points and transaction
  const userService = await import('./userService');
  const pointTransactionService = await import('./pointTransactionService');
  await userService.updateUserPoints(userId, achievement.points);
  await pointTransactionService.createTransaction({ userId, type: 'earned', amount: achievement.points, reason: `Achievement: ${achievement.name}` });

  // Send message to chat
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    twitchChatService.sendAnnounce(`¡@${user.username} ha ganado el logro '${achievement.name}'!`);
  }
};

export const userHasAchievement = async (userId: string, achievementName: string): Promise<boolean> => {
  const achievement = await prisma.achievement.findFirst({ where: { name: achievementName } });
  if (!achievement) return false;

  const existing = await prisma.userAchievement.findFirst({ where: { userId, achievementId: achievement.id } });
  return !!existing;
};