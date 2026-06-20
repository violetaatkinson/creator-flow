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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {
	collection,
	query,
	where,
	getDocs,
	doc,
	setDoc,
	getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { colors } from "../constants/colors";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import NotificationBell from "../components/NotificationBell";
import SuccessModal from "../components/SuccessModal";
import ErrorModal from "../components/ErrorModal";

const MONTHS = [
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

export default function ProfileScreen() {
	const insets = useSafeAreaInsets();
	const [name, setName] = useState("");
	const [handle, setHandle] = useState("");
	const [instagram, setInstagram] = useState("");
	const [tiktok, setTiktok] = useState("");
	const [youtube, setYoutube] = useState("");
	const [photoUri, setPhotoUri] = useState(null);
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(true);
	const [successVisible, setSuccessVisible] = useState(false);
	const [errorVisible, setErrorVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [reportPeriod, setReportPeriod] = useState(null);

	const showError = (msg) => {
		setErrorMessage(msg);
		setErrorVisible(true);
	};

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
				if (snap.exists()) {
					const d = snap.data();
					setName(d.name || "");
					setHandle(d.handle || "");
					setInstagram(d.instagram || "");
					setTiktok(d.tiktok || "");
					setYoutube(d.youtube || "");
					setPhotoUri(d.photoUri || null);
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
			await setDoc(doc(db, "users", auth.currentUser.uid), {
				name,
				handle,
				instagram,
				tiktok,
				youtube,
				photoUri,
				email: auth.currentUser.email,
				updatedAt: new Date(),
			});
			setEditing(false);
			setSuccessVisible(true);
		} catch (e) {
			showError(e.message);
		}
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

	const generateReport = async (period) => {
		try {
			const uid = auth.currentUser.uid;
			const now = new Date();
			const currentYear = now.getFullYear();
			const currentMonth = now.getMonth();

			const [campSnap, expSnap] = await Promise.all([
				getDocs(query(collection(db, "campaigns"), where("userId", "==", uid))),
				getDocs(query(collection(db, "expenses"), where("userId", "==", uid))),
			]);
			const campaigns = campSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
			const expenses = expSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

			const getMonthIndex = (dateStr) => {
				if (!dateStr) return -1;
				const lower = dateStr.toLowerCase();
				return MONTHS.findIndex((m) => lower.includes(m.toLowerCase()));
			};

			let filteredCampaigns = campaigns.filter(
				(c) => c.status === "Completed" || c.status === "Active",
			);
			let filteredExpenses = expenses;
			let periodLabel = "";

			if (period === "month") {
				periodLabel = `${MONTHS[currentMonth]} ${currentYear}`;
				filteredCampaigns = filteredCampaigns.filter(
					(c) => getMonthIndex(c.date) === currentMonth,
				);
				filteredExpenses = filteredExpenses.filter(
					(e) => e.month === currentMonth + 1 && e.year === currentYear,
				);
			} else if (period === "semester") {
				const months = Array.from(
					{ length: 6 },
					(_, i) => (currentMonth - i + 12) % 12,
				);
				periodLabel = `Last 6 months — ${currentYear}`;
				filteredCampaigns = filteredCampaigns.filter((c) =>
					months.includes(getMonthIndex(c.date)),
				);
				filteredExpenses = filteredExpenses.filter(
					(e) =>
						months.includes((e.month - 1 + 12) % 12) && e.year === currentYear,
				);
			} else {
				periodLabel = `Year ${currentYear}`;
				filteredExpenses = filteredExpenses.filter(
					(e) => e.year === currentYear,
				);
			}

			const totalIncome = filteredCampaigns.reduce(
				(sum, c) => sum + c.payment,
				0,
			);
			const totalExpenses = filteredExpenses.reduce(
				(sum, e) => sum + e.amount,
				0,
			);
			const net = totalIncome - totalExpenses;

			const campaignRows = filteredCampaigns
				.map(
					(c) => `
        <tr>
          <td>${c.brand}</td>
          <td>${c.platform}</td>
          <td>${c.type}</td>
          <td>${c.date || "—"}</td>
          <td style="color:#4ade80">+$${c.payment}</td>
          <td>${c.status}</td>
        </tr>
      `,
				)
				.join("");

			const expenseRows = filteredExpenses
				.map(
					(e) => `
        <tr>
          <td>${e.description}</td>
          <td>${e.category}</td>
          <td>${e.date || "—"}</td>
          <td style="color:#f87171">-$${e.amount}</td>
        </tr>
      `,
				)
				.join("");

			const html = `
        <html>
        <head>
          <meta charset="utf-8"/>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
            h1 { font-size: 28px; margin-bottom: 4px; }
            h2 { font-size: 16px; font-weight: normal; color: #666; margin-bottom: 32px; }
            h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin: 24px 0 8px; }
            .kpis { display: flex; gap: 16px; margin-bottom: 32px; }
            .kpi { flex: 1; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; }
            .kpi-label { font-size: 11px; text-transform: uppercase; color: #888; }
            .kpi-value { font-size: 24px; font-weight: bold; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { text-align: left; padding: 8px 12px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-size: 11px; text-transform: uppercase; color: #888; }
            td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
            .footer { margin-top: 48px; font-size: 11px; color: #aaa; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Creator Flow — Report</h1>
          <h2>${periodLabel} · ${name || auth.currentUser.email}</h2>

          <div class="kpis">
            <div class="kpi">
              <div class="kpi-label">Income</div>
              <div class="kpi-value" style="color:#4ade80">$${totalIncome}</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">Expenses</div>
              <div class="kpi-value" style="color:#f87171">-$${totalExpenses}</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">Net</div>
              <div class="kpi-value" style="color:${net >= 0 ? "#4ade80" : "#f87171"}">$${net}</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">Campaigns</div>
              <div class="kpi-value">${filteredCampaigns.length}</div>
            </div>
          </div>

          <h3>Campaigns</h3>
          <table>
            <thead><tr><th>Brand</th><th>Platform</th><th>Type</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>${campaignRows || "<tr><td colspan='6' style='color:#aaa;text-align:center;padding:20px'>No campaigns</td></tr>"}</tbody>
          </table>

          <h3>Expenses</h3>
          <table>
            <thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th></tr></thead>
            <tbody>${expenseRows || "<tr><td colspan='4' style='color:#aaa;text-align:center;padding:20px'>No expenses</td></tr>"}</tbody>
          </table>

          <div class="footer">Generated by Creator Flow · ${now.toLocaleDateString()}</div>
        </body>
        </html>
      `;

			const { uri } = await Print.printToFileAsync({ html });
			await Sharing.shareAsync(uri, {
				UTI: ".pdf",
				mimeType: "application/pdf",
			});
		} catch (e) {
			showError("Could not generate report: " + e.message);
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

			{(instagram || tiktok || youtube) && !editing && (
				<View style={styles.platformRow}>
					{instagram ? (
						<TouchableOpacity
							style={styles.platformBtn}
							onPress={() => openPlatform("instagram", instagram)}
						>
							<FontAwesome5 name="instagram" size={18} color="#E1306C" />
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
							<FontAwesome5 name="youtube" size={18} color="#FF0000" />
						</TouchableOpacity>
					) : null}
				</View>
			)}

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
								onPress={() => generateReport(p)}
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
						<Ionicons name="pencil-outline" size={16} color={colors.active} />
						<Text style={styles.btnEditText}>Edit profile</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.btnLogout}
						onPress={() => auth.signOut()}
					>
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
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 12,
	},
	title: { color: colors.text, fontSize: 24, fontWeight: "800" },
	avatarSection: { alignItems: "center", paddingVertical: 24, gap: 10 },
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
		color: colors.active,
		letterSpacing: 0.3,
	},
	btnLogout: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		height: 52,
		backgroundColor: "rgba(248,113,113,0.08)",
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "rgba(248,113,113,0.2)",
	},
	btnLogoutText: {
		fontSize: 14,
		fontWeight: "700",
		color: colors.paused,
		letterSpacing: 0.3,
	},
});
