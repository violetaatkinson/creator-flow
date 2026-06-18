import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	Image,
	TextInput,
	Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

import NotificationBell from "../components/NotificationBell";
import SuccessModal from "../components/SuccessModal";
import ErrorModal from "../components/ErrorModal";

export default function ProfileScreen() {
	const insets = useSafeAreaInsets();
	const [name, setName] = useState("");
	const [handle, setHandle] = useState("");
	const [photoUri, setPhotoUri] = useState(null);
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(true);
	const [successVisible, setSuccessVisible] = useState(false);
	const [errorVisible, setErrorVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const showError = (message) => {
		setErrorMessage(message);
		setErrorVisible(true);
	};
	// carga el perfil del usuario desde Firestore al abrir la pantalla
	useEffect(() => {
		const loadProfile = async () => {
			try {
				const ref = doc(db, "users", auth.currentUser.uid);
				const snap = await getDoc(ref);
				if (snap.exists()) {
					const data = snap.data();
					setName(data.name || "");
					setHandle(data.handle || "");
					setPhotoUri(data.photoUri || null);
				}
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		};
		loadProfile();
	}, []);

	const pickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			showError(
				"Please allow access to your photo library to set a profile picture.",
			);
			return;
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.7,
		});
		if (!result.canceled) {
			setPhotoUri(result.assets[0].uri);
		}
	};

	const handleSave = async () => {
		try {
			await setDoc(doc(db, "users", auth.currentUser.uid), {
				name,
				handle,
				photoUri,
				email: auth.currentUser.email,
				updatedAt: new Date(),
			});
			setEditing(false);
			setSuccessVisible(true);
		} catch (error) {
			showError(error.message);
		}
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
				<Text style={styles.title}>Profile</Text>
				<NotificationBell />
			</View>

			{/* foto de perfil */}
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
				<Text style={styles.email}>{auth.currentUser.email}</Text>
			</View>

			{/* campos del perfil */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Your info</Text>
				<View style={styles.card}>
					<View style={styles.field}>
						<Text style={styles.fieldLabel}>Name</Text>
						{editing ? (
							<TextInput
								style={styles.fieldInput}
								value={name}
								onChangeText={setName}
								placeholder="Your name"
								placeholderTextColor={colors.inactive}
							/>
						) : (
							<Text style={styles.fieldValue}>{name || "—"}</Text>
						)}
					</View>

					<View style={[styles.field, { borderBottomWidth: 0 }]}>
						<Text style={styles.fieldLabel}>Handle</Text>
						{editing ? (
							<TextInput
								style={styles.fieldInput}
								value={handle}
								onChangeText={setHandle}
								placeholder="@yourhandle"
								placeholderTextColor={colors.inactive}
								autoCapitalize="none"
							/>
						) : (
							<Text style={styles.fieldValue}>{handle || "—"}</Text>
						)}
					</View>
				</View>
			</View>

			{/* botones */}
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
				<TouchableOpacity
					style={styles.btnEdit}
					onPress={() => setEditing(true)}
				>
					<Ionicons name="pencil-outline" size={16} color={colors.active} />
					<Text style={styles.btnEditText}>Edit profile</Text>
				</TouchableOpacity>
			)}

			{/* logout */}
			<TouchableOpacity style={styles.btnLogout} onPress={() => auth.signOut()}>
				<Ionicons name="log-out-outline" size={16} color={colors.paused} />
				<Text style={styles.btnLogoutText}>Sign out</Text>
			</TouchableOpacity>
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
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 12,
	},
	title: { color: colors.text, fontSize: 24, fontWeight: "800" },
	avatarSection: {
		alignItems: "center",
		paddingVertical: 24,
		gap: 10,
	},
	avatarWrap: { position: "relative" },
	avatar: {
		width: 90,
		height: 90,
		borderRadius: 45,
		borderWidth: 2,
		borderColor: colors.active,
	},
	avatarPlaceholder: {
		width: 90,
		height: 90,
		borderRadius: 45,
		backgroundColor: colors.backgroundBtn,
		borderWidth: 2,
		borderColor: colors.btnBorder,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarInitials: {
		fontSize: 28,
		fontWeight: "800",
		color: colors.active,
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
	email: { fontSize: 13, color: colors.inactive, letterSpacing: 0.3 },
	section: { paddingHorizontal: 18, marginBottom: 16 },
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
	btnRow: {
		flexDirection: "row",
		gap: 10,
		paddingHorizontal: 18,
		marginBottom: 12,
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
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		marginHorizontal: 18,
		height: 52,
		backgroundColor: colors.backgroundBtn,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.btnBorder,
		marginBottom: 12,
	},
	btnEditText: {
		fontSize: 14,
		fontWeight: "700",
		color: colors.active,
		letterSpacing: 0.3,
	},
	btnLogout: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		marginHorizontal: 18,
		height: 52,
		backgroundColor: "rgba(248,113,113,0.08)",
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "rgba(248,113,113,0.2)",
		marginBottom: 40,
	},
	btnLogoutText: {
		fontSize: 14,
		fontWeight: "700",
		color: colors.paused,
		letterSpacing: 0.3,
	},
});
