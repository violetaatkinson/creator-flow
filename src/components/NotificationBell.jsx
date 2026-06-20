import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { colors } from "../constants/colors";

export default function NotificationBell() {
	const navigation = useNavigation();
	const [hasUnread, setHasUnread] = useState(false);

	useEffect(() => {
		const q = query(
			collection(db, "notifications"),
			where("userId", "==", auth.currentUser.uid),
			where("read", "==", false),
		);
		return onSnapshot(q, (snap) => {
			setHasUnread(snap.docs.length > 0);
		});
	}, []);

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
