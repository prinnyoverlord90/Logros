"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.incrementMessageCount = exports.incrementEmoteCount = exports.deductUserPoints = exports.updateUserPoints = exports.createUser = exports.getUserByTwitchId = exports.getUserById = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            achievements: {
                include: { achievement: true }
            }
        }
    });
    if (!user)
        return null;
    // Group achievements by achievementId and count
    const achievementMap = new Map();
    user.achievements.forEach(ua => {
        const achId = ua.achievementId;
        if (achievementMap.has(achId)) {
            achievementMap.get(achId).count += 1;
        }
        else {
            achievementMap.set(achId, {
                ...ua.achievement,
                count: 1,
                awardedAt: ua.awardedAt // use the first one
            });
        }
    });
    return {
        ...user,
        achievements: Array.from(achievementMap.values())
    };
};
exports.getUserById = getUserById;
const getUserByTwitchId = async (twitchId) => {
    return prisma.user.findUnique({ where: { twitchId } });
};
exports.getUserByTwitchId = getUserByTwitchId;
const createUser = async (data) => {
    return prisma.user.create({ data });
};
exports.createUser = createUser;
const updateUserPoints = async (id, points) => {
    return prisma.user.update({
        where: { id },
        data: { currentPoints: { increment: points }, totalPoints: { increment: points } }
    });
};
exports.updateUserPoints = updateUserPoints;
const deductUserPoints = async (id, points) => {
    return prisma.user.update({
        where: { id },
        data: { currentPoints: { decrement: points } }
    });
};
exports.deductUserPoints = deductUserPoints;
const incrementEmoteCount = async (id, count) => {
    return prisma.user.update({
        where: { id },
        data: { emoteCount: { increment: count } }
    });
};
exports.incrementEmoteCount = incrementEmoteCount;
const incrementMessageCount = async (id) => {
    return prisma.user.update({
        where: { id },
        data: { messageCount: { increment: 1 } }
    });
};
exports.incrementMessageCount = incrementMessageCount;
const deleteUser = async (id) => {
    // Delete related data first
    await prisma.userAchievement.deleteMany({ where: { userId: id } });
    await prisma.pointTransaction.deleteMany({ where: { userId: id } });
    return prisma.user.delete({ where: { id } });
};
exports.deleteUser = deleteUser;
