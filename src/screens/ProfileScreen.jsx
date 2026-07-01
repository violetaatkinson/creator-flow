import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	Image,
	TextInput,
	Linking,
} from "react-native";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../firebase/firebaseConfig";
import { getDB } from "../database/db";
import { colors, plataforms, btnLogout } from "../constants/colors";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import NotificationBell from "../components/NotificationBell";
import SuccessModal from "../components/SuccessModal";
import ErrorModal from "../components/ErrorModal";
import { generateReport } from "../services/reportService";
import { loadMetrics } from "../store/metricsSlice";

const PLATFORMS = [
	{ key: "Instagram", icon: "instagram", color: plataforms.instagram },
	{ key: "TikTok", icon: "tiktok", color: colors.text },
	{ key: "YouTube", icon: "youtube", color: plataforms.youtube },
];

export default function ProfileScreen({ navigation }) {
	const insets = useSafeAreaInsets();
	const dispatch = useDispatch();

	const user = useSelector((state) => state.auth.user);
	const metricsData = useSelector((state) => state.metrics.data);

	const [name, setName] = useState("");
	const [handle, setHandle] = useState("");
	const [bio, setBio] = useState("");
	const [instagram, setInstagram] = useState("");
	const [tiktok, setTiktok] = useState("");
	const [youtube, setYoutube] = useState("");
	const [photoUri, setPhotoUri] = useState(null);
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(true);
	const [successVisible, setSuccessVisible] = useState(false);
	const [errorVisible, setErrorVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [selectedMetricPlatform, setSelectedMetricPlatform] = useState(null);

	const showError = (msg) => {
		setErrorMessage(msg);
		setErrorVisible(true);
	};

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const uid = user?.uid;
				if (!uid) return;
				const db = await getDB();
				const profile = await db.getFirstAsync(
					"SELECT * FROM users WHERE uid = ?",
					[uid],
				);
				if (profile) {
					setName(profile.name || "");
					setHandle(profile.handle || "");
					setBio(profile.bio || "");
					setInstagram(profile.instagram || "");
					setTiktok(profile.tiktok || "");
					setYoutube(profile.youtube || "");
					setPhotoUri(profile.photoUri || null);
				}
			} catch (e) {
				console.log(e);
			} finally {
				setLoading(false);
			}
		};
		loadProfile();
		dispatch(loadMetrics());
	}, [user]);

	const openCamera = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== "granted") {
			showError("Please allow camera access.");
			return;
		}
		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.3,
			base64: true,
		});
		if (!result.canceled) {
			const photo = `data:image/jpeg;base64,${result.assets[0].base64}`;
			setPhotoUri(photo);
		}
	};

	const openGallery = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			showError("Please allow access to your photo library.");
			return;
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.3,
			base64: true,
		});
		if (!result.canceled) {
			const photo = `data:image/jpeg;base64,${result.assets[0].base64}`;
			setPhotoUri(photo);
		}
	};

	const handleSave = async () => {
		try {
			const uid = user?.uid;
			if (!uid) return;
			const db = await getDB();
			await db.runAsync(
				`INSERT INTO users (uid, name, handle, bio, instagram, tiktok, youtube, photoUri, updatedAt)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
				 ON CONFLICT(uid) DO UPDATE SET
				 name=excluded.name, handle=excluded.handle, bio=excluded.bio,
				 instagram=excluded.instagram, tiktok=excluded.tiktok,
				 youtube=excluded.youtube, photoUri=excluded.photoUri, updatedAt=excluded.updatedAt`,
				[
					uid,
					name,
					handle,
					bio,
					instagram,
					tiktok,
					youtube,
					photoUri || "",
					new Date().toISOString(),
				],
			);
			setEditing(false);
			setSuccessVisible(true);
		} catch (e) {
			showError(e.message);
		}
	};

	const handleLogout = async () => {
		await auth.signOut();
	};

	const openPlatform = (platform, username) => {
		if (!username) return;
		const clean = username.replace("@", "");
		const urls = {
			instagram: `https://instagram.com/${clean}`,
			tiktok: `https://tiktok.com/@${clean}`,
			youtube: `https://youtube.com/@${clean}`,
		};
		Linking.openURL(urls[platform]);
	};

	const initials = name
		? name
				.split(" ")
				.map((w) => w[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "?";

	const activePlatforms = PLATFORMS.filter((p) => {
		if (p.key === "Instagram") return !!instagram;
		if (p.key === "TikTok") return !!tiktok;
		if (p.key === "YouTube") return !!youtube;
		return false;
	});

	if (loading) return <View style={styles.container} />;

	return (
		<ScrollView style={styles.container}>
			<View style={[styles.header, { paddingTop: insets.top + 12 }]}>
				<View style={{ width: 38 }} />
				<View />
				<NotificationBell />
			</View>

			<View style={styles.avatarSection}>
				<View style={styles.avatarWrap}>
					{photoUri ? (
						<Image source={{ uri: photoUri }} style={styles.avatar} />
					) : (
						<View style={styles.avatarPlaceholder}>
							<Text style={styles.avatarInitials}>{initials}</Text>
						</View>
					)}
					{editing && (
						<View style={styles.avatarBtns}>
							<TouchableOpacity
								style={styles.avatarActionBtn}
								onPress={openCamera}
							>
								<Ionicons name="camera-outline" size={16} color={colors.text} />
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.avatarActionBtn}
								onPress={openGallery}
							>
								<Ionicons name="images-outline" size={16} color={colors.text} />
							</TouchableOpacity>
						</View>
					)}
				</View>

				{name && !editing ? (
					<View style={styles.profileInfo}>
						<Text style={styles.profileName}>{name}</Text>
						{handle ? <Text style={styles.profileHandle}>{handle}</Text> : null}
						{bio ? <Text style={styles.profileBio}>{bio}</Text> : null}
					</View>
				) : (
					<Text style={styles.email}>{user?.email}</Text>
				)}
			</View>

			{editing && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Your info</Text>
					<View style={styles.card}>
						<View style={styles.field}>
							<Text style={styles.fieldLabel}>Name</Text>
							<TextInput
								style={styles.fieldInput}
								value={name}
								onChangeText={setName}
								placeholder="Your name"
								placeholderTextColor={colors.inactive}
							/>
						</View>
						<View style={styles.field}>
							<Text style={styles.fieldLabel}>Handle</Text>
							<TextInput
								style={styles.fieldInput}
								value={handle}
								onChangeText={setHandle}
								placeholder="@yourhandle"
								placeholderTextColor={colors.inactive}
								autoCapitalize="none"
							/>
						</View>
						<View style={[styles.field, { borderBottomWidth: 0 }]}>
							<Text style={styles.fieldLabel}>Bio</Text>
							<TextInput
								style={styles.fieldInput}
								value={bio}
								onChangeText={setBio}
								placeholder="e.g. Lifestyle & travel creator"
								placeholderTextColor={colors.inactive}
							/>
						</View>
					</View>
				</View>
			)}

			{editing && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Social platforms</Text>
					<View style={styles.card}>
						<View style={styles.field}>
							<Text style={styles.fieldLabel}>Instagram</Text>
							<TextInput
								style={styles.fieldInput}
								value={instagram}
								onChangeText={setInstagram}
								placeholder="@handle"
								placeholderTextColor={colors.inactive}
								autoCapitalize="none"
							/>
						</View>
						<View style={styles.field}>
							<Text style={styles.fieldLabel}>TikTok</Text>
							<TextInput
								style={styles.fieldInput}
								value={tiktok}
								onChangeText={setTiktok}
								placeholder="@handle"
								placeholderTextColor={colors.inactive}
								autoCapitalize="none"
							/>
						</View>
						<View style={[styles.field, { borderBottomWidth: 0 }]}>
							<Text style={styles.fieldLabel}>YouTube</Text>
							<TextInput
								style={styles.fieldInput}
								value={youtube}
								onChangeText={setYoutube}
								placeholder="@handle"
								placeholderTextColor={colors.inactive}
								autoCapitalize="none"
							/>
						</View>
					</View>
				</View>
			)}

			{!editing && activePlatforms.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Platform metrics</Text>
					<View style={styles.metricToggle}>
						{activePlatforms.map((plat) => {
							const isSelected =
								(selectedMetricPlatform || activePlatforms[0].key) === plat.key;
							return (
								<TouchableOpacity
									key={plat.key}
									style={[
										styles.metricToggleBtn,
										isSelected && {
											backgroundColor: `${plat.color}15`,
											borderColor: plat.color,
										},
									]}
									onPress={() => setSelectedMetricPlatform(plat.key)}
								>
									<FontAwesome5
										name={plat.icon}
										size={13}
										color={isSelected ? plat.color : colors.inactive}
									/>
								</TouchableOpacity>
							);
						})}
					</View>

					{(() => {
						const activeKey = selectedMetricPlatform || activePlatforms[0].key;
						const plat = activePlatforms.find((p) => p.key === activeKey);
						const handleMap = {
							Instagram: instagram,
							TikTok: tiktok,
							YouTube: youtube,
						};
						return (
							<TouchableOpacity
								style={[
									styles.metricDetailCard,
									{ borderTopColor: plat.color },
								]}
								onPress={() =>
									openPlatform(plat.key.toLowerCase(), handleMap[plat.key])
								}
								activeOpacity={0.8}
							>
								<View style={styles.metricCardHeader}>
									<FontAwesome5 name={plat.icon} size={14} color={plat.color} />
									<Text style={[styles.metricCardName, { color: plat.color }]}>
										{plat.key}
									</Text>
									<Ionicons
										name="open-outline"
										size={12}
										color={colors.inactive}
									/>
								</View>
								<Text style={styles.metricDetailValue}>
									{metricsData[plat.key]?.followers
										? Number(metricsData[plat.key].followers).toLocaleString()
										: "—"}
								</Text>
								<Text style={styles.metricCardLabel}>Followers</Text>
							</TouchableOpacity>
						);
					})()}

					<TouchableOpacity
						style={styles.metricsBtn}
						onPress={() => navigation.navigate("Metrics")}
					>
						<Ionicons
							name="stats-chart-outline"
							size={16}
							color={colors.primary}
						/>
						<Text style={styles.metricsBtnText}>Edit Metrics</Text>
					</TouchableOpacity>
				</View>
			)}

			{!editing && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Export report</Text>
					<View style={styles.reportRow}>
						{["month", "semester", "year"].map((p) => (
							<TouchableOpacity
								key={p}
								style={styles.reportBtn}
								onPress={() =>
									generateReport(p, name).catch((e) => showError(e.message))
								}
							>
								<Ionicons
									name="document-text-outline"
									size={16}
									color={colors.active}
								/>
								<Text style={styles.reportBtnText}>
									{p === "month"
										? "Monthly"
										: p === "semester"
											? "Semester"
											: "Annual"}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
			)}

			{editing ? (
				<View style={styles.btnRow}>
					<TouchableOpacity
						style={styles.btnCancel}
						onPress={() => setEditing(false)}
					>
						<Text style={styles.btnCancelText}>Cancel</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btnSave} onPress={handleSave}>
						<Text style={styles.btnSaveText}>Save</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View style={styles.btnRow}>
					<TouchableOpacity
						style={styles.btnEdit}
						onPress={() => setEditing(true)}
					>
						<Ionicons name="pencil-outline" size={16} color={colors.primary} />
						<Text style={styles.btnEditText}>Edit profile</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
						<Ionicons name="log-out-outline" size={16} color={colors.paused} />
						<Text style={styles.btnLogoutText}>Sign out</Text>
					</TouchableOpacity>
				</View>
			)}

			<SuccessModal
				visible={successVisible}
				message="Profile updated!"
				onClose={() => setSuccessVisible(false)}
			/>
			<ErrorModal
				visible={errorVisible}
				message={errorMessage}
				onClose={() => setErrorVisible(false)}
			/>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.backgroundScreen },
	header: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 12,
	},
	avatarSection: { alignItems: "center", paddingVertical: 24, gap: 10 },
	avatarWrap: { alignItems: "center", gap: 10 },
	avatar: {
		width: 90,
		height: 90,
		borderRadius: 45,
		borderWidth: 3,
		borderColor: colors.primary,
	},
	avatarPlaceholder: {
		width: 90,
		height: 90,
		borderRadius: 45,
		backgroundColor: colors.backgroundBtn,
		borderWidth: 3,
		borderColor: colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarInitials: {
		fontSize: 28,
		fontWeight: "800",
		color: colors.primary,
		letterSpacing: 0.3,
	},
	avatarBtns: { flexDirection: "row", gap: 8 },
	avatarActionBtn: {
		width: 38,
		height: 38,
		borderRadius: 10,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: "center",
		justifyContent: "center",
	},
	profileInfo: { alignItems: "center", gap: 4, marginTop: 4 },
	profileName: {
		fontSize: 24,
		fontWeight: "800",
		color: colors.primary,
		letterSpacing: 0.3,
	},
	profileHandle: {
		fontSize: 14,
		color: colors.inactive,
		letterSpacing: 0.3,
		marginTop: 6,
		marginBottom: 6,
	},
	profileBio: {
		fontSize: 13,
		color: colors.text,
		letterSpacing: 0.3,
		textAlign: "center",
		marginTop: 2,
		paddingHorizontal: 20,
		fontStyle: "italic",
		textTransform: "capitalize",
	},
	email: { fontSize: 13, color: colors.inactive, letterSpacing: 0.3 },
	section: { paddingHorizontal: 18, marginBottom: 16 },
	sectionTitle: {
		fontSize: 11,
		fontWeight: "600",
		color: colors.inactive,
		textTransform: "uppercase",
		letterSpacing: 0.8,
		marginBottom: 12,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		paddingHorizontal: 14,
	},
	field: {
		paddingVertical: 13,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
		gap: 4,
	},
	fieldLabel: {
		fontSize: 11,
		color: colors.inactive,
		textTransform: "uppercase",
		letterSpacing: 0.6,
	},
	fieldInput: {
		fontSize: 14,
		color: colors.text,
		fontWeight: "500",
		letterSpacing: 0.3,
		paddingVertical: 2,
	},
	reportRow: { flexDirection: "row", gap: 8 },
	reportBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		height: 46,
		backgroundColor: colors.backgroundBtn,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.btnBorder,
	},
	reportBtnText: {
		fontSize: 12,
		fontWeight: "600",
		color: colors.active,
		letterSpacing: 0.3,
	},
	btnRow: {
		flexDirection: "row",
		gap: 10,
		paddingHorizontal: 18,
		marginBottom: 40,
	},
	btnCancel: {
		flex: 1,
		height: 52,
		backgroundColor: colors.surface,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: colors.border,
	},
	btnCancelText: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.inactive,
		letterSpacing: 0.3,
	},
	btnSave: {
		flex: 1,
		height: 52,
		backgroundColor: colors.backgroundBtn,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: colors.btnBorder,
	},
	btnSaveText: {
		fontSize: 14,
		fontWeight: "700",
		color: colors.active,
		letterSpacing: 0.3,
	},
	btnEdit: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		height: 52,
		backgroundColor: colors.backgroundBtn,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.btnBorder,
	},
	btnEditText: {
		fontSize: 14,
		fontWeight: "700",
		color: colors.primary,
		letterSpacing: 0.3,
	},
	btnLogout: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		height: 52,
		backgroundColor: btnLogout.bg,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: btnLogout.btnBorder,
	},
	btnLogoutText: {
		fontSize: 14,
		fontWeight: "700",
		color: colors.paused,
		letterSpacing: 0.3,
	},
	metricToggle: { flexDirection: "row", gap: 8, marginBottom: 12 },
	metricToggleBtn: {
		width: 44,
		height: 44,
		borderRadius: 12,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: "center",
		justifyContent: "center",
	},
	metricDetailCard: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		borderTopWidth: 2,
		padding: 16,
		alignItems: "center",
		gap: 4,
		marginBottom: 8,
	},
	metricCardHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
	metricCardName: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
	metricDetailValue: {
		fontSize: 28,
		fontWeight: "800",
		color: colors.text,
		letterSpacing: 0.3,
		marginTop: 4,
	},
	metricCardLabel: {
		fontSize: 10,
		color: colors.inactive,
		textTransform: "uppercase",
		letterSpacing: 0.6,
	},
	metricsBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		height: 42,
		backgroundColor: colors.backgroundBtn,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.btnBorder,
	},
	metricsBtnText: {
		fontSize: 13,
		fontWeight: "600",
		color: colors.primary,
		letterSpacing: 0.3,
	},
});
