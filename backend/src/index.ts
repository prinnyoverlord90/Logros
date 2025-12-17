import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import passport from 'passport';
import achievementsRouter from './routes/achievements';
import usersRouter from './routes/users';
import rewardsRouter from './routes/rewards';
import leaderboardRouter from './routes/leaderboard';
import { errorHandler } from './middlewares/errorHandler';
import jwt from 'jsonwebtoken';

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
// Load .env from project root but do not override existing env vars (allows Render's DATABASE_URL to take precedence)
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });
try {
  const parsed = dotenv.parse(fs.readFileSync(envPath));
  for (const [key, value] of Object.entries(parsed)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch (e) {
  // if file missing or unreadable, continue — dotenv already attempted to load
}
console.log('TWITCH_CLIENT_ID:', JSON.stringify(process.env.TWITCH_CLIENT_ID));
console.log('TWITCH_CLIENT_SECRET:', process.env.TWITCH_CLIENT_SECRET ? '***' : 'undefined');

const app = express();

app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'https://logrosvicky-f0agentn5-prinnyoverlord90s-projects.vercel.app'], credentials: true }));
app.use(express.json());
const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create session table if it doesn't exist
pgPool.query(`
  DROP TABLE IF EXISTS "session";
  CREATE TABLE "session" (
    "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
  );
  CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session"("expire");
`).catch(err => console.error('Error creating session table:', err));

app.use(session({ 
  secret: process.env.SESSION_SECRET || 'secret', 
  resave: false, 
  saveUninitialized: false,
  store: new (connectPgSimple(session))({ pool: pgPool }),
  cookie: { secure: true, httpOnly: true, sameSite: 'none' }
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
  const token = jwt.sign({ user: req.user }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?token=${token}`);
});
app.get('/auth/logout', (req, res) => {
  req.logout(() => res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173'));
});
app.get('/auth/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      res.json(decoded.user);
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    res.status(401).json({ error: 'No token' });
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