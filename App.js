import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";

import TabNavigator from "./src/navigation/TabNavigator";



export default function App() {
	return (
		<NavigationContainer> {/* "router" — envuelve toda la app */}
			<StatusBar style="light" />
			<TabNavigator />
		</NavigationContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
