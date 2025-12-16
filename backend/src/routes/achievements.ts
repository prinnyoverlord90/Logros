import express from 'express';
import * as achievementController from '../controllers/achievementController';
import { validateAchievement } from '../middlewares/validation';

const router = express.Router();

router.get('/', achievementController.getAchievements);
router.post('/', validateAchievement, achievementController.createAchievement);

export default router;