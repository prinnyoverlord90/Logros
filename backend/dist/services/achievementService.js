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
exports.userHasAchievement = exports.assignAchievementToUser = exports.getAchievementById = exports.createAchievement = exports.getActiveAchievements = void 0;
const client_1 = require("@prisma/client");
const twitchChatService = __importStar(require("./twitchChatService"));
const prisma = new client_1.PrismaClient();
const getActiveAchievements = async () => {
    return prisma.achievement.findMany({ where: { isActive: true } });
};
exports.getActiveAchievements = getActiveAchievements;
const createAchievement = async (data) => {
    return prisma.achievement.create({ data });
};
exports.createAchievement = createAchievement;
const getAchievementById = async (id) => {
    return prisma.achievement.findUnique({ where: { id } });
};
exports.getAchievementById = getAchievementById;
const assignAchievementToUser = async (userId, achievementName) => {
    const achievement = await prisma.achievement.findFirst({ where: { name: achievementName } });
    if (!achievement)
        throw new Error('Achievement not found');
    if (!achievement.isRepeatable) {
        const existing = await prisma.userAchievement.findFirst({ where: { userId, achievementId: achievement.id } });
        if (existing)
            return; // already has
    }
    await prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } });
    // Also update points and transaction
    const userService = await Promise.resolve().then(() => __importStar(require('./userService')));
    const pointTransactionService = await Promise.resolve().then(() => __importStar(require('./pointTransactionService')));
    await userService.updateUserPoints(userId, achievement.points);
    await pointTransactionService.createTransaction({ userId, type: 'earned', amount: achievement.points, reason: `Achievement: ${achievement.name}` });
    // Send message to chat
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
        twitchChatService.sendAnnounce(`¡@${user.username} ha ganado el logro '${achievement.name}'!`);
    }
};
exports.assignAchievementToUser = assignAchievementToUser;
const userHasAchievement = async (userId, achievementName) => {
    const achievement = await prisma.achievement.findFirst({ where: { name: achievementName } });
    if (!achievement)
        return false;
    const existing = await prisma.userAchievement.findFirst({ where: { userId, achievementId: achievement.id } });
    return !!existing;
};
exports.userHasAchievement = userHasAchievement;
