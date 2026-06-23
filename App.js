import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initDB } from "./src/database/db";
import { getCurrentUser } from "./src/database/authService";
import { colors } from "./src/constants/colors";

import TabNavigator from "./src/navigation/TabNavigator";
import LoginScreen from "./src/screens/LoginScreen";
import EmailAuthScreen from "./src/screens/EmailAuthScreen";
import CreateCampaignScreen from "./src/screens/CreateCampaignsScreen";
import EditCampaignScreen from "./src/screens/EditCampaignScreen";
import AddExpenseScreen from "./src/screens/AddExpenseScreen";

const Stack = createNativeStackNavigator();

export default function App() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const init = async () => {
			try {
				await initDB();
				const currentUser = await getCurrentUser();
				setUser(currentUser);
			} catch (e) {
				console.log("Init error:", e);
			} finally {
				setLoading(false);
			}
		};
		init();
	}, []);

	if (loading) {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: colors.backgroundScreen,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<ActivityIndicator color={colors.active} size="large" />
			</View>
		);
	}

	return (
		<SafeAreaProvider>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<NavigationContainer>
					<StatusBar style="light" />
					<Stack.Navigator screenOptions={{ headerShown: false }}>
						{user ? (
							<>
								<Stack.Screen name="Main">
									{() => <TabNavigator onLogout={() => setUser(null)} />}
								</Stack.Screen>
								<Stack.Screen
									name="CreateCampaign"
									component={CreateCampaignScreen}
								/>
								<Stack.Screen
									name="EditCampaign"
									component={EditCampaignScreen}
								/>
								<Stack.Screen name="AddExpense" component={AddExpenseScreen} />
							</>
						) : (
							<>
								<Stack.Screen name="Login" component={LoginScreen} />
								<Stack.Screen name="EmailAuth">
									{(props) => <EmailAuthScreen {...props} onLogin={setUser} />}
								</Stack.Screen>
							</>
						)}
					</Stack.Navigator>
				</NavigationContainer>
			</GestureHandlerRootView>
		</SafeAreaProvider>
	);
}
