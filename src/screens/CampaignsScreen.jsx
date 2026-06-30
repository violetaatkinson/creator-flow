import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDB } from "../database/db";
import { auth } from "../firebase/firebaseConfig";
import { colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import NotificationBell from "../components/NotificationBell";
import CampaignCard from "../components/CampaignCard";
import CampaignCalendar from "../components/CampaignCalendar";
import CampaignHistory from "../components/CampaignHistory";

export default function CampaignsScreen({ navigation }) {
	const insets = useSafeAreaInsets();
	const [campaigns, setCampaigns] = useState([]);

	const loadCampaigns = useCallback(async () => {
		try {
			const db = await getDB();
			const uid = auth.currentUser.uid;
			const data = await db.getAllAsync(
				"SELECT * FROM campaigns WHERE userId = ? ORDER BY createdAt DESC",
				[uid],
			);
			setCampaigns(data);
		} catch (e) {
			console.log("Error loading campaigns:", e);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadCampaigns();
		}, [loadCampaigns]),
	);

	const handleEdit = useCallback((item) => {
		navigation.navigate("EditCampaign", { campaign: item });
	}, []);

	const active = campaigns.filter((c) => c.status !== "Completed");
	const completed = campaigns.filter((c) => c.status === "Completed");

	const getSubtitle = () => {
		const parts = [];
		const activeCount = campaigns.filter((c) => c.status === "Active").length;
		const pendingCount = campaigns.filter((c) => c.status === "Pending").length;
		const pausedCount = campaigns.filter((c) => c.status === "Paused").length;
		const completedCount = completed.length;
		if (activeCount) parts.push(`${activeCount} active`);
		if (pendingCount) parts.push(`${pendingCount} pending`);
		if (pausedCount) parts.push(`${pausedCount} paused`);
		if (completedCount) parts.push(`${completedCount} completed`);
		return parts.join(" · ");
	};

	return (
		<View style={styles.container}>
			<View style={[styles.header, { paddingTop: insets.top + 12 }]}>
				<TouchableOpacity
					style={styles.addBtn}
					onPress={() => navigation.navigate("CreateCampaign")}
				>
					<Text style={styles.addBtnText}>+ New</Text>
				</TouchableOpacity>
				{campaigns.length > 0 && (
					<Text style={styles.subtitle}>{getSubtitle()}</Text>
				)}
				<NotificationBell />
			</View>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				{active.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Active</Text>
						{active.map((item, index) => (
							<View key={item.id} style={styles.cardWrap}>
								<CampaignCard
									item={item}
									index={index}
									onEdit={handleEdit}
									onUpdate={loadCampaigns}
								/>
							</View>
						))}
					</View>
				)}

				{active.length === 0 && completed.length === 0 && (
					<View style={styles.emptyWrap}>
						<View style={styles.emptyIconWrap}>
							<Ionicons
								name="people-outline"
								size={36}
								color={colors.primary}
							/>
						</View>
						<Text style={styles.emptyText}>No campaigns yet</Text>
						<Text style={styles.emptySub}>
							Tap + New to create your first one
						</Text>
					</View>
				)}

				<CampaignCalendar campaigns={active} />

				{completed.length > 0 && <CampaignHistory campaigns={completed} />}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.backgroundScreen },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 12,
	},
	headerLeft: { flex: 1 },
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	subtitle: { fontSize: 16, color: colors.inactive, letterSpacing: 0.3 },
	addBtn: {
		backgroundColor: colors.backgroundBtn,
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderWidth: 1,
		borderColor: colors.btnBorder,
	},
	addBtnText: {
		color: colors.active,
		fontWeight: "700",
		fontSize: 14,
		letterSpacing: 0.3,
	},
	scrollContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 40 },
	section: { marginBottom: 12 },
	sectionTitle: {
		fontSize: 11,
		fontWeight: "600",
		color: colors.inactive,
		textTransform: "uppercase",
		letterSpacing: 0.8,
		marginBottom: 10,
	},
	cardWrap: { marginBottom: 8 },
	emptyWrap: { alignItems: "center", marginTop: 80, gap: 10 },
	emptyIconWrap: {
		width: 72,
		height: 72,
		borderRadius: 20,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	emptyText: {
		fontSize: 16,
		fontWeight: "700",
		color: colors.text,
		letterSpacing: 0.3,
	},
	emptySub: { fontSize: 13, color: colors.inactive, letterSpacing: 0.3 },
});
