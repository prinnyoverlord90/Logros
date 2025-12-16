import express from 'express';
import * as userController from '../controllers/userController';
import { validateRedeem, validateUser } from '../middlewares/validation';

const router = express.Router();

router.get('/', userController.getUsers);
router.post('/', validateUser, userController.createUser);
router.get('/:id', userController.getUser);
router.delete('/:id', userController.deleteUser);
router.post('/:id/achievements/:achievementId', userController.awardAchievement);
router.post('/:id/redeem', validateRedeem, userController.redeemReward);

export default router;