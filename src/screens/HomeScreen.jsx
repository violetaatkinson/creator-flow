import { View, Text, ScrollView, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

import NotificationBell from "../components/NotificationBell";

export default function HomeScreen() {
	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Home</Text>
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
