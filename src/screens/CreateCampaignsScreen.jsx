import { View, Text, StyleSheet, TouchableOpacity,ScrollView } from "react-native";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import FormInput from "../components/FormInput";
import OptionSelector from "../components/OptionSelector";
import ErrorModal from "../components/ErrorModal";
import { createNotification } from "../services/notificationService";

const PLATFORMS = ["Instagram", "TikTok", "YouTube"];
const TYPES = ["Post", "Reel", "Story", "Live", "Video"];
const STATUSES = ["Pending", "Active", "Paused", "Completed"];

export default function CreateCampaignScreen({ navigation }) {
	const [brand, setBrand] = useState("");
	const [platform, setPlatform] = useState("Instagram");
	const [type, setType] = useState("Post");
	const [date, setDate] = useState("");
	const [payment, setPayment] = useState("");
	const [status, setStatus] = useState("Pending");
	const [errorVisible, setErrorVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const showError = (message) => {
		setErrorMessage(message);
		setErrorVisible(true);
	};

	const handleCreate = async () => {
		if (!brand || !date || !payment || !type || !platform) {
			showError("Complete all fields to continue.");
			return;
		}
		try {
			await addDoc(collection(db, "campaigns"), {
				brand: brand.charAt(0).toUpperCase() + brand.slice(1),
				platform,
				type,
				date,
				payment: Number(payment),
				status,
				userId: auth.currentUser.uid,
				createdAt: new Date(),
			});

			await createNotification({
				userId: auth.currentUser.uid,
				type: "campaign_created",
				message: "New Campaign",
				detail: brand.charAt(0).toUpperCase() + brand.slice(1),
				amount: Number(payment),
				campaignId: null,
			});

			navigation.goBack();
		} catch (error) {
			showError(error.message);
		}
	};

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<View style={styles.titleRow}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="chevron-back" size={26} color={colors.text} />
				</TouchableOpacity>
				<Text style={styles.title}>New Campaign</Text>
				<View style={{ width: 26 }} />
			</View>

			<FormInput
				label="Brand"
				placeholder="e.g. Nike"
				value={brand}
				onChangeText={setBrand}
			/>

			<Text style={styles.label}>Platform</Text>
			<OptionSelector
				options={PLATFORMS}
				selected={platform}
				onSelect={setPlatform}
			/>

			<Text style={styles.label}>Content type</Text>
			<OptionSelector options={TYPES} selected={type} onSelect={setType} />

			<FormInput
				label="Date"
				placeholder="e.g. 10 Apr"
				value={date}
				onChangeText={setDate}
			/>

			<FormInput
				label="Payment ($)"
				placeholder="e.g. 500"
				value={payment}
				onChangeText={setPayment}
				keyboardType="numeric"
			/>

			<Text style={styles.label}>Status</Text>
			<OptionSelector
				options={STATUSES}
				selected={status}
				onSelect={setStatus}
			/>

			<TouchableOpacity style={styles.btn} onPress={handleCreate}>
				<Text style={styles.btnText}>Create Campaign</Text>
			</TouchableOpacity>

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
	content: { padding: 24, paddingTop: 60, paddingBottom: 60 },
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 32,
	},
	title: {
		fontSize: 24,
		fontWeight: "800",
		color: colors.text,
		letterSpacing: 0.3,
	},
	label: {
		fontSize: 12,
		fontWeight: "600",
		color: colors.inactive,
		textTransform: "uppercase",
		letterSpacing: 0.8,
		marginBottom: 8,
	},
	btn: {
		width: "100%",
		height: 62,
		backgroundColor: colors.backgroundBtn,
		borderRadius: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: colors.btnBorder,
		marginTop: 16,
	},
	btnText: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.active,
		letterSpacing: 0.3,
	},
});
