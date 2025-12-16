import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
const SQLiteStore = SQLiteStoreFactory(session);
import passport from 'passport';
import achievementsRouter from './routes/achievements';
import usersRouter from './routes/users';
import rewardsRouter from './routes/rewards';
import leaderboardRouter from './routes/leaderboard';
import { errorHandler } from './middlewares/errorHandler';
import { connectTwitchChat } from './services/twitchChatService';
import { handleTwitchWebhook } from './services/twitchEventSubService';

declare module 'express-session' {
  interface SessionData {
    passport: any;
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      twitchId: string;
      currentPoints: number;
    }
  }
}

import path from 'path';
import fs from 'fs';
// Load .env from project root and override any existing env vars (ensures local .env takes precedence)
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });
try {
  const parsed = dotenv.parse(fs.readFileSync(envPath));
  Object.assign(process.env, parsed);
} catch (e) {
  // if file missing or unreadable, continue — dotenv already attempted to load
}
console.log('TWITCH_CLIENT_ID:', JSON.stringify(process.env.TWITCH_CLIENT_ID));
console.log('TWITCH_CLIENT_SECRET:', process.env.TWITCH_CLIENT_SECRET ? '***' : 'undefined');

const app = express();

app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());
app.use(session({ 
  secret: process.env.SESSION_SECRET || 'secret', 
  resave: false, 
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: '.' }) as any,
  cookie: { secure: false, httpOnly: true, sameSite: 'lax' }
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport config
import './config/passport';

app.use('/achievements', achievementsRouter);
app.use('/users', usersRouter);
app.use('/rewards', rewardsRouter);
app.use('/leaderboard', leaderboardRouter);

// Auth routes
app.get('/auth/twitch', passport.authenticate('twitch'));
app.get('/auth/twitch/callback', passport.authenticate('twitch', { failureRedirect: '/' }), (req, res) => {
  console.log('OAuth callback successful for user:', req.user);
  res.redirect('http://localhost:5173');
});
app.get('/auth/logout', (req, res) => {
  req.logout(() => res.redirect('http://localhost:5173'));
});
app.get('/auth/user', (req, res) => {
  console.log('Checking auth for user:', req.user);
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Webhook endpoint for Twitch EventSub
app.post('/webhooks/twitch', handleTwitchWebhook);

app.use(errorHandler);

// Connect to Twitch chat
connectTwitchChat();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;