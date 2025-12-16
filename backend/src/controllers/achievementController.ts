import { Request, Response } from 'express';
import * as achievementService from '../services/achievementService';

export const getAchievements = async (req: Request, res: Response) => {
  try {
    const achievements = await achievementService.getActiveAchievements();
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAchievement = async (req: Request, res: Response) => {
  try {
    const achievement = await achievementService.createAchievement(req.body);
    res.status(201).json(achievement);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};