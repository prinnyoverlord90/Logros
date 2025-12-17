"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalBitsForUser = exports.createTransaction = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createTransaction = async (data) => {
    return prisma.pointTransaction.create({ data });
};
exports.createTransaction = createTransaction;
const getTotalBitsForUser = async (userId) => {
    const transactions = await prisma.pointTransaction.findMany({
        where: { userId, reason: 'Bits donados' }
    });
    return transactions.reduce((total, t) => total + t.amount, 0);
};
exports.getTotalBitsForUser = getTotalBitsForUser;
