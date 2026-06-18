import { View, Text, ScrollView, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export default function CampaignChart({ chartData, maxCount, currentMonth }) {
	return (
		<View style={styles.chartCard}>
			<Text style={styles.sectionTitle}>Campaigns this year</Text>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.chartScroll}
			>
				{chartData.map((d, i) => (
					<View key={i} style={styles.chartCol}>
						<View style={styles.barWrap}>
							{d.count > 0 && <Text style={styles.chartCount}>{d.count}</Text>}
							<View
								style={[
									styles.bar,
									{
										height:
											d.count > 0 ? `${(d.count / maxCount) * 100}%` : "8%",
										backgroundColor:
											d.count > 0 ? colors.active : colors.border,
									},
								]}
							/>
						</View>
						<Text
							style={[
								styles.chartMonth,
								d.isCurrent && { color: colors.active, fontWeight: "700" },
							]}
						>
							{d.month}
						</Text>
					</View>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	chartCard: {
		marginHorizontal: 18,
		marginBottom: 16,
		marginTop: 3,
		backgroundColor: colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 16,
		paddingBottom: 12,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: "600",
		color: colors.inactive,
		textTransform: "uppercase",
		letterSpacing: 0.8,
		marginBottom: 12,
	},
	chartScroll: { gap: 8, paddingRight: 4, alignItems: "flex-end", height: 110 },
	chartCol: {
		width: 20,
		alignItems: "center",
		height: "100%",
		justifyContent: "flex-end",
	},
	chartCount: {
		fontSize: 9,
		color: colors.active,
		fontWeight: "700",
		marginBottom: 2,
	},
	barWrap: {
		width: "100%",
		height: 70,
		justifyContent: "flex-end",
		alignItems: "center",
	},
	bar: { width: 10, alignSelf: "center", borderRadius: 10, minHeight: 4 },
	chartMonth: {
		fontSize: 9,
		color: colors.inactive,
		marginTop: 4,
		letterSpacing: 0.3,
	},
});
