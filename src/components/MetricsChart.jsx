import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors, plataforms } from "../constants/colors";

const PLATFORMS = [
	{ key: "Instagram", icon: "instagram", color: plataforms.instagram },
	{ key: "TikTok", icon: "tiktok", color: colors.text },
	{ key: "YouTube", icon: "youtube", color: plataforms.youtube },
];

const formatNumber = (n) => {
	if (!n || n === 0) return "0";
	if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
	if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
	return String(n);
};

export default function MetricsChart({ metricsData }) {
	const activePlatforms = PLATFORMS.filter((p) => metricsData[p.key]);
	if (activePlatforms.length === 0) return null;

	const maxFollowers = Math.max(
		...activePlatforms.map((p) => metricsData[p.key]?.followers || 0),
		1,
	);

	return (
		<View style={styles.container}>
			<Text style={styles.sectionTitle}>Followers overview</Text>
			<View style={styles.barsContainer}>
				{activePlatforms.map(({ key, icon, color }) => {
					const value = metricsData[key]?.followers || 0;
					return (
						<View key={key} style={styles.barGroup}>
							<View style={styles.barRow}>
								<View style={styles.barTrack}>
									<View
										style={[
											styles.barFill,
											{
												width: `${(value / maxFollowers) * 100}%`,
												backgroundColor: color,
											},
										]}
									/>
								</View>
								<Text style={[styles.barValue, { color }]}>
									{formatNumber(value)}
								</Text>
							</View>
							<View style={styles.barLabel}>
								<FontAwesome5 name={icon} size={10} color={color} />
								<Text style={[styles.barLabelText, { color }]}>{key}</Text>
							</View>
						</View>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginHorizontal: 18,
		marginBottom: 16,
		backgroundColor: colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 16,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: "600",
		color: colors.inactive,
		textTransform: "uppercase",
		letterSpacing: 0.8,
		marginBottom: 16,
	},
	barsContainer: { gap: 14 },
	barGroup: { gap: 4 },
	barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
	barTrack: {
		flex: 1,
		height: 8,
		backgroundColor: colors.border,
		borderRadius: 4,
		overflow: "hidden",
	},
	barFill: { height: "100%", borderRadius: 4, minWidth: 4 },
	barValue: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.3,
		width: 40,
		textAlign: "right",
	},
	barLabel: { flexDirection: "row", alignItems: "center", gap: 4 },
	barLabelText: { fontSize: 10, fontWeight: "600", letterSpacing: 0.3 },
});
