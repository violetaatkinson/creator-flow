import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("creatorflow.db");

export const getDB = () => db;

export const initDB = () => {
	return new Promise((resolve, reject) => {
		db.transaction(
			(tx) => {
				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS users (
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
          );`,
					[],
					() => console.log("users ok"),
					(_, e) => {
						console.log("users error", e);
						return false;
					},
				);
				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            brand TEXT NOT NULL,
            platform TEXT DEFAULT 'Instagram',
            type TEXT DEFAULT 'Post',
            date TEXT DEFAULT '',
            payment REAL DEFAULT 0,
            status TEXT DEFAULT 'Pending',
            createdAt TEXT DEFAULT ''
          );`,
					[],
					() => console.log("campaigns ok"),
					(_, e) => {
						console.log("campaigns error", e);
						return false;
					},
				);
				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            description TEXT DEFAULT '',
            amount REAL DEFAULT 0,
            category TEXT DEFAULT 'Other',
            date TEXT DEFAULT '',
            month INTEGER DEFAULT 0,
            year INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT ''
          );`,
					[],
					() => console.log("expenses ok"),
					(_, e) => {
						console.log("expenses error", e);
						return false;
					},
				);
				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            type TEXT DEFAULT '',
            message TEXT DEFAULT '',
            detail TEXT DEFAULT '',
            amount REAL,
            campaignId INTEGER,
            read INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT ''
          );`,
					[],
					() => console.log("notifications ok"),
					(_, e) => {
						console.log("notifications error", e);
						return false;
					},
				);
			},
			(error) => {
				console.log("initDB transaction error:", error);
				reject(error);
			},
			() => {
				console.log("initDB complete");
				resolve();
			},
		);
	});
};
