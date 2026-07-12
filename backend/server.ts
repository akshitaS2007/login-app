import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import path from 'path';
import { db } from './database';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'frontend')));

app.use(session({
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

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as { id: number, username: string, password_hash: string } | undefined;

    if (!user) {
        res.json({ success: false, message: 'Invalid username or password' });
        return;
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);

    if (!passwordMatch) {
        res.json({ success: false, message: 'Invalid username or password' });
        return;
    }

    (req.session as any).username = username;
    res.json({ success: true, username: username });
});

app.get('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

app.get('/api/session', (req, res) => {
    if ((req.session as any).username) {
        res.json({ loggedIn: true, username: (req.session as any).username });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

