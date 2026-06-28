import * as SQLite from "expo-sqlite";

let db;

export const getDB = async () => {
	if (!db) {
		db = await SQLite.openDatabaseAsync("creatorflow");
	}
	return db;
};

export const initDB = async () => {
	const database = await getDB();
	await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY,
      name TEXT DEFAULT '',
      handle TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      instagram TEXT DEFAULT '',
      tiktok TEXT DEFAULT '',
      youtube TEXT DEFAULT '',
      photoUri TEXT DEFAULT '',
      updatedAt TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      brand TEXT NOT NULL,
      platform TEXT DEFAULT 'Instagram',
      type TEXT DEFAULT 'Post',
      date TEXT DEFAULT '',
      payment REAL DEFAULT 0,
      status TEXT DEFAULT 'Pending',
      createdAt TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      description TEXT DEFAULT '',
      amount REAL DEFAULT 0,
      category TEXT DEFAULT 'Other',
      date TEXT DEFAULT '',
      month INTEGER DEFAULT 0,
      year INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      type TEXT DEFAULT '',
      message TEXT DEFAULT '',
      detail TEXT DEFAULT '',
      amount REAL,
      campaignId INTEGER,
      read INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      platform TEXT NOT NULL,
      followers INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      updatedAt TEXT DEFAULT '',
      UNIQUE(userId, platform)
    );
  `);
};
