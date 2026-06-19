import { View, Text, StyleSheet, Image } from "react-native";
import EmailBtn from "../components/EmailBtn";
import Logo from "../components/Logo";
import { colors } from "../constants/colors";

export default function LoginScreen({ navigation }) {
	return (
		<View style={styles.container}>
			<Logo />
			<Text style={styles.sub}>Your influencer business, organized.</Text>
			<EmailBtn onPress={() => navigation.navigate("EmailAuth")} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
		alignItems: "center",
		justifyContent: "center",
		padding: 24,
	},
	sub: {
		fontSize: 15,
		color: colors.sub,
		marginTop: 6,
		marginBottom: 25,
		textAlign: "center",
		letterSpacing: 0.3,
	},
});
