import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, Linking } from "react-native";
import { useState, useEffect } from "react";
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

export default function ProfileScreen() {
	const insets = useSafeAreaInsets();
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

	const showError = (msg) => {
		setErrorMessage(msg);
		setErrorVisible(true);
	};

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const uid = auth.currentUser.uid;
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
	}, []);

	const pickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			showError("Please allow access to your photo library.");
			return;
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.7,
		});
		if (!result.canceled) setPhotoUri(result.assets[0].uri);
	};

	const handleSave = async () => {
		try {
			const uid = auth.currentUser.uid;
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

	if (loading) return <View style={styles.container} />;

	return (
		<ScrollView style={styles.container}>
			<View style={[styles.header, { paddingTop: insets.top + 12 }]}>
				<View style={{ width: 38 }} />
				<View />
				<NotificationBell />
			</View>

			<View style={styles.avatarSection}>
				<TouchableOpacity
					style={styles.avatarWrap}
					onPress={editing ? pickImage : null}
				>
					{photoUri ? (
						<Image source={{ uri: photoUri }} style={styles.avatar} />
					) : (
						<View style={styles.avatarPlaceholder}>
							<Text style={styles.avatarInitials}>{initials}</Text>
						</View>
					)}
					{editing && (
						<View style={styles.avatarOverlay}>
							<Ionicons name="camera-outline" size={20} color="#fff" />
						</View>
					)}
				</TouchableOpacity>

				{name && !editing ? (
					<View style={styles.profileInfo}>
						<Text style={styles.profileName}>{name}</Text>
						{handle ? <Text style={styles.profileHandle}>{handle}</Text> : null}
						{bio ? <Text style={styles.profileBio}>{bio}</Text> : null}
					</View>
				) : (
					<Text style={styles.email}>{auth.currentUser?.email}</Text>
				)}
			</View>

			{(instagram || tiktok || youtube) && !editing && (
				<View style={styles.platformRow}>
					{instagram ? (
						<TouchableOpacity
							style={styles.platformBtn}
							onPress={() => openPlatform("instagram", instagram)}
						>
							<FontAwesome5
								name="instagram"
								size={18}
								color={plataforms.instagram}
							/>
						</TouchableOpacity>
					) : null}
					{tiktok ? (
						<TouchableOpacity
							style={styles.platformBtn}
							onPress={() => openPlatform("tiktok", tiktok)}
						>
							<FontAwesome5 name="tiktok" size={18} color={colors.text} />
						</TouchableOpacity>
					) : null}
					{youtube ? (
						<TouchableOpacity
							style={styles.platformBtn}
							onPress={() => openPlatform("youtube", youtube)}
						>
							<FontAwesome5
								name="youtube"
								size={18}
								color={plataforms.youtube}
							/>
						</TouchableOpacity>
					) : null}
				</View>
			)}

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
				message="Your profile has been updated."
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
	avatarWrap: { position: "relative" },
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
	avatarOverlay: {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: colors.active,
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
	platformRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 12,
		marginBottom: 20,
	},
	platformBtn: {
		width: 44,
		height: 44,
		borderRadius: 12,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: "center",
		justifyContent: "center",
	},
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
	fieldValue: {
		fontSize: 14,
		color: colors.text,
		fontWeight: "500",
		letterSpacing: 0.3,
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
});
