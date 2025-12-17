"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const users = await prisma.user.findMany({
            orderBy: { currentPoints: 'desc' },
            take: limit,
            select: { id: true, username: true, currentPoints: true, totalPoints: true }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getLeaderboard = getLeaderboard;
