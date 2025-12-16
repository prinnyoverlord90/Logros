import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateAchievement = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    points: Joi.number().integer().min(1).required(),
    category: Joi.string().required()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

export const validateReward = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    cost: Joi.number().integer().min(1).required()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    twitchId: Joi.string().required(),
    username: Joi.string().required()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

export const validateRedeem = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    rewardId: Joi.string().required()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};