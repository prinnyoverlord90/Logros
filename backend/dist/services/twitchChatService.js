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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTwitchToken = exports.sendAnnounce = exports.connectTwitchChat = void 0;
const tmi_js_1 = __importDefault(require("tmi.js"));
const userService = __importStar(require("./userService"));
const rewardService = __importStar(require("./rewardService"));
const pointTransactionService = __importStar(require("./pointTransactionService"));
const achievementService = __importStar(require("./achievementService"));
// use global fetch available in Node 18+, avoid node-fetch types issues
const sanitize = (v) => {
    if (!v)
        return '';
    // remove surrounding quotes if any
    return v.replace(/^"|"$/g, '').trim();
};
const envUsername = sanitize(process.env.TWITCH_USERNAME);
let envOauth = sanitize(process.env.TWITCH_OAUTH);
// Ensure oauth: prefix (some generators include it, some not)
if (envOauth && !envOauth.startsWith('oauth:') && !envOauth.startsWith('Bearer ')) {
    envOauth = `oauth:${envOauth}`;
}
const envChannel = sanitize(process.env.TWITCH_CHANNEL) || envUsername;
const client = new tmi_js_1.default.Client({
    options: { debug: true },
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: envUsername,
        password: envOauth
    },
    channels: [envChannel]
});
const connectTwitchChat = () => {
    // Add extra diagnostic listeners to capture authentication/login details
    client.on('connected', (addr, port) => {
        console.log(`[twitchChatService] connected to ${addr}:${port}`);
    });
    client.on('disconnected', (reason) => {
        console.error('[twitchChatService] disconnected:', reason);
    });
    client.on('reconnect', () => {
        console.warn('[twitchChatService] reconnecting...');
    });
    client.on('notice', (channel, msgid, message) => {
        // Twitch can send notices with login/auth errors
        console.warn('[twitchChatService] notice:', { channel, msgid, message });
    });
    client.on('connecting', (address, port) => {
        console.log('[twitchChatService] connecting to', address, port);
    });
    client.connect().catch(err => {
        console.error('[twitchChatService] connect error:', err && err.message ? err.message : err);
    });
    client.on('message', async (channel, tags, message, self) => {
        if (self)
            return;
        try {
            const twitchId = tags['user-id'];
            const username = tags['display-name'] || tags['username'] || 'unknown';
            // Find or create user
            let user = await userService.getUserByTwitchId(twitchId);
            if (!user) {
                user = await userService.createUser({ twitchId, username });
            }
            // Check first message
            const hasFirstMessage = await achievementService.userHasAchievement(user.id, 'Primer Mensaje');
            if (!hasFirstMessage) {
                await achievementService.assignAchievementToUser(user.id, 'Primer Mensaje');
            }
            // Check chat nocturno
            const now = new Date();
            const hour = now.getHours();
            if (hour >= 2 && hour < 6) {
                const hasChatNocturno = await achievementService.userHasAchievement(user.id, 'Chat Nocturno');
                if (!hasChatNocturno) {
                    await achievementService.assignAchievementToUser(user.id, 'Chat Nocturno');
                }
            }
            // Increment message count
            await userService.incrementMessageCount(user.id);
            // Check for message milestones
            const updatedUser = await userService.getUserById(user.id);
            const messageMilestones = [
                { count: 1, name: 'Chat 1 Mensaje' },
                { count: 5, name: 'Chat 5 Mensajes' },
                { count: 10, name: 'Chat 10 Mensajes' },
                { count: 50, name: 'Chat 50 Mensajes' },
                { count: 100, name: 'Chat 100 Mensajes' },
                { count: 1000, name: 'Chat 1000 Mensajes' },
                { count: 5000, name: 'Chat 5000 Mensajes' },
                { count: 10000, name: 'Chat 10000 Mensajes' },
                { count: 50000, name: 'Chat 50000 Mensajes' },
                { count: 100000, name: 'Chat 100000 Mensajes' },
                { count: 500000, name: 'Chat 500000 Mensajes' },
                { count: 1000000, name: 'Chat 1000000 Mensajes' },
                { count: 5000000, name: 'Chat 5000000 Mensajes' },
                { count: 10000000, name: 'Chat 10000000 Mensajes' },
                { count: 50000000, name: 'Chat 50000000 Mensajes' },
                { count: 100000000, name: 'Chat 100000000 Mensajes' },
            ];
            if (updatedUser) {
                for (const milestone of messageMilestones) {
                    if (updatedUser.messageCount === milestone.count) {
                        await achievementService.assignAchievementToUser(user.id, milestone.name);
                        break; // Since only one can match at a time
                    }
                }
            }
            // Count emotes
            let emoteCount = 0;
            if (tags.emotes) {
                // Twitch emotes
                Object.values(tags.emotes).forEach((positions) => {
                    emoteCount += positions.length;
                });
            }
            // Text emotes
            const textEmotes = message.match(/:\)|:\(|:D|;\)|<3|o_o|O_o|:\//g);
            if (textEmotes)
                emoteCount += textEmotes.length;
            if (emoteCount > 0) {
                await userService.incrementEmoteCount(user.id, emoteCount);
                // Check for emote milestones
                const updatedUser = await userService.getUserById(user.id);
                const emoteMilestones = [
                    { count: 1, name: 'Emote 1' },
                    { count: 5, name: 'Emote 5' },
                    { count: 10, name: 'Emote 10' },
                    { count: 25, name: 'Emote 25' },
                    { count: 50, name: 'Emote 50' },
                    { count: 100, name: 'Emote 100' },
                    { count: 250, name: 'Emote 250' },
                    { count: 500, name: 'Emote 500' },
                    { count: 1000, name: 'Emote 1000' },
                    { count: 5000, name: 'Emote 5000' },
                    { count: 10000, name: 'Emote 10000' },
                    { count: 50000, name: 'Emote 50000' },
                    { count: 100000, name: 'Emote 100000' },
                    { count: 500000, name: 'Emote 500000' },
                    { count: 1000000, name: 'Emote 1000000' },
                    { count: 5000000, name: 'Emote 5000000' },
                    { count: 10000000, name: 'Emote 10000000' },
                ];
                if (updatedUser) {
                    for (const milestone of emoteMilestones) {
                        if (updatedUser.emoteCount === milestone.count) {
                            await achievementService.assignAchievementToUser(user.id, milestone.name);
                            break; // Since only one can match at a time
                        }
                    }
                }
            }
            if (message.toLowerCase() === '!reto') {
                // Get cheapest active reward
                const rewards = await rewardService.getActiveRewards();
                if (rewards.length === 0)
                    return;
                const reward = rewards.reduce((prev, curr) => (prev.cost < curr.cost ? prev : curr));
                if (user.currentPoints >= reward.cost) {
                    await userService.deductUserPoints(user.id, reward.cost);
                    await pointTransactionService.createTransaction({ userId: user.id, type: 'spent', amount: reward.cost, reason: `!reto: ${reward.name}` });
                    // Send message to chat
                    client.say(channel, `${username} ha canjeado ${reward.name} por !reto!`);
                }
                else {
                    client.say(channel, `${username}, no tienes suficientes puntos para !reto.`);
                }
            }
        }
        catch (e) {
            console.error('[twitchChatService] error handling message:', e);
        }
    });
};
exports.connectTwitchChat = connectTwitchChat;
const sendAnnounce = (message) => {
    client.say(envChannel, message);
};
exports.sendAnnounce = sendAnnounce;
// Optional helper to validate token server-side (can be called from a route)
const validateTwitchToken = async () => {
    try {
        const token = sanitize(process.env.TWITCH_OAUTH).replace(/^oauth:/, '');
        if (!token)
            return { ok: false, error: 'No token configured' };
        const res = await globalThis.fetch('https://id.twitch.tv/oauth2/validate', {
            headers: { Authorization: `OAuth ${token}` }
        });
        if (res.status === 200) {
            const data = await res.json();
            return { ok: true, data };
        }
        const text = await res.text();
        return { ok: false, status: res.status, body: text };
    }
    catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
};
exports.validateTwitchToken = validateTwitchToken;
