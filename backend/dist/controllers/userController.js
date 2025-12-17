"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.redeemReward = exports.createUser = exports.awardAchievement = exports.getUser = exports.getUsers = void 0;
const userService = __importStar(require("../services/userService"));
const achievementService = __importStar(require("../services/achievementService"));
const pointTransactionService = __importStar(require("../services/pointTransactionService"));
const rewardService = __importStar(require("../services/rewardService"));
const twitchChatService_1 = require("../services/twitchChatService");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getUsers = async (req, res) => {
    try {
        const { username } = req.query;
        if (typeof username === 'string') {
            const users = await prisma.user.findMany({
                where: { username: { contains: username } }
            });
            res.json(users);
        }
        else {
            res.status(400).json({ error: 'Username query required' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUser = getUser;
const awardAchievement = async (req, res) => {
    try {
        const { id, achievementId } = req.params;
        const user = await userService.getUserById(id);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const achievement = await achievementService.getAchievementById(achievementId);
        if (!achievement)
            return res.status(404).json({ error: 'Achievement not found' });
        // Check if already awarded and not repeatable
        if (!achievement.isRepeatable) {
            const existing = user.achievements.find(a => a.id === achievementId);
            if (existing)
                return res.status(400).json({ error: 'Achievement already awarded' });
        }
        // Award
        await prisma.userAchievement.create({ data: { userId: id, achievementId } });
        await userService.updateUserPoints(id, achievement.points);
        await pointTransactionService.createTransaction({ userId: id, type: 'earned', amount: achievement.points, reason: `Achievement: ${achievement.name}` });
        res.json({ message: 'Achievement awarded' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.awardAchievement = awardAchievement;
const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createUser = createUser;
const redeemReward = async (req, res) => {
    try {
        const { id } = req.params;
        const { rewardId } = req.body;
        const user = await userService.getUserById(id);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const reward = await rewardService.getRewardById(rewardId);
        if (!reward)
            return res.status(404).json({ error: 'Reward not found' });
        if (user.currentPoints < reward.cost)
            return res.status(400).json({ error: 'Insufficient points' });
        await userService.deductUserPoints(id, reward.cost);
        await pointTransactionService.createTransaction({ userId: id, type: 'spent', amount: reward.cost, reason: `Reward: ${reward.name}` });
        // Send announce to Twitch chat
        (0, twitchChatService_1.sendAnnounce)(`${user.username} ha canjeado ${reward.name}`);
        // Trigger external action here
        res.json({ message: 'Reward redeemed' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.redeemReward = redeemReward;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id);
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteUser = deleteUser;
