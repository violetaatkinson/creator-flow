import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import NotificationBell from "../components/NotificationBell";
import CampaignChart from "../components/CampaignChart";
import DeadlineCard from "../components/DeadlineCard";

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

const getMonthFromDate = (dateStr) => {
	if (!dateStr) return -1;
	const lower = dateStr.toLowerCase();
	return MONTHS.findIndex((m) => lower.includes(m.toLowerCase()));
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

export default function HomeScreen({ navigation }) {
	const insets = useSafeAreaInsets();
	const [userName, setUserName] = useState("");
	const [campaigns, setCampaigns] = useState([]);
	const [expenses, setExpenses] = useState([]);

	const now = new Date();
	const currentMonth = now.getMonth();
	const dateLabel = `${DAYS[now.getDay()]}, ${MONTHS[currentMonth]} ${now.getDate()}`;

	useFocusEffect(
		useCallback(() => {
			const loadProfile = async () => {
				try {
					const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
					if (snap.exists()) setUserName(snap.data().name || "");
				} catch (e) {}
			};
			loadProfile();
		}, []),
	);

	useEffect(() => {
		const q = query(
			collection(db, "campaigns"),
			where("userId", "==", auth.currentUser.uid),
		);
		return onSnapshot(q, (snap) => {
			setCampaigns(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
		});
	}, []);

	useEffect(() => {
		const q = query(
			collection(db, "expenses"),
			where("userId", "==", auth.currentUser.uid),
		);
		return onSnapshot(q, (snap) => {
			setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
		});
	}, []);

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

	const notifications = upcomingDeadlines
		.filter((c) => {
			const label = getDeadlineLabel(c.date);
			return (
				label === "Overdue" ||
				label === "Today" ||
				label === "Tomorrow" ||
				label.startsWith("In") ||
				label === "This week" ||
				label === "Next week"
			);
		})
		.map((c) => ({
			id: c.id,
			message: `${c.brand} — ${getDeadlineLabel(c.date)}`,
			color: deadlineColor(getDeadlineLabel(c.date)),
		}));

	const firstName = userName.split(" ")[0];

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
					<Text style={styles.kpiLabel}>This month</Text>
					<Text style={[styles.kpiValue, { color: colors.primary }]}>
						${monthIncome}
					</Text>
					<View style={styles.kpiSubRow}>
						<Ionicons name="cash-outline" size={12} color={colors.active} />
						<Text style={styles.kpiSubText}>This Year: ${yearIncome}</Text>
					</View>
				</View>
				<View style={[styles.kpi, styles.kpiBorderT]}>
					<Text style={styles.kpiLabel}>Pending</Text>
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

			{/* gráfico — componente */}
			<CampaignChart
				chartData={chartData}
				maxCount={maxCount}
				currentMonth={currentMonth}
			/>

			{/* upcoming deadlines */}
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

			{/* notifications */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Notifications</Text>
				{notifications.length > 0 ? (
					notifications.map((n) => (
						<View key={n.id} style={styles.notifCard}>
							<View style={[styles.notifDot, { backgroundColor: n.color }]} />
							<Text style={styles.notifText}>{n.message}</Text>
						</View>
					))
				) : (
					<View style={styles.emptyCard}>
						<Text style={styles.emptyCardText}>No unread notifications</Text>
					</View>
				)}
			</View>

			{campaigns.length === 0 && (
				<View style={styles.emptyWrap}>
					<Text style={styles.emptyText}>No campaigns yet.</Text>
					<TouchableOpacity onPress={() => navigation.navigate("Campanas")}>
						<Text style={styles.emptyLink}>Create your first one →</Text>
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
	notifDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
	notifText: { fontSize: 13, color: colors.text, letterSpacing: 0.3, flex: 1 },
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
		color: colors.active,
		fontWeight: "700",
		letterSpacing: 0.3,
	},
});
