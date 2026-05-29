import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import CampaignsScreen from "../screens/CampaignsScreen";
import FinanceScreen from "../screens/FinanceScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: "#111119",
					borderTopColor: "rgba(255,255,255,0.07)",
					paddingTop: 10,
					paddingBottom: 10,
					height: 70,
				},
				tabBarActiveTintColor: "#b96eff",
				tabBarInactiveTintColor: "rgba(240,238,255,0.38)",
			}}
		>
			<Tab.Screen
				name="Inicio"
				component={HomeScreen}
				options={{
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="grid-outline" size={size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="Campañas"
				component={CampaignsScreen}
				options={{
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="people-outline" size={size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="Finanzas"
				component={FinanceScreen}
				options={{
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="wallet-outline" size={size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="Perfil"
				component={ProfileScreen}
				options={{
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person-outline" size={size} color={color} />
					),
				}}
			/>
		</Tab.Navigator>
	);
}
