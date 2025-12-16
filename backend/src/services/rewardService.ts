import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getActiveRewards = async () => {
  return prisma.reward.findMany({ where: { isActive: true } });
};

export const getRewardById = async (id: string) => {
  return prisma.reward.findUnique({ where: { id } });
};

export const createReward = async (data: { name: string; description: string; cost: number }) => {
  return prisma.reward.create({ data });
};