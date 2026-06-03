import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

import CustomInput from "../components/CustomInput";
import { colors } from "../constants/colors";
import SignBtn from "../components/SignBtn";

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
	
	toggle: {
		textAlign: "center",
		color: colors.toggle,
		fontSize: 14,
		marginTop: 12,
	},
});
