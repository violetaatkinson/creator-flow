import { getDB } from "../database/db";
import { getCurrentUserId } from "../database/authService";

const alreadyExists = async (db, userId, type, campaignId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const row = await db.getFirstAsync(
    `SELECT id FROM notifications 
     WHERE userId = ? AND type = ? AND campaignId = ? AND createdAt >= ?`,
    [userId, type, campaignId, todayStr]
  );
  return !!row;
};

export const createNotification = async ({
  userId, type, message, detail = null, campaignId = null, amount = null,
}) => {
  try {
    const db = await getDB();
    const exists = campaignId ? await alreadyExists(db, userId, type, campaignId) : false;
    if (exists) return;

    await db.runAsync(
      `INSERT INTO notifications (userId, type, message, detail, campaignId, amount, read, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [userId, type, message, detail, campaignId, amount ?? null, new Date().toISOString()]
    );
  } catch (e) {
    console.log("Notification error:", e);
  }
};