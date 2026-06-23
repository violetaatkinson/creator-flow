import * as SQLite from "expo-sqlite";

let db;

export const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("creatorflow.db");
  }
  return db;
};

export const initDB = async () => {
  const database = await getDB();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
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
      userId INTEGER NOT NULL,
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
      userId INTEGER NOT NULL,
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
      userId INTEGER NOT NULL,
      type TEXT DEFAULT '',
      message TEXT DEFAULT '',
      detail TEXT DEFAULT '',
      amount REAL,
      campaignId INTEGER,
      read INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT ''
    );
  `);
};