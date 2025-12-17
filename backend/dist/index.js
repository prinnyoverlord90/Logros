"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const pg_1 = require("pg");
const passport_1 = __importDefault(require("passport"));
const achievements_1 = __importDefault(require("./routes/achievements"));
const users_1 = __importDefault(require("./routes/users"));
const rewards_1 = __importDefault(require("./routes/rewards"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const errorHandler_1 = require("./middlewares/errorHandler");
const twitchChatService_1 = require("./services/twitchChatService");
const twitchEventSubService_1 = require("./services/twitchEventSubService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load .env from project root but do not override existing env vars (allows Render's DATABASE_URL to take precedence)
const envPath = path_1.default.join(__dirname, '..', '..', '.env');
dotenv_1.default.config({ path: envPath });
try {
    const parsed = dotenv_1.default.parse(fs_1.default.readFileSync(envPath));
    for (const [key, value] of Object.entries(parsed)) {
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}
catch (e) {
    // if file missing or unreadable, continue — dotenv already attempted to load
}
console.log('TWITCH_CLIENT_ID:', JSON.stringify(process.env.TWITCH_CLIENT_ID));
console.log('TWITCH_CLIENT_SECRET:', process.env.TWITCH_CLIENT_SECRET ? '***' : 'undefined');
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: ['http://localhost:5173', 'http://localhost:5174', 'https://logrosvicky-f0agentn5-prinnyoverlord90s-projects.vercel.app'], credentials: true }));
app.use(express_1.default.json());
const pgPool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
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
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: new ((0, connect_pg_simple_1.default)(express_session_1.default))({ pool: pgPool }),
    cookie: { secure: true, httpOnly: true, sameSite: 'none' }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Passport config
require("./config/passport");
app.use('/achievements', achievements_1.default);
app.use('/users', users_1.default);
app.use('/rewards', rewards_1.default);
app.use('/leaderboard', leaderboard_1.default);
// Auth routes
app.get('/auth/twitch', passport_1.default.authenticate('twitch'));
app.get('/auth/twitch/callback', passport_1.default.authenticate('twitch', { failureRedirect: '/' }), (req, res) => {
    console.log('OAuth callback successful for user:', req.user);
    const token = jsonwebtoken_1.default.sign({ user: req.user }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?token=${token}`);
});
app.get('/auth/logout', (req, res) => {
    req.logout(() => res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173'));
});
app.get('/auth/user', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            res.json(decoded.user);
        }
        catch (err) {
            res.status(401).json({ error: 'Invalid token' });
        }
    }
    else {
        res.status(401).json({ error: 'No token' });
    }
});
// Webhook endpoint for Twitch EventSub
app.post('/webhooks/twitch', twitchEventSubService_1.handleTwitchWebhook);
app.use(errorHandler_1.errorHandler);
// Connect to Twitch chat
(0, twitchChatService_1.connectTwitchChat)();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
