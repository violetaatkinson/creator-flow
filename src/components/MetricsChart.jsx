import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors, plataforms } from "../constants/colors";

const PLATFORMS = [
	{ key: "Instagram", icon: "instagram", color: plataforms.instagram },
	{ key: "TikTok", icon: "tiktok", color: colors.text },
	{ key: "YouTube", icon: "youtube", color: plataforms.youtube },
];

const METRICS = [
	{ key: "followers", label: "Followers" },
	{ key: "likes", label: "Likes" },
	{ key: "views", label: "Views" },
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

	return (
		<View style={styles.container}>
			<Text style={styles.sectionTitle}>Overview</Text>
			{METRICS.map((metric) => {
				const values = activePlatforms.map((p) => ({
					platform: p,
					value: metricsData[p.key]?.[metric.key] || 0,
				}));
				const maxVal = Math.max(...values.map((v) => v.value), 1);

				return (
					<View key={metric.key} style={styles.metricSection}>
						<Text style={styles.metricTitle}>{metric.label}</Text>
						<View style={styles.barsContainer}>
							{values.map(({ platform, value }) => (
								<View key={platform.key} style={styles.barGroup}>
									<View style={styles.barRow}>
										<View style={styles.barTrack}>
											<View
												style={[
													styles.barFill,
													{
														width: `${(value / maxVal) * 100}%`,
														backgroundColor: platform.color,
													},
												]}
											/>
										</View>
										<Text style={[styles.barValue, { color: platform.color }]}>
											{formatNumber(value)}
										</Text>
									</View>
									<View style={styles.barLabel}>
										<FontAwesome5
											name={platform.icon}
											size={9}
											color={platform.color}
										/>
										<Text
											style={[styles.barLabelText, { color: platform.color }]}
										>
											{platform.key}
										</Text>
									</View>
								</View>
							))}
						</View>
					</View>
				);
			})}
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
	metricSection: { marginBottom: 20 },
	metricTitle: {
		fontSize: 12,
		fontWeight: "700",
		color: colors.text,
		letterSpacing: 0.3,
		marginBottom: 10,
	},
	barsContainer: { gap: 10 },
	barGroup: { gap: 3 },
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
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.3,
		width: 36,
		textAlign: "right",
	},
	barLabel: { flexDirection: "row", alignItems: "center", gap: 4 },
	barLabelText: { fontSize: 10, fontWeight: "600", letterSpacing: 0.3 },
});
