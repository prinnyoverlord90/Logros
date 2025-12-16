import { Request, Response } from 'express';
import * as userService from '../services/userService';
import * as achievementService from '../services/achievementService';
import * as pointTransactionService from '../services/pointTransactionService';
import * as rewardService from '../services/rewardService';
import { sendAnnounce } from '../services/twitchChatService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;
    if (typeof username === 'string') {
      const users = await prisma.user.findMany({
        where: { username: { contains: username } }
      });
      res.json(users);
    } else {
      res.status(400).json({ error: 'Username query required' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const awardAchievement = async (req: Request, res: Response) => {
  try {
    const { id, achievementId } = req.params;
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const achievement = await achievementService.getAchievementById(achievementId);
    if (!achievement) return res.status(404).json({ error: 'Achievement not found' });
    // Check if already awarded and not repeatable
    if (!achievement.isRepeatable) {
      const existing = user.achievements.find(a => a.id === achievementId);
      if (existing) return res.status(400).json({ error: 'Achievement already awarded' });
    }
    // Award
    await prisma.userAchievement.create({ data: { userId: id, achievementId } });
    await userService.updateUserPoints(id, achievement.points);
    await pointTransactionService.createTransaction({ userId: id, type: 'earned', amount: achievement.points, reason: `Achievement: ${achievement.name}` });
    res.json({ message: 'Achievement awarded' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const redeemReward = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rewardId } = req.body;
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const reward = await rewardService.getRewardById(rewardId);
    if (!reward) return res.status(404).json({ error: 'Reward not found' });
    if (user.currentPoints < reward.cost) return res.status(400).json({ error: 'Insufficient points' });
    await userService.deductUserPoints(id, reward.cost);
    await pointTransactionService.createTransaction({ userId: id, type: 'spent', amount: reward.cost, reason: `Reward: ${reward.name}` });
    // Send announce to Twitch chat
    sendAnnounce(`${user.username} ha canjeado ${reward.name}`);
    // Trigger external action here
    res.json({ message: 'Reward redeemed' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};