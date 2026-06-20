import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const alreadyExists = async (userId, type, campaignId) => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const q = query(
		collection(db, "notifications"),
		where("userId", "==", userId),
		where("type", "==", type),
		where("campaignId", "==", campaignId),
	);
	const snap = await getDocs(q);
	return snap.docs.some((d) => d.data().createdAt?.toDate() >= today);
};

export const createNotification = async ({
  userId, type, message, detail = null, campaignId = null, amount = null,
}) => {
  try {
    const exists = campaignId ? await alreadyExists(userId, type, campaignId) : false;
    if (exists) return;
    await addDoc(collection(db, "notifications"), {
      userId, type, message, detail, campaignId, amount: amount || null,
      read: false, createdAt: new Date(),
    });
  } catch (e) {
    console.log("Notification error:", e);
  }
};
