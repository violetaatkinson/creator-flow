import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import NotificationBell from "../components/NotificationBell";

export default function HomeScreen() {
	const insets = useSafeAreaInsets();

	return (
		<ScrollView style={styles.container}>
			<View style={[styles.header, { paddingTop: insets.top + 12 }]}>
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
		paddingHorizontal: 20,
		paddingBottom: 12,
	},
	title: { color: colors.text, fontSize: 24, fontWeight: "800" },
});
