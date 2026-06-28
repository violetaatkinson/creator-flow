import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { colors, plataforms } from "../constants/colors";
import { loadMetrics, saveMetrics } from "../store/metricsSlice";
import SuccessModal from "../components/SuccessModal";
import MetricsChart from "../components/MetricsChart";

const PLATFORMS = [
	{ key: "Instagram", icon: "instagram", color: plataforms.instagram },
	{ key: "TikTok", icon: "tiktok", color: colors.text },
	{ key: "YouTube", icon: "youtube", color: plataforms.youtube },
];

const METRIC_FIELDS = [
	{ key: "followers", label: "Followers" },
	{ key: "likes", label: "Likes" },
	{ key: "views", label: "Views" },
];

export default function MetricsScreen({ navigation }) {
	const insets = useSafeAreaInsets();
	const dispatch = useDispatch();
	const metricsData = useSelector((state) => state.metrics.data);
	const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
	const [successVisible, setSuccessVisible] = useState(false);
	const [inputs, setInputs] = useState({
		Instagram: { followers: "", likes: "", views: "" },
		TikTok: { followers: "", likes: "", views: "" },
		YouTube: { followers: "", likes: "", views: "" },
	});

	useEffect(() => {
		dispatch(loadMetrics());
	}, []);

	useEffect(() => {
		if (metricsData) {
			setInputs({
				Instagram: {
					followers: String(metricsData.Instagram?.followers || ""),
					likes: String(metricsData.Instagram?.likes || ""),
					views: String(metricsData.Instagram?.views || ""),
				},
				TikTok: {
					followers: String(metricsData.TikTok?.followers || ""),
					likes: String(metricsData.TikTok?.likes || ""),
					views: String(metricsData.TikTok?.views || ""),
				},
				YouTube: {
					followers: String(metricsData.YouTube?.followers || ""),
					likes: String(metricsData.YouTube?.likes || ""),
					views: String(metricsData.YouTube?.views || ""),
				},
			});
		}
	}, [metricsData]);

	const handleSave = async () => {
		await dispatch(
			saveMetrics({
				platform: selectedPlatform,
				followers: Number(inputs[selectedPlatform].followers) || 0,
				likes: Number(inputs[selectedPlatform].likes) || 0,
				views: Number(inputs[selectedPlatform].views) || 0,
			}),
		);
		setSuccessVisible(true);
	};

	const currentPlat = PLATFORMS.find((p) => p.key === selectedPlatform);

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<View style={[styles.header, { paddingTop: insets.top + 12 }]}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="chevron-back" size={26} color={colors.text} />
				</TouchableOpacity>
				<Text style={styles.title}>My metrics</Text>
				<View style={{ width: 26 }} />
			</View>

			<View style={styles.platformSelector}>
				{PLATFORMS.map((p) => (
					<TouchableOpacity
						key={p.key}
						style={[
							styles.platformTab,
							selectedPlatform === p.key && {
								backgroundColor: `${p.color}15`,
								borderColor: p.color,
							},
						]}
						onPress={() => setSelectedPlatform(p.key)}
					>
						<FontAwesome5
							name={p.icon}
							size={16}
							color={selectedPlatform === p.key ? p.color : colors.inactive}
						/>
						<Text
							style={[
								styles.platformTabText,
								selectedPlatform === p.key && {
									color: p.color,
									fontWeight: "700",
								},
							]}
						>
							{p.key}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			<View style={styles.card}>
				{METRIC_FIELDS.map((field, index) => (
					<View
						key={field.key}
						style={[
							styles.field,
							index === METRIC_FIELDS.length - 1 && { borderBottomWidth: 0 },
						]}
					>
						<Text style={styles.fieldLabel}>{field.label}</Text>
						<TextInput
							style={styles.fieldInput}
							value={inputs[selectedPlatform][field.key]}
							onChangeText={(val) =>
								setInputs((prev) => ({
									...prev,
									[selectedPlatform]: {
										...prev[selectedPlatform],
										[field.key]: val,
									},
								}))
							}
							keyboardType="numeric"
							placeholder="0"
							placeholderTextColor={colors.inactive}
						/>
					</View>
				))}
			</View>

			<TouchableOpacity
				style={[styles.saveBtn, { borderColor: currentPlat?.color }]}
				onPress={handleSave}
			>
				<FontAwesome5
					name={currentPlat?.icon}
					size={14}
					color={currentPlat?.color}
				/>
				<Text style={[styles.saveBtnText, { color: currentPlat?.color }]}>
					Save {selectedPlatform}
				</Text>
			</TouchableOpacity>

			{Object.keys(metricsData).length > 0 && (
				<MetricsChart metricsData={metricsData} />
			)}

			<SuccessModal
				visible={successVisible}
				message="Metrics updated!"
				onClose={() => setSuccessVisible(false)}
			/>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.backgroundScreen },
	content: { paddingBottom: 40 },
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "800",
		color: colors.text,
		letterSpacing: 0.3,
	},
	platformSelector: {
		flexDirection: "row",
		gap: 8,
		paddingHorizontal: 18,
		marginBottom: 16,
	},
	platformTab: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		paddingVertical: 10,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
	},
	platformTabText: {
		fontSize: 11,
		color: colors.inactive,
		fontWeight: "600",
		letterSpacing: 0.3,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		paddingHorizontal: 14,
		marginHorizontal: 18,
		marginBottom: 14,
	},
	field: {
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	fieldLabel: {
		fontSize: 13,
		fontWeight: "600",
		color: colors.text,
		letterSpacing: 0.3,
	},
	fieldInput: {
		fontSize: 16,
		fontWeight: "700",
		color: colors.text,
		letterSpacing: 0.3,
		textAlign: "right",
		minWidth: 80,
	},
	saveBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		height: 52,
		backgroundColor: colors.backgroundBtn,
		borderRadius: 16,
		borderWidth: 1,
		marginHorizontal: 18,
		marginBottom: 24,
	},
	saveBtnText: { fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
});
