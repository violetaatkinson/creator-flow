import { View, Text, TextInput, StyleSheet, TouchableOpacity,Alert } from "react-native";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

import { colors } from "../constants/colors";

export default function EmailAuthScreen({ navigation }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLogin, setIsLogin] = useState(false);

	const handleSubmit = async () => {
		try {
			if (isLogin) {
				await signInWithEmailAndPassword(auth, email, password);
			} else {
				await createUserWithEmailAndPassword(auth, email, password);
			}
			navigation.replace("Main");
		} catch (error) {
			console.log("CODE:", error.code);
			console.log("MESSAGE:", error.message);
			Alert.alert(error.code, error.message);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>
				{isLogin ? "Welcome back" : "Create account"}
			</Text>

			<TextInput
				style={styles.input}
				placeholder="Email"
				placeholderTextColor={colors.placeHolder}
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
			/>
			<TextInput
				style={styles.input}
				placeholder="Password"
				placeholderTextColor={colors.placeHolder}
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>

			<TouchableOpacity style={styles.btn} onPress={handleSubmit}>
				<Text style={styles.btnText}>{isLogin ? "Sign in" : "Sign up"}</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
				<Text style={styles.toggle}>
					 {isLogin ? "No account? Sign up" : "Have an account? Sign in"}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.backgroundScreen,
		padding: 24,
		justifyContent: "center",
	},
	title: {
		fontSize: 30,
		fontWeight: "800",
		color: colors.text,
		marginBottom: 30,
		letterSpacing: 0.3,
	},
	input: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		padding: 16,
		color: colors.text,
		fontSize: 15,
		borderWidth: 1,
		borderColor: colors.border,
		marginBottom: 16,
	},
	btn: {
		width: "100%",
		height: 62,
		backgroundColor: colors.backgroundBtn,
		borderRadius: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
		borderWidth: 1,
		borderColor: colors.btnBorder,
		marginTop: 6,
	},
	btnText: {
		fontSize: 16,
		fontWeight: "700",
		color: "#fff",
		letterSpacing: 0.3,
	},
	toggle: {
		textAlign: "center",
		color: colors.toggle,
		fontSize: 14,
		marginTop: 12,
	},
});
