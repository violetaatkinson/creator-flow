import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { useState } from "react";
import { getDB } from "../database/db";
import { getCurrentUserId } from "../database/authService";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import FormInput from "../components/FormInput";
import OptionSelector from "../components/OptionSelector";
import ErrorModal from "../components/ErrorModal";
import { createNotification } from "../services/notificationService";

const CATEGORIES = ["Production", "Tools", "Travel", "Other"];
const MONTHS_EN = [
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

export default function AddExpenseScreen({ navigation }) {
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState("Production");
	const [date, setDate] = useState("");
	const [errorVisible, setErrorVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const showError = (message) => {
		setErrorMessage(message);
		setErrorVisible(true);
	};

	const getMonthFromDate = (dateStr) => {
		if (!dateStr) return new Date().getMonth() + 1;
		const lower = dateStr.toLowerCase();
		for (let i = 0; i < MONTHS_EN.length; i++) {
			if (lower.includes(MONTHS_EN[i].toLowerCase())) return i + 1;
		}
		return new Date().getMonth() + 1;
	};

	const capitalize = (text) => {
		if (!text) return "";
		return text.trim().charAt(0).toUpperCase() + text.trim().slice(1);
	};

	const handleAdd = async () => {
		if (!description || !amount || !date) {
			showError("Please fill in all fields.");
			return;
		}
		try {
			const db = await getDB();
			const userId = await getCurrentUserId();
			const month = getMonthFromDate(date);
			const descFormatted = capitalize(description);

			await db.runAsync(
				`INSERT INTO expenses (userId, description, amount, category, date, month, year, createdAt)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					userId,
					descFormatted,
					Number(amount),
					category,
					date,
					month,
					new Date().getFullYear(),
					new Date().toISOString(),
				],
			);

			await createNotification({
				userId,
				type: "expense_added",
				message: "New expense",
				detail: descFormatted,
				amount: -Number(amount),
				campaignId: null,
			});

			navigation.goBack();
		} catch (error) {
			showError(error.message);
		}
	};

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.titleRow}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="chevron-back" size={26} color={colors.text} />
				</TouchableOpacity>
				<Text style={styles.title}>Add Expense</Text>
				<View style={{ width: 26 }} />
			</View>

			<FormInput
				label="Description"
				placeholder="e.g. Uber trip"
				value={description}
				onChangeText={setDescription}
			/>
			<FormInput
				label="Amount ($)"
				placeholder="e.g. 150"
				value={amount}
				onChangeText={setAmount}
				keyboardType="numeric"
			/>
			<FormInput
				label="Date"
				placeholder="e.g. 10 Apr"
				value={date}
				onChangeText={setDate}
			/>

			<Text style={styles.label}>Category</Text>
			<OptionSelector
				options={CATEGORIES}
				selected={category}
				onSelect={setCategory}
			/>

			<TouchableOpacity style={styles.btn} onPress={handleAdd}>
				<Text style={styles.btnText}>Add Expense</Text>
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
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: colors.btnBorder,
		marginTop: 8,
	},
	btnText: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.active,
		letterSpacing: 0.3,
	},
});
