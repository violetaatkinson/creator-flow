import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useDispatch } from "react-redux";
import { store } from "./src/store/store";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/firebase/firebaseConfig";
import { initDB } from "./src/database/db";
import { loadMetrics } from "./src/store/metricsSlice";
import { colors } from "./src/constants/colors";

import TabNavigator from "./src/navigation/TabNavigator";
import LoginScreen from "./src/screens/LoginScreen";
import EmailAuthScreen from "./src/screens/EmailAuthScreen";
import CreateCampaignScreen from "./src/screens/CreateCampaignsScreen";
import EditCampaignScreen from "./src/screens/EditCampaignScreen";
import AddExpenseScreen from "./src/screens/AddExpenseScreen";
import MetricsScreen from "./src/screens/MetricsScreen";

const Stack = createNativeStackNavigator();

function AppNavigator() {
	const dispatch = useDispatch();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		initDB().catch((e) => console.log("initDB error:", e));

		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			setUser(firebaseUser);
			setLoading(false);

			
			if (firebaseUser) {
				dispatch(loadMetrics());
			}
		});
		return unsubscribe;
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
						<Stack.Screen name="EditCampaign" component={EditCampaignScreen} />
						<Stack.Screen name="AddExpense" component={AddExpenseScreen} />
						<Stack.Screen name="Metrics" component={MetricsScreen} />
					</>
				) : (
					<>
						<Stack.Screen name="Login" component={LoginScreen} />
						<Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export default function App() {
	return (
		<Provider store={store}>
			<SafeAreaProvider>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<AppNavigator />
				</GestureHandlerRootView>
			</SafeAreaProvider>
		</Provider>
	);
}
