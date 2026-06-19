import { View, Text, StyleSheet } from "react-native";
import { colors, colorALight } from "../constants/colors";
import PlatformIcon from "./PlatformIcon";

const avatarColors = [
	{ bg: colorALight.bga, text: colors.primary },
	{ bg: colorALight.bgb, text: colors.avatarT },
	{ bg: colorALight.bgc, text: colors.pending },
	{ bg: colorALight.bgd, text: colors.paused },
	{ bg: colorALight.bge, text: colors.avatarTB },
];

export default function DeadlineCard({ campaign, index, label, dColor }) {
	const av = avatarColors[index % avatarColors.length];

	return (
		<View style={styles.card}>
			<View style={styles.left}>
				<View style={[styles.avatar, { backgroundColor: av.bg }]}>
					<Text style={[styles.avatarText, { color: av.text }]}>
						{campaign.brand.slice(0, 2).toUpperCase()}
					</Text>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={styles.brandName}>{campaign.brand}</Text>
					<View style={styles.detailRow}>
						<PlatformIcon platform={campaign.platform} />
						<Text style={styles.detail}> {campaign.type}</Text>
						<Text style={styles.dot}>·</Text>
						<Text style={styles.detail}>{campaign.date}</Text>
						<Text style={styles.dot}>·</Text>
						<Text style={styles.detail}>${campaign.payment}</Text>
					</View>
				</View>
			</View>
			<View style={[styles.pill, { backgroundColor: `${dColor}20` }]}>
				<Text style={[styles.pillText, { color: dColor }]}>{label}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
	avatar: {
		width: 36,
		height: 36,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
	brandName: {
		fontSize: 13,
		fontWeight: "600",
		color: colors.text,
		letterSpacing: 0.3,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		marginTop: 3,
		flexWrap: "wrap",
	},
	dot: { fontSize: 10, color: colors.inactive },
	detail: { fontSize: 12, color: colors.inactive, letterSpacing: 0.3 },
	pill: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 20,
		marginLeft: 6,
	},
	pillText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
});
