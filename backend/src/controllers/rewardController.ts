import { Request, Response } from 'express';
import * as rewardService from '../services/rewardService';

export const getRewards = async (req: Request, res: Response) => {
  try {
    const rewards = await rewardService.getActiveRewards();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createReward = async (req: Request, res: Response) => {
  try {
    const reward = await rewardService.createReward(req.body);
    res.status(201).json(reward);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};