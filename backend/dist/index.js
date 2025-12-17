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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load .env from project root and override any existing env vars (ensures local .env takes precedence)
const envPath = path_1.default.join(__dirname, '..', '..', '.env');
dotenv_1.default.config({ path: envPath });
try {
    const parsed = dotenv_1.default.parse(fs_1.default.readFileSync(envPath));
    Object.assign(process.env, parsed);
}
catch (e) {
    // if file missing or unreadable, continue — dotenv already attempted to load
}
console.log('TWITCH_CLIENT_ID:', JSON.stringify(process.env.TWITCH_CLIENT_ID));
console.log('TWITCH_CLIENT_SECRET:', process.env.TWITCH_CLIENT_SECRET ? '***' : 'undefined');
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express_1.default.json());
const pgPool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: new ((0, connect_pg_simple_1.default)(express_session_1.default))({ pool: pgPool }),
    cookie: { secure: false, httpOnly: true, sameSite: 'lax' }
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
    res.redirect('http://localhost:5173');
});
app.get('/auth/logout', (req, res) => {
    req.logout(() => res.redirect('http://localhost:5173'));
});
app.get('/auth/user', (req, res) => {
    console.log('Checking auth for user:', req.user);
    if (req.user) {
        res.json(req.user);
    }
    else {
        res.status(401).json({ error: 'Not authenticated' });
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
