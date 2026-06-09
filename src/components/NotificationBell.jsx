import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../constants/colors";

export default function NotificationBell() {
	const navigation = useNavigation();

	return (
		<TouchableOpacity
			style={styles.bellBtn}
			onPress={() => navigation.navigate("Notifications")}
		>
			<Ionicons name="notifications-outline" size={22} color={colors.primary} />
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
});
