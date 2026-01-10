/**
 * Database Connection Module
 * Manages SQLite database connection using sqlite3
 */

const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const path = require('path');

// Database file path
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'recipes.db');

// Initialize database connection
let db;

try {
    db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('❌ Failed to connect to database:', err);
            process.exit(1);
        }
        console.log(`✅ Connected to SQLite database: ${DB_PATH}`);
    });

    // Enable foreign key constraints
    db.run('PRAGMA foreign_keys = ON');

    // Promisify database methods for easier async/await usage
    db.runAsync = promisify(db.run.bind(db));
    db.getAsync = promisify(db.get.bind(db));
    db.allAsync = promisify(db.all.bind(db));
    db.execAsync = promisify(db.exec.bind(db));

} catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
}

// Graceful shutdown
process.on('exit', () => {
    if (db) {
        db.close();
        console.log('📁 Database connection closed');
    }
});

process.on('SIGINT', () => {
    if (db) {
        db.close();
        console.log('📁 Database connection closed');
    }
    process.exit(0);
});

module.exports = db;
