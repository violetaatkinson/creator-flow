import { View, Text, ScrollView, StyleSheet } from "react-native";

import NotificationBell from "../components/NotificationBell";
import { colors } from "../constants/colors";

export default function ProfileScreen() {
	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Profile</Text>
				<NotificationBell />
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.backgroundScreen },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		marginTop: 35,
	},
	title: { color: colors.text, fontSize: 24, fontWeight: "800" },
});
