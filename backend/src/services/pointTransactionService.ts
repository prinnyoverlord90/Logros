import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTransaction = async (data: { userId: string; type: string; amount: number; reason: string }) => {
  return prisma.pointTransaction.create({ data });
};

export const getTotalBitsForUser = async (userId: string): Promise<number> => {
  const transactions = await prisma.pointTransaction.findMany({
    where: { userId, reason: 'Bits donados' }
  });
  return transactions.reduce((total, t) => total + t.amount, 0);
};