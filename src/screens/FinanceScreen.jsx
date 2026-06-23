import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	Modal,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getDB } from "../database/db";
import { getCurrentUserId } from "../database/authService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, errorModal } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import NotificationBell from "../components/NotificationBell";
import PlatformIcon from "../components/PlatformIcon";

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
const currentYear = new Date().getFullYear();

export default function FinanceScreen({ navigation }) {
	const insets = useSafeAreaInsets();
	const [campaigns, setCampaigns] = useState([]);
	const [expenses, setExpenses] = useState([]);
	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
	const [period, setPeriod] = useState("Month");
	const [showMonthModal, setShowMonthModal] = useState(false);

	useFocusEffect(
		useCallback(() => {
			const loadData = async () => {
				try {
					const db = await getDB();
					const userId = await getCurrentUserId();
					const camps = await db.getAllAsync(
						"SELECT * FROM campaigns WHERE userId=?",
						[userId],
					);
					const exps = await db.getAllAsync(
						"SELECT * FROM expenses WHERE userId=?",
						[userId],
					);
					setCampaigns(camps);
					setExpenses(exps);
				} catch (e) {
					console.log("FinanceScreen error:", e);
				}
			};
			loadData();
		}, []),
	);

	const getFilteredCampaigns = () => {
		return campaigns.filter((c) => {
			if (c.status !== "Completed" && c.status !== "Active") return false;
			if (period === "Month")
				return c.date
					?.toLowerCase()
					.includes(MONTHS[selectedMonth].toLowerCase());
			if (period === "Semester") {
				const months = Array.from({ length: 6 }, (_, i) =>
					MONTHS[(selectedMonth - i + 12) % 12].toLowerCase(),
				);
				return months.some((m) => c.date?.toLowerCase().includes(m));
			}
			return true;
		});
	};

	const getFilteredExpenses = () => {
		return expenses.filter((e) => {
			if (period === "Month")
				return e.month === selectedMonth + 1 && e.year === currentYear;
			if (period === "Semester") {
				const months = Array.from(
					{ length: 6 },
					(_, i) => ((selectedMonth - i + 12) % 12) + 1,
				);
				return months.includes(e.month) && e.year === currentYear;
			}
			return e.year === currentYear;
		});
	};

	const filteredCampaigns = getFilteredCampaigns();
	const filteredExpenses = getFilteredExpenses();
	const totalIncome = filteredCampaigns.reduce((sum, c) => sum + c.payment, 0);
	const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
	const neto = totalIncome - totalExpenses;

	const visibleExpenses = filteredExpenses.slice(0, 3);
	const hasMoreExpenses = filteredExpenses.length > 3;

	const campaignsByPlatform = filteredCampaigns.reduce((acc, c) => {
		const plat = c.platform || "Instagram";
		if (!acc[plat]) acc[plat] = [];
		acc[plat].push(c);
		return acc;
	}, {});

	const capitalize = (text = "") =>
		text.charAt(0).toUpperCase() + text.slice(1);

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.scrollContent}
		>
			<View style={[styles.header, { paddingTop: insets.top + 12 }]}>
				<View style={styles.headerTop}>
					<View style={styles.periodLine}>
						{["Month", "Semester", "Year"].map((p, i) => (
							<View
								key={p}
								style={{ flexDirection: "row", alignItems: "center" }}
							>
								{i > 0 && <Text style={styles.dot}> · </Text>}
								<TouchableOpacity
									onPress={() => {
										setPeriod(p);
										if (p === "Month") setShowMonthModal(true);
									}}
								>
									<Text
										style={[
											styles.periodItem,
											period === p && styles.periodItemActive,
										]}
									>
										{p === "Month"
											? `${MONTHS[selectedMonth]} ${currentYear}`
											: p}
									</Text>
								</TouchableOpacity>
							</View>
						))}
					</View>
					<NotificationBell />
				</View>
			</View>

			<Modal
				visible={showMonthModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowMonthModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>Select month</Text>
						<View style={styles.monthGrid}>
							{MONTHS.map((m, i) => (
								<TouchableOpacity
									key={m}
									style={[
										styles.monthOption,
										selectedMonth === i && styles.monthOptionActive,
									]}
									onPress={() => {
										setSelectedMonth(i);
										setShowMonthModal(false);
									}}
								>
									<Text
										style={[
											styles.monthOptionText,
											selectedMonth === i && styles.monthOptionTextActive,
										]}
									>
										{m}
									</Text>
								</TouchableOpacity>
							))}
						</View>
						<TouchableOpacity
							style={styles.modalClose}
							onPress={() => setShowMonthModal(false)}
						>
							<Text style={styles.modalCloseText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			<View style={styles.kpiRow}>
				<View style={[styles.kpi, styles.kpiBorder]}>
					<Text style={styles.kpiLabel}>Income</Text>
					<Text style={[styles.kpiValue, { color: colors.active }]}>
						${totalIncome}
					</Text>
				</View>
				<View style={[styles.kpi, styles.kpiBorder]}>
					<Text style={styles.kpiLabel}>Expenses</Text>
					<Text style={[styles.kpiValue, { color: colors.paused }]}>
						-${totalExpenses}
					</Text>
				</View>
				<View style={styles.kpi}>
					<Text style={styles.kpiLabel}>Net</Text>
					<Text style={[styles.kpiValue, { color: colors.primary }]}>
						${neto}
					</Text>
				</View>
			</View>

			<Text style={styles.sectionTitle}>Income by source</Text>
			{Object.entries(campaignsByPlatform).map(([plat, camps]) => (
				<View key={plat} style={[styles.card, { marginBottom: 10 }]}>
					<View style={styles.platformHeader}>
						<PlatformIcon platform={plat} />
						<Text style={styles.platformName}>{plat}</Text>
						<Text style={[styles.platformTotal, { color: colors.active }]}>
							+${camps.reduce((sum, c) => sum + c.payment, 0)}
						</Text>
					</View>
					{camps.map((c, index) => {
						const isLast = index === camps.length - 1;
						return (
							<View
								key={c.id}
								style={[styles.campaignRow, isLast && { borderBottomWidth: 0 }]}
							>
								<Text style={styles.campaignDetail}>
									{c.brand} · {c.type} · {c.date}
								</Text>
								<Text
									style={[
										styles.campaignAmount,
										{
											color:
												c.status === "Active" ? colors.pending : colors.active,
										},
									]}
								>
									{c.status === "Active" ? "⏳ " : "+"}${c.payment}
								</Text>
							</View>
						);
					})}
				</View>
			))}
			{filteredCampaigns.length === 0 && (
				<View style={styles.card}>
					<Text style={styles.empty}>No income for this period</Text>
				</View>
			)}

			<View style={styles.sectionHeader}>
				<Text style={[styles.sectionTitle, { paddingTop: 8 }]}>Expenses</Text>
				<TouchableOpacity
					style={styles.addBtn}
					onPress={() => navigation.navigate("AddExpense")}
				>
					<Text style={styles.addBtnText}>+ Add</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.card}>
				{visibleExpenses.map((e, index) => {
					const isLast =
						index === visibleExpenses.length - 1 && !hasMoreExpenses;
					return (
						<View
							key={e.id}
							style={[styles.expenseRow, isLast && { borderBottomWidth: 0 }]}
						>
							<View style={styles.expenseLeft}>
								<Text style={styles.expenseCategory}>
									{capitalize(e.category?.toLowerCase() || "")}
								</Text>
								<Text style={styles.expenseSubtitle}>
									{capitalize(e.description || "")} · {e.date}
								</Text>
							</View>
							<Text style={styles.expenseAmount}>-${e.amount}</Text>
						</View>
					);
				})}
				{filteredExpenses.length === 0 && (
					<Text style={styles.empty}>No expenses for this period</Text>
				)}
			</View>

			{hasMoreExpenses && (
				<TouchableOpacity
					style={styles.reportLink}
					onPress={() => navigation.navigate("Profile")}
				>
					<Text style={styles.reportLinkText}>
						+{filteredExpenses.length - 3} more expenses
					</Text>
					<View style={styles.reportLinkRow}>
						<Text style={styles.reportLinkSub}>VIEW FULL REPORT</Text>
						<Ionicons name="arrow-forward" size={14} color={colors.primary} />
					</View>
				</TouchableOpacity>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.backgroundScreen },
	scrollContent: { paddingBottom: 40 },
	header: { paddingHorizontal: 20, paddingBottom: 12 },
	headerTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	periodLine: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
		justifyContent: "flex-start",
	},
	periodItem: {
		fontSize: 18,
		color: colors.inactive,
		fontWeight: "600",
		letterSpacing: 0.3,
	},
	periodItemActive: { color: colors.primary, fontWeight: "700" },
	dot: { fontSize: 18, color: colors.inactive },
	modalOverlay: {
		flex: 1,
		backgroundColor: errorModal.bg,
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	modalCard: {
		backgroundColor: colors.surface,
		borderRadius: 24,
		padding: 24,
		borderWidth: 1,
		borderColor: colors.border,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "800",
		color: colors.text,
		marginBottom: 16,
		letterSpacing: 0.3,
	},
	monthGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	monthOption: {
		width: "22%",
		paddingVertical: 10,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.backgroundScreen,
		alignItems: "center",
	},
	monthOptionActive: {
		backgroundColor: colors.backgroundBtn,
		borderColor: colors.btnBorder,
	},
	monthOptionText: {
		fontSize: 13,
		color: colors.inactive,
		fontWeight: "600",
		letterSpacing: 0.3,
	},
	monthOptionTextActive: { color: colors.active },
	modalClose: {
		marginTop: 16,
		alignItems: "center",
		paddingVertical: 12,
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	modalCloseText: {
		fontSize: 14,
		color: colors.inactive,
		fontWeight: "600",
		letterSpacing: 0.3,
	},
	kpiRow: {
		flexDirection: "row",
		backgroundColor: colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
		marginBottom: 14,
		overflow: "hidden",
		marginHorizontal: 18,
	},
	kpi: { flex: 1, padding: 14, alignItems: "center" },
	kpiBorder: { borderRightWidth: 1, borderRightColor: colors.border },
	kpiLabel: {
		fontSize: 10,
		color: colors.inactive,
		letterSpacing: 0.7,
		textTransform: "uppercase",
	},
	kpiValue: {
		fontSize: 20,
		fontWeight: "800",
		marginTop: 4,
		letterSpacing: 0.3,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: "600",
		color: colors.inactive,
		textTransform: "uppercase",
		letterSpacing: 0.8,
		marginBottom: 12,
		marginTop: 6,
		paddingHorizontal: 18,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
		marginTop: 14,
		paddingHorizontal: 18,
	},
	addBtn: {
		backgroundColor: colors.backgroundBtn,
		borderRadius: 20,
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderWidth: 1,
		borderColor: colors.btnBorder,
	},
	addBtnText: {
		color: colors.active,
		fontWeight: "700",
		fontSize: 13,
		letterSpacing: 0.3,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		paddingHorizontal: 14,
		paddingVertical: 8,
		marginHorizontal: 18,
	},
	platformHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	platformName: {
		flex: 1,
		fontSize: 14,
		fontWeight: "700",
		color: colors.text,
		letterSpacing: 0.3,
	},
	platformTotal: { fontSize: 14, fontWeight: "800", letterSpacing: 0.3 },
	campaignRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		paddingLeft: 22,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	campaignDetail: {
		flex: 1,
		fontSize: 12,
		color: colors.inactive,
		letterSpacing: 0.3,
	},
	campaignAmount: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
	expenseRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 13,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	expenseLeft: { flex: 1 },
	expenseCategory: {
		fontSize: 14,
		fontWeight: "700",
		color: colors.text,
		letterSpacing: 0.3,
	},
	expenseSubtitle: {
		fontSize: 12,
		color: colors.inactive,
		marginTop: 6,
		letterSpacing: 0.3,
	},
	expenseAmount: {
		fontSize: 15,
		fontWeight: "700",
		letterSpacing: 0.3,
		color: colors.paused,
	},
	empty: {
		textAlign: "center",
		color: colors.inactive,
		fontSize: 13,
		paddingVertical: 16,
		letterSpacing: 0.3,
	},
	reportLink: {
		alignItems: "center",
		paddingVertical: 16,
		gap: 6,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		marginTop: 16,
	},
	reportLinkText: { fontSize: 11, color: colors.inactive, letterSpacing: 0.5 },
	reportLinkRow: { flexDirection: "row", alignItems: "center", gap: 6 },
	reportLinkSub: {
		fontSize: 12,
		fontWeight: "700",
		color: colors.primary,
		letterSpacing: 1.2,
	},
});
