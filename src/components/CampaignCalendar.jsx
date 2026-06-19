import { View, Text, StyleSheet } from "react-native";
import { memo } from "react";
import { colors, calendarDate } from "../constants/colors";
import PlatformIcon from "./PlatformIcon";

const MONTHS_EN = [
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
const MONTHS_ES = [
	"Ene",
	"Feb",
	"Mar",
	"Abr",
	"May",
	"Jun",
	"Jul",
	"Ago",
	"Sep",
	"Oct",
	"Nov",
	"Dic",
];

function parseDate(dateStr) {
	if (!dateStr) return { day: "?", month: "??", timestamp: 0 };
	const lower = dateStr.toLowerCase();

	for (let i = 0; i < MONTHS_EN.length; i++) {
		if (
			lower.includes(MONTHS_EN[i]) ||
			lower.includes(MONTHS_ES[i].toLowerCase())
		) {
			const day = dateStr.replace(/[^0-9]/g, "").trim();
			return {
				day,
				month: MONTHS_ES[i],
				timestamp: new Date(
					`2026-${String(i + 1).padStart(2, "0")}-${day.padStart(2, "0")}`,
				).getTime(),
			};
		}
	}
	return { day: dateStr, month: "", timestamp: 0 };
}

const statusColors = {
	Active: colors.active,
	Pending: colors.pending,
	Paused: colors.paused,
	Completed: colors.inactive,
};

const CalendarItem = memo(({ item }) => {
	const { day, month } = parseDate(item.date);

	return (
		<View style={styles.item}>
			<View style={styles.dateBox}>
				<Text style={styles.day}>{day}</Text>
				<Text style={styles.month}>{month}</Text>
			</View>

			<View style={styles.info}>
				<Text style={styles.brandName}>{item.brand}</Text>
				<View style={styles.detailRow}>
					<PlatformIcon platform={item.platform} size={11} />
					<Text style={styles.detail}>  {item.type} · ${item.payment}</Text>
				</View>
			</View>

			<View
				style={[styles.dot, { backgroundColor: statusColors[item.status] }]}
			/>
		</View>
	);
});

export default function CampaignCalendar({ campaigns }) {
	const sorted = campaigns
		.filter((c) => c.status !== "Completed")
		.map((c) => ({ ...c, _ts: parseDate(c.date).timestamp }))
		.sort((a, b) => a._ts - b._ts);

	if (sorted.length === 0) return null;

	return (
		<View style={styles.container}>
			<Text style={styles.sectionTitle}>Calendar</Text>
			<View style={styles.card}>
				{sorted.map((item, index) => (
					<View key={item.id}>
						<CalendarItem item={item} />
						{index < sorted.length - 1 && <View style={styles.divider} />}
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginTop: 8,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: "600",
		color: colors.inactive,
		textTransform: "uppercase",
		letterSpacing: 0.8,
		marginBottom: 10,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		paddingHorizontal: 14,
	},
	item: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		gap: 14,
	},
	dateBox: {
		width: 42,
		height: 42,
		borderRadius: 10,
		backgroundColor: calendarDate.boxBg,
		borderWidth: 1,
		borderColor: calendarDate.boxBorder,
		alignItems: "center",
		justifyContent: "center",
	},
	day: {
		fontSize: 16,
		fontWeight: "800",
		color: colors.primary,
		lineHeight: 18,
		letterSpacing: 0.3,
	},
	month: {
		fontSize: 9,
		fontWeight: "700",
		color: calendarDate.month,
		letterSpacing: 0.5,
	},
	info: { flex: 1 },
	brandName: {
		fontSize: 13,
		fontWeight: "600",
		color: colors.text,
		letterSpacing: 0.3,
	},
	detail: {
		fontSize: 12,
		color: colors.inactive,
		marginTop: 2,
		letterSpacing: 0.3,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	divider: {
		height: 1,
		backgroundColor: colors.border,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 2,
		gap: 4,
	},
});
