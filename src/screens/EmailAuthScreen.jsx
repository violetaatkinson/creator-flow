import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

import { colors } from "../constants/colors";

import CustomInput from "../components/CustomInput";
import SignBtn from "../components/SignBtn";
import ErrorModal from "../components/ErrorModal";

export default function EmailAuthScreen({ navigation }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLogin, setIsLogin] = useState(false);

	const [errorVisible, setErrorVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const showError = (message) => {
		setErrorMessage(message);
		setErrorVisible(true);
	};

	const handleSubmit = async () => {
		try {
			if (isLogin) {
				await signInWithEmailAndPassword(auth, email, password);
			} else {
				await createUserWithEmailAndPassword(auth, email, password);
			}
			
		} catch (error) {
			console.log("CODE:", error.code);
			console.log("MESSAGE:", error.message);

			if (error.code === "auth/invalid-email") {
				showError("Please enter a valid email.");
			} else if (error.code === "auth/wrong-password") {
				showError("Incorrect password.");
			} else if (error.code === "auth/user-not-found") {
				showError("No account found with this email.");
			} else if (error.code === "auth/email-already-in-use") {
				showError("This email is already registered.");
			} else {
				showError("Something went wrong. Please try again.");
			}
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>
				{isLogin ? "Welcome back" : "Create account"}
			</Text>

			<CustomInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
			/>
			<CustomInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>

			<SignBtn title={isLogin ? "Sign in" : "Sign up"} onPress={handleSubmit} />

			<TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
				<Text style={styles.toggle}>
					{isLogin ? "No account? Sign up" : "Have an account? Sign in"}
				</Text>
			</TouchableOpacity>

			<ErrorModal
				visible={errorVisible}
				message={errorMessage}
				onClose={() => setErrorVisible(false)}
			/>
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

	toggle: {
		textAlign: "center",
		color: colors.toggle,
		fontSize: 14,
		marginTop: 12,
	},
});
