import {View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigationState } from "@react-navigation/native";


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
            name="notifications-outline" size={22} color="#b96eff" />
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#0b0b12" },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		marginTop: 35,
	},
	title: { color: "#f0eeff", fontSize: 24, fontWeight: "800" },
	bellBtn: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: "#1a1a28",
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.07)",
		alignItems: "center",
		justifyContent: "center",
	},
});
