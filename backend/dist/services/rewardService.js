"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReward = exports.getRewardById = exports.getActiveRewards = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getActiveRewards = async () => {
    return prisma.reward.findMany({ where: { isActive: true } });
};
exports.getActiveRewards = getActiveRewards;
const getRewardById = async (id) => {
    return prisma.reward.findUnique({ where: { id } });
};
exports.getRewardById = getRewardById;
const createReward = async (data) => {
    return prisma.reward.create({ data });
};
exports.createReward = createReward;
