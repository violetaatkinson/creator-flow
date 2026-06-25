import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import * as Yup from "yup";

import { colors } from "../constants/colors";
import Logo from "../components/Logo";
import CustomInput from "../components/CustomInput";
import SignBtn from "../components/SignBtn";
import ErrorModal from "../components/ErrorModal";

const authSchema = Yup.object().shape({
	email: Yup.string()
		.email("Please enter a valid email.")
		.required("Email is required."),
	password: Yup.string()
		.min(6, "Password must be at least 6 characters.")
		.required("Password is required."),
});

const getFirebaseError = (code) => {
	if (code === "auth/invalid-email") return "Please enter a valid email.";
	if (code === "auth/wrong-password") return "Incorrect password.";
	if (code === "auth/invalid-credential") return "Incorrect email or password.";
	if (code === "auth/user-not-found")
		return "No account found with this email.";
	if (code === "auth/email-already-in-use")
		return "This email is already registered.";
	if (code === "auth/weak-password")
		return "Password must be at least 6 characters.";
	return "Something went wrong. Please try again.";
};

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
			await authSchema.validate({ email, password });

			if (isLogin) {
				await signInWithEmailAndPassword(auth, email, password);
			} else {
				await createUserWithEmailAndPassword(auth, email, password);
			}
		} catch (error) {
			if (error.name === "ValidationError") {
				showError(error.message);
			} else {
				showError(getFirebaseError(error.code));
			}
		}
	};

	return (
		<View style={styles.container}>
			<Logo />
			<Text style={styles.title}>
				{isLogin ? "Welcome back" : "Create account"}
			</Text>

			<View style={styles.form}>
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
				<SignBtn
					title={isLogin ? "Sign in" : "Sign up"}
					onPress={handleSubmit}
				/>
			</View>

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
		alignItems: "center",
	},
	title: {
		fontSize: 30,
		fontWeight: "800",
		color: colors.text,
		marginBottom: 25,
		letterSpacing: 0.3,
		textAlign: "center",
	},
	toggle: {
		textAlign: "center",
		color: colors.toggle,
		fontSize: 14,
		marginTop: 12,
	},
	form: {
		width: "100%",
	},
});
