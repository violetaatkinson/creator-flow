import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, errorModal } from "../constants/colors";

export default function ErrorModal({ visible, message, onClose }) {
	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType="slide"
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<View style={styles.card}>
					<View style={styles.iconWrap}>
						<Ionicons name="alert-circle-outline" size={32} color={colors.paused} />
					</View>
					<Text style={styles.title}>Oops!</Text>
					<Text style={styles.message}>{message}</Text>
					<TouchableOpacity style={styles.btn} onPress={onClose}>
						<Text style={styles.btnText}>Got it</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: errorModal.bg,
		justifyContent: "center",
		paddingHorizontal: 16,
		paddingBottom: 34,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: 24,
		padding: 28,
		alignItems: "center",
		borderWidth: 1,
	},
	iconWrap: {
		width: 56,
		height: 56,
		borderRadius: 16,
		backgroundColor: errorModal.iconWrap,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: "800",
		color: colors.text,
		marginBottom: 8,
		letterSpacing: 0.3,
	},
	message: {
		fontSize: 14,
		color: colors.inactive,
		textAlign: "center",
		lineHeight: 20,
		letterSpacing: 0.3,
		marginBottom: 24,
	},
	btn: {
		width: "100%",
		height: 52,
		backgroundColor: errorModal.btnBg,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: errorModal.btnBorder,
	},
	btnText: {
		fontSize: 15,
		fontWeight: "700",
		color: colors.paused,
		letterSpacing: 0.3,
	},
});
