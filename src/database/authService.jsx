import { getDB } from "./db";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "@session_userId";

export const register = async (email, password) => {
  const db = await getDB();

  const existing = await db.getFirstAsync(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );
  if (existing) throw new Error("This email is already registered.");

  const result = await db.runAsync(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password]
  );

  const userId = result.lastInsertRowId;
  await AsyncStorage.setItem(SESSION_KEY, String(userId));
  return { id: userId, email };
};


export const login = async (email, password) => {
  const db = await getDB();

  const user = await db.getFirstAsync(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password]
  );
  if (!user) throw new Error("Incorrect email or password.");

  await AsyncStorage.setItem(SESSION_KEY, String(user.id));
  return user;
};


export const logout = async () => {
  await AsyncStorage.removeItem(SESSION_KEY);
};


export const getCurrentUser = async () => {
  const userId = await AsyncStorage.getItem(SESSION_KEY);
  if (!userId) return null;

  const db = await getDB();
  const user = await db.getFirstAsync(
    "SELECT * FROM users WHERE id = ?",
    [Number(userId)]
  );
  return user || null;
};


export const getCurrentUserId = async () => {
  const userId = await AsyncStorage.getItem(SESSION_KEY);
  return userId ? Number(userId) : null;
};