import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const users = await prisma.user.findMany({
      orderBy: { currentPoints: 'desc' },
      take: limit,
      select: { id: true, username: true, currentPoints: true, totalPoints: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};