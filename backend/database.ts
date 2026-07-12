import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';

const db = new Database('users.db');

// this function creates a table, if it already doesn't exist, and will give each user a number, 
//store their username, and their password hash, as well as what date and time they made their account
function initializeDatabase():void 
{
    db.exec(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    );
    console.log('Database initialized successfully');
}

function createTestUser():void
{
    const existingAdminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    if(!existingAdminUser)
    {
        const saltRounds = 10;//the measure of how complex the hash will be, 10 is standard
        const passwordHash = bcrypt.hashSync('password123',saltRounds);

        db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', passwordHash);

        console.log('Test user has been created, username: "admin", password: "password123"');
    }
}

initializeDatabase();
createTestUser();

export{db};
