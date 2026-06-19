import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, colorALight } from "../constants/colors";
import PlatformIcon from "./PlatformIcon";

const statusColors = {
	Active: colors.active,
	Pending: colors.pending,
	Paused: colors.paused,
	Completed: colors.inactive,
};

const avatarColors = [
	{ bg: colorALight.bga, text: colors.primary },
	{ bg: colorALight.bgb, text: colors.avatarT },
	{ bg: colorALight.bgc, text: colors.pending },
	{ bg: colorALight.bgd, text: colors.paused },
	{ bg: colorALight.bge, text: colors.avatarTB },
];

export default function CampaignHistory({ campaigns }) {
	const total = campaigns.reduce((sum, c) => sum + c.payment, 0);

	const visible = campaigns.slice(0, 3);
	const hasMore = campaigns.length > 3;

	return (
		<View style={styles.container}>
			<View style={styles.headerRow}>
				<Text style={styles.sectionTitle}>History</Text>
				<Text style={styles.total}>Total: ${total}</Text>
			</View>

			{visible.map((item, index) => (
				<View key={item.id} style={styles.cardWrap}>
					<View style={styles.card}>
						<View
							style={[
								styles.avatar,
								{
									backgroundColor: avatarColors[index % avatarColors.length].bg,
								},
							]}
						>
							<Text
								style={[
									styles.avatarText,
									{ color: avatarColors[index % avatarColors.length].text },
								]}
							>
								{item.brand.slice(0, 2).toUpperCase()}
							</Text>
						</View>
						<View style={styles.info}>
							<Text style={styles.brandName}>{item.brand}</Text>
							<View style={styles.detailRow}>
								<PlatformIcon platform={item.platform} size={11} />
								<Text style={styles.detail}>  {item.type} · {item.date} · ${item.payment}</Text>
							</View>
						</View>
						<View
							style={[
								styles.pill,
								{ backgroundColor: `${statusColors[item.status]}20` },
							]}
						>
							<Text
								style={[styles.pillText, { color: statusColors[item.status] }]}
							>
								{item.status}
							</Text>
						</View>
					</View>
				</View>
			))}

			{hasMore && (
				<TouchableOpacity style={styles.seeMore}>
					<Text style={styles.seeMoreText}>View all</Text>
					<Ionicons name="chevron-forward" size={16} color={colors.active} />
				</TouchableOpacity>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginTop: 20,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: "600",
		color: colors.inactive,
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	total: {
		fontSize: 12,
		fontWeight: "600",
		color: colors.active,
		letterSpacing: 0.3,
		textTransform: "uppercase",
	},
	cardWrap: {
		marginBottom: 8,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		padding: 14,
		borderWidth: 1,
		borderColor: colors.border,
		flexDirection: "row",
		alignItems: "center",
	},
	avatar: {
		width: 38,
		height: 38,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	avatarText: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.3,
	},
	info: { flex: 1 },
	brandName: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.text,
		letterSpacing: 0.3,
	},
	detail: {
		fontSize: 12,
		color: colors.inactive,
		marginTop: 3,
		letterSpacing: 0.3,
	},
	pill: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 20,
	},
	pillText: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.3,
	},
	seeMore: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
		paddingVertical: 12,
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		marginTop: 6,
	},
	seeMoreText: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.active,
		letterSpacing: 0.3,
		marginRight: 2,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 3,
		gap: 4,
	},
});
