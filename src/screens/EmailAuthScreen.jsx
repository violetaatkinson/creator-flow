import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { login, register } from "../database/authService";

import { colors } from "../constants/colors";
import Logo from "../components/Logo";
import CustomInput from "../components/CustomInput";
import SignBtn from "../components/SignBtn";
import ErrorModal from "../components/ErrorModal";

export default function EmailAuthScreen({ navigation, onLogin }) {
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
		if (!email || !password) {
			showError("Please enter your email and password.");
			return;
		}
		try {
			let user;
			if (isLogin) {
				user = await login(email, password);
			} else {
				user = await register(email, password);
			}
			onLogin(user);
		} catch (error) {
			showError(error.message);
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
