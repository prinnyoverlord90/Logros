import express from 'express';
import * as rewardController from '../controllers/rewardController';
import { validateReward } from '../middlewares/validation';

const router = express.Router();

router.get('/', rewardController.getRewards);
router.post('/', validateReward, rewardController.createReward);

export default router;