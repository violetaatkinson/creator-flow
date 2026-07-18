import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { getDB } from "../database/db";
import { auth } from "../firebase/firebaseConfig";
import { colors } from "../constants/colors";

export default function NotificationBell() {
	const navigation = useNavigation();
	const [hasUnread, setHasUnread] = useState(false);

	useFocusEffect(
		useCallback(() => {
			const checkUnread = async () => {
				try {
					const db = await getDB();
					const uid = auth.currentUser?.uid;
					if (!uid) return;
					const result = await db.getFirstAsync(
						"SELECT id FROM notifications WHERE userId = ? AND read = 0 LIMIT 1",
						[uid],
					);
					setHasUnread(!!result);
				} catch (e) {
					console.log("NotificationBell error:", e);
				}
			};
			checkUnread();
		}, []),
	);

	return (
		<TouchableOpacity
			style={styles.bellBtn}
			onPress={() => navigation.navigate("Notifications")}
		>
			<Ionicons name="notifications-outline" size={22} color={colors.primary} />
			{hasUnread && <View style={styles.dot} />}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	bellBtn: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: "center",
		justifyContent: "center",
	},
	dot: {
		position: "absolute",
		top: 6,
		right: 6,
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.paused,
		borderWidth: 1.5,
		borderColor: colors.backgroundScreen,
	},
});
