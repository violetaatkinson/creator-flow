import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

import HomeScreen from "../screens/HomeScreen";
import CampaignsScreen from "../screens/CampaignsScreen";
import FinanceScreen from "../screens/FinanceScreen";
import ProfileScreen from "../screens/ProfileScreen";
import NotificationScreen from "../screens/NotificationScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator({ onLogout }) {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: colors.surface,
					borderTopColor: colors.border,
					borderTopWidth: 1,
					paddingTop: 10,
					paddingBottom: 10,
					height: 70,
				},
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.inactive,
			}}
		>
			<Tab.Screen
				name="Home"
				component={HomeScreen}
				options={{
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="grid-outline" size={size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="Campaigns"
				component={CampaignsScreen}
				options={{
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="people-outline" size={size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="Finances"
				component={FinanceScreen}
				options={{
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="wallet-outline" size={size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="Profile"
				options={{
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person-outline" size={size} color={color} />
					),
				}}
			>
				{(props) => <ProfileScreen {...props} onLogout={onLogout} />}
			</Tab.Screen>
			<Tab.Screen
				name="Notifications"
				component={NotificationScreen}
				options={{
					tabBarButton: () => null,
				}}
			/>
		</Tab.Navigator>
	);
}
