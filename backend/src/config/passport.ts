import passport from 'passport';
// @ts-ignore
import { Strategy as TwitchStrategy } from 'passport-twitch-new';
import { PrismaClient } from '@prisma/client';
import * as userService from '../services/userService';

const prisma = new PrismaClient();

if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET) {
  passport.use(new TwitchStrategy({
    clientID: process.env.TWITCH_CLIENT_ID!,
    clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    callbackURL: 'http://localhost:3000/auth/twitch/callback',
    scope: ['user:read:email']
  }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
    console.log('Twitch profile:', profile);
    try {
      let user = await userService.getUserByTwitchId(profile.id);
      if (!user) {
        user = await userService.createUser({ twitchId: profile.id, username: profile.login });
      }
      done(null, { id: user.id, username: user.username, twitchId: user.twitchId, currentPoints: user.currentPoints });
    } catch (error) {
      console.error('Error in passport verify:', error);
      done(error);
    }
  }));
} else {
  console.log('Twitch credentials not found');
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  console.log('Deserializing user id:', id);
  try {
    const user = await userService.getUserById(id);
    if (user) {
      done(null, { id: user.id, username: user.username, twitchId: user.twitchId, currentPoints: user.currentPoints });
    } else {
      done(null, null);
    }
  } catch (error) {
    done(error);
  }
});