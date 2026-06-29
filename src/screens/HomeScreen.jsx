import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { getDB } from "../database/db";
import { auth } from "../firebase/firebaseConfig";
import { colors, plataforms } from "../constants/colors";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import NotificationBell from "../components/NotificationBell";
import CampaignChart from "../components/CampaignChart";
import DeadlineCard from "../components/DeadlineCard";
import { loadMetrics } from "../store/metricsSlice";

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];
const DAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];
const PLATFORMS = [
	{ key: "Instagram", icon: "instagram", color: plataforms.instagram },
	{ key: "TikTok", icon: "tiktok", color: colors.text },
	{ key: "YouTube", icon: "youtube", color: plataforms.youtube },
];

const getMonthFromDate = (dateStr) => {
	if (!dateStr) return -1;
	return MONTHS.findIndex((m) =>
		dateStr.toLowerCase().includes(m.toLowerCase()),
	);
};

const parseDateToTimestamp = (dateStr) => {
	if (!dateStr) return Infinity;
	const monthIndex = getMonthFromDate(dateStr);
	const dayMatch = dateStr.match(/\d+/);
	const day = dayMatch ? Number(dayMatch[0]) : 1;
	return new Date(new Date().getFullYear(), monthIndex, day).getTime();
};

const getDeadlineLabel = (dateStr) => {
	const ts = parseDateToTimestamp(dateStr);
	const now = new Date();
	const today = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	).getTime();
	const diff = Math.round((ts - today) / (1000 * 60 * 60 * 24));
	if (diff < 0) return "Overdue";
	if (diff === 0) return "Today";
	if (diff === 1) return "Tomorrow";
	if (diff <= 3) return `In ${diff} days`;
	if (diff <= 7) return "This week";
	if (diff <= 14) return "Next week";
	return MONTHS[getMonthFromDate(dateStr)] + " " + dateStr.match(/\d+/)?.[0];
};

const deadlineColor = (label) => {
	if (label === "Overdue" || label === "Today") return colors.paused;
	if (label === "Tomorrow" || label.startsWith("In")) return colors.pending;
	if (label === "This week") return colors.active;
	if (label === "Next week") return colors.avatarT;
	return colors.inactive;
};

const getNotifIcon = (type) => {
	if (type === "expense_added")
		return { name: "arrow-down-circle-outline", color: colors.paused };
	if (type === "campaign_created")
		return { name: "add-circle-outline", color: colors.active };
	if (type === "status_completed")
		return { name: "checkmark-circle-outline", color: colors.active };
	if (type === "status_active")
		return { name: "play-circle-outline", color: colors.active };
	if (type === "status_paused")
		return { name: "pause-circle-outline", color: colors.pending };
	if (type === "status_pending")
		return { name: "time-outline", color: colors.pending };
	return { name: "notifications-outline", color: colors.inactive };
};

const formatNumber = (n) => {
	if (!n) return "—";
	if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
	if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
	return String(n);
};

