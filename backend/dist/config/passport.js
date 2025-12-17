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
const passport_1 = __importDefault(require("passport"));
// @ts-ignore
const passport_twitch_new_1 = require("passport-twitch-new");
const client_1 = require("@prisma/client");
const userService = __importStar(require("../services/userService"));
const prisma = new client_1.PrismaClient();
if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET) {
    passport_1.default.use(new passport_twitch_new_1.Strategy({
        clientID: process.env.TWITCH_CLIENT_ID,
        clientSecret: process.env.TWITCH_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/twitch/callback',
        scope: ['user:read:email']
    }, async (accessToken, refreshToken, profile, done) => {
        console.log('Twitch profile:', profile);
        try {
            let user = await userService.getUserByTwitchId(profile.id);
            if (!user) {
                user = await userService.createUser({ twitchId: profile.id, username: profile.login });
            }
            done(null, { id: user.id, username: user.username, twitchId: user.twitchId, currentPoints: user.currentPoints });
        }
        catch (error) {
            console.error('Error in passport verify:', error);
            done(error);
        }
    }));
}
else {
    console.log('Twitch credentials not found');
}
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    console.log('Deserializing user id:', id);
    try {
        const user = await userService.getUserById(id);
        if (user) {
            done(null, { id: user.id, username: user.username, twitchId: user.twitchId, currentPoints: user.currentPoints });
        }
        else {
            done(null, null);
        }
    }
    catch (error) {
        done(error);
    }
});
