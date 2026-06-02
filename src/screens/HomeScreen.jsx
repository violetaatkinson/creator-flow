import {View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigationState } from "@react-navigation/native";

import { colors } from "../constants/colors";

export default function HomeScreen({ navigation }) {
	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Home</Text>
				<TouchableOpacity
					style={styles.bellBtn}
					onPress={() => navigation.navigate("Notifications")}
				>
					<Ionicons 
            name="notifications-outline" size={22} color={colors.active} />
				</TouchableOpacity>
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
