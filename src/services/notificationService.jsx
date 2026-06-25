import { getDB } from "../database/db";

export const createNotification = async ({
	userId,
	type,
	message,
	detail = null,
	campaignId = null,
	amount = null,
}) => {
	try {
		const db = await getDB();

		if (campaignId) {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const existing = await db.getFirstAsync(
				`SELECT id FROM notifications WHERE userId=? AND type=? AND campaignId=? AND createdAt >= ?`,
				[userId, type, campaignId, today.toISOString()],
			);
			if (existing) return;
		}

		await db.runAsync(
			`INSERT INTO notifications (userId, type, message, detail, campaignId, amount, read, createdAt)
			 VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
			[
				userId,
				type,
				message,
				detail,
				campaignId,
				amount ?? null,
				new Date().toISOString(),
			],
		);
	} catch (e) {
		console.log("Notification error:", e);
	}
};
