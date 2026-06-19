import { Image, StyleSheet } from "react-native";
import logo from "../assets/logo.png";

export default function Logo({ size = 210 }) {
	return (
		<Image
			source={logo}
			style={[styles.logo,{ width: size, height: size }]}
		/>
	);
}

const styles = StyleSheet.create({
	logo: {
		resizeMode: "contain"
	},
});
