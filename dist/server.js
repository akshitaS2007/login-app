"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./database");
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'frontend')));
app.use((0, express_session_1.default)({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.json({ success: false, message: 'Username and password are required' });
        return;
    }
    const user = database_1.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
        res.json({ success: false, message: 'Invalid username or password' });
        return;
    }
    const passwordMatch = bcrypt_1.default.compareSync(password, user.password_hash);
    if (!passwordMatch) {
        res.json({ success: false, message: 'Invalid username or password' });
        return;
    }
    req.session.username = username;
    res.json({ success: true, username: username });
});
app.get('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});
app.get('/api/session', (req, res) => {
    if (req.session.username) {
        res.json({ loggedIn: true, username: req.session.username });
    }
    else {
        res.json({ loggedIn: false });
    }
});
app.get('/', (req, res) => {
    res.redirect('/login.html');
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