export default function HomeScreen({ navigation }) {
	const insets = useSafeAreaInsets();
	const dispatch = useDispatch();
	const metricsData = useSelector((state) => state.metrics.data);

	const [userName, setUserName] = useState("");
	const [campaigns, setCampaigns] = useState([]);
	const [expenses, setExpenses] = useState([]);
	const [notifications, setNotifications] = useState([]);

	const now = new Date();
	const currentMonth = now.getMonth();
	const dateLabel = `${DAYS[now.getDay()]}, ${MONTHS[currentMonth]} ${now.getDate()}`;

	useFocusEffect(
		useCallback(() => {
			const loadAll = async () => {
				try {
					const db = await getDB();
					const uid = auth.currentUser.uid;

					const user = await db.getFirstAsync(
						"SELECT name FROM users WHERE uid=?",
						[uid],
					);
					setUserName(user?.name || "");

					const camps = await db.getAllAsync(
						"SELECT * FROM campaigns WHERE userId=?",
						[uid],
					);
					setCampaigns(camps);

					const exps = await db.getAllAsync(
						"SELECT * FROM expenses WHERE userId=?",
						[uid],
					);
					setExpenses(exps);

					const notifs = await db.getAllAsync(
						`SELECT * FROM notifications WHERE userId=? AND read=0 ORDER BY createdAt DESC LIMIT 3`,
						[uid],
					);
					setNotifications(notifs);
				} catch (e) {
					console.log("HomeScreen error:", e);
				}
			};
			loadAll();
			dispatch(loadMetrics());
		}, []),
	);

	const markAsRead = async (id) => {
		try {
			const db = await getDB();
			await db.runAsync("DELETE FROM notifications WHERE id=?", [id]);
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		} catch (e) {
			console.log(e);
		}
	};

	const monthCampaigns = campaigns.filter(
		(c) =>
			(c.status === "Active" || c.status === "Completed") &&
			getMonthFromDate(c.date) === currentMonth,
	);
	const monthIncome = monthCampaigns.reduce((sum, c) => sum + c.payment, 0);
	const yearIncome = campaigns
		.filter((c) => c.status === "Active" || c.status === "Completed")
		.reduce((sum, c) => sum + c.payment, 0);
	const pending = campaigns
		.filter((c) => c.status === "Active")
		.reduce((sum, c) => sum + c.payment, 0);
	const activeCampaigns = campaigns.filter(
		(c) => c.status === "Active" || c.status === "Pending",
	);

	const upcomingDeadlines = activeCampaigns
		.filter((c) => c.date)
		.sort((a, b) => parseDateToTimestamp(a.date) - parseDateToTimestamp(b.date))
		.slice(0, 3);

	const chartData = Array.from({ length: 12 }, (_, i) => {
		const count = campaigns.filter(
			(c) =>
				getMonthFromDate(c.date) === i &&
				(c.status === "Active" || c.status === "Completed"),
		).length;
		return {
			month: MONTHS[i].slice(0, 3),
			count,
			isCurrent: i === currentMonth,
		};
	});
	const maxCount = Math.max(...chartData.map((d) => d.count), 1);
	const firstName = userName.split(" ")[0];
	const activePlatformMetrics = PLATFORMS.filter((p) => metricsData[p.key]);

	return (
		<ScrollView style={styles.container}>
			<View style={[styles.header, { paddingTop: insets.top + 12 }]}>
				<View>
					<Text style={styles.greeting}>
						Hey, <Text style={styles.greetingName}>{firstName || "there"}</Text>{" "}
						👋
					</Text>
					<Text style={styles.date}>{dateLabel}</Text>
				</View>
				<NotificationBell />
			</View>

			<View style={styles.kpiGrid}>
				<View style={[styles.kpi, styles.kpiBorderP]}>
					<Text style={styles.kpiLabel}>Monthly income</Text>
					<Text style={[styles.kpiValue, { color: colors.primary }]}>
						${monthIncome}
					</Text>
					<View style={styles.kpiSubRow}>
						<Ionicons name="cash-outline" size={12} color={colors.active} />
						<Text style={styles.kpiSubText}>This Year: ${yearIncome}</Text>
					</View>
				</View>
				<View style={[styles.kpi, styles.kpiBorderT]}>
					<Text style={styles.kpiLabel}>Pending Payments</Text>
					<Text style={[styles.kpiValue, { color: colors.pending }]}>
						${pending}
					</Text>
					<View style={styles.kpiSubRow}>
						<Text style={{ fontSize: 12, color: colors.pending }}>⏳</Text>
						<Text style={[styles.kpiSubText, { color: colors.pending }]}>
							{activeCampaigns.length} Campaigns
						</Text>
					</View>
				</View>
			</View>

			{activePlatformMetrics.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Plataforms metrics</Text>
					<View style={styles.metricsRow}>
						{activePlatformMetrics.map((plat) => {
							const m = metricsData[plat.key];
							return (
								<View
									key={plat.key}
									style={[styles.metricCard, { borderTopColor: plat.color }]}
								>
									<View style={styles.metricCardHeader}>
										<FontAwesome5
											name={plat.icon}
											size={13}
											color={plat.color}
										/>
										<Text
											style={[styles.metricCardPlatform, { color: plat.color }]}
										>
											{plat.key}
										</Text>
									</View>
									<Text style={styles.metricStatValue}>
										{formatNumber(m.followers)}
									</Text>
									<Text style={styles.metricStatLabel}>Followers</Text>
								</View>
							);
						})}
					</View>
				</View>
			)}

			<CampaignChart
				chartData={chartData}
				maxCount={maxCount}
				currentMonth={currentMonth}
			/>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Upcoming deadlines</Text>
				{upcomingDeadlines.length > 0 ? (
					upcomingDeadlines.map((c, index) => {
						const label = getDeadlineLabel(c.date);
						const dColor = deadlineColor(label);
						return (
							<DeadlineCard
								key={c.id}
								campaign={c}
								index={index}
								label={label}
								dColor={dColor}
							/>
						);
					})
				) : (
					<View style={styles.emptyCard}>
						<Text style={styles.emptyCardText}>No upcoming deadlines</Text>
					</View>
				)}
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Notifications</Text>
				{notifications.length > 0 ? (
					notifications.map((n) => {
						const icon = getNotifIcon(n.type);
						return (
							<TouchableOpacity
								key={n.id}
								style={styles.notifCard}
								onPress={() => markAsRead(n.id)}
								activeOpacity={0.8}
							>
								<View
									style={[
										styles.notifIconWrap,
										{ backgroundColor: `${icon.color}15` },
									]}
								>
									<Ionicons name={icon.name} size={18} color={icon.color} />
								</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.notifText}>{n.message}</Text>
									<View
										style={{
											flexDirection: "row",
											alignItems: "center",
											gap: 4,
											marginTop: 6,
										}}
									>
										{n.detail && (
											<Text
												style={[styles.notifDetail, { color: colors.inactive }]}
											>
												{n.detail}
											</Text>
										)}
										{n.amount != null && (
											<Text
												style={[
													styles.notifDetail,
													{
														color:
															n.type === "expense_added"
																? colors.paused
																: colors.active,
													},
												]}
											>
												{n.type === "expense_added"
													? ` -$${Math.abs(n.amount)}`
													: ` +$${n.amount}`}
											</Text>
										)}
									</View>
								</View>
							</TouchableOpacity>
						);
					})
				) : (
					<View style={styles.emptyCard}>
						<Text style={styles.emptyCardText}>No new notifications</Text>
					</View>
				)}
			</View>

			{campaigns.length === 0 && (
				<View style={styles.emptyWrap}>
					<Text style={styles.emptyText}>No campaigns yet.</Text>
					<TouchableOpacity onPress={() => navigation.navigate("Campanas")}>
						<Text style={styles.emptyLink}>Create your first campaign →</Text>
					</TouchableOpacity>
				</View>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.backgroundScreen },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 16,
	},
	greeting: {
		fontSize: 24,
		fontWeight: "800",
		color: colors.text,
		letterSpacing: 0.3,
	},
	greetingName: { color: colors.primary },
	date: {
		fontSize: 13,
		color: colors.inactive,
		marginTop: 3,
		letterSpacing: 0.3,
	},
	kpiGrid: {
		flexDirection: "row",
		marginHorizontal: 18,
		marginBottom: 14,
		backgroundColor: colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: "hidden",
	},
	kpi: { flex: 1, padding: 16, gap: 4 },
	kpiBorderP: {
		borderRightWidth: 1,
		borderRightColor: colors.border,
		borderTopWidth: 2,
		borderTopColor: colors.primary,
	},
	kpiBorderT: { borderTopWidth: 2, borderTopColor: colors.pending },
	kpiLabel: {
		fontSize: 10,
		color: colors.inactive,
		textTransform: "uppercase",
		letterSpacing: 0.7,
	},
	kpiValue: { fontSize: 22, fontWeight: "800", letterSpacing: 0.3 },
	kpiSubRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		marginTop: 2,
	},
	kpiSubText: {
		fontSize: 12,
		color: colors.active,
		fontWeight: "600",
		letterSpacing: 0.3,
	},
	section: { marginHorizontal: 18, marginBottom: 16 },
	sectionTitle: {
		fontSize: 11,
		fontWeight: "600",
		color: colors.inactive,
		textTransform: "uppercase",
		letterSpacing: 0.8,
		marginBottom: 12,
	},
	metricsRow: { flexDirection: "row", gap: 10, justifyContent: "center" },
	metricCard: {
		flex: 1,
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		borderTopWidth: 2,
		padding: 12,
		gap: 4,
		alignItems: "center",
	},
	metricCardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: 4,
	},
	metricCardPlatform: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
	metricStatValue: {
		fontSize: 20,
		fontWeight: "800",
		color: colors.text,
		letterSpacing: 0.3,
	},
	metricStatLabel: {
		fontSize: 10,
		color: colors.inactive,
		textTransform: "uppercase",
		letterSpacing: 0.6,
	},
	notifCard: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 14,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		marginBottom: 8,
	},
	notifIconWrap: {
		width: 36,
		height: 36,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		marginTop: 1,
	},
	notifText: { fontSize: 13, color: colors.text, letterSpacing: 0.3 },
	notifDetail: { fontSize: 12, color: colors.inactive, letterSpacing: 0.3 },
	emptyCard: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 16,
		alignItems: "center",
	},
	emptyCardText: { fontSize: 13, color: colors.inactive, letterSpacing: 0.3 },
	emptyWrap: { alignItems: "center", marginTop: 60, gap: 8, marginBottom: 40 },
	emptyText: { fontSize: 14, color: colors.inactive, letterSpacing: 0.3 },
	emptyLink: {
		fontSize: 14,
		color: colors.primary,
		fontWeight: "700",
		letterSpacing: 0.3,
	},
});
