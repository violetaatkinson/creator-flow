import { memo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colorALight, colors, colorEdit, colorDelete } from "../constants/colors";

const statusColors = {
	Active: colors.active,
	Pending: colors.pending,
	Paused: colors.paused,
	Completed: colors.inactive,
};

const STATUSES = ["Pending", "Active", "Paused", "Completed"];

const avatarColors = [
	{ bg: colorALight.bga, text: colors.primary },
	{ bg: colorALight.bgb, text: colors.avatarT },
	{ bg: colorALight.bgc, text: colors.pending },
	{ bg: colorALight.bgd, text: colors.paused },
	{ bg: colorALight.bge, text: colors.avatarTB },
];

const MONTHS_EN = [
	"jan",
	"feb",
	"mar",
	"apr",
	"may",
	"jun",
	"jul",
	"aug",
	"sep",
	"oct",
	"nov",
	"dec",
];
const MONTHS_ES = [
	"Ene",
	"Feb",
	"Mar",
	"Abr",
	"May",
	"Jun",
	"Jul",
	"Ago",
	"Sep",
	"Oct",
	"Nov",
	"Dic",
];

function formatDate(date) {
	if (!date) return "";
	const lower = date.toLowerCase();
	for (let i = 0; i < MONTHS_EN.length; i++) {
		if (lower.includes(MONTHS_EN[i])) {
			return date.replace(new RegExp(MONTHS_EN[i], "i"), MONTHS_ES[i]);
		}
	}
	return date;
}

const CampaignCard = memo(({ item, index, onEdit }) => {
	const [showStatuses, setShowStatuses] = useState(false);
	const avatarColor = avatarColors[index % avatarColors.length];

	const handleStatusChange = async (newStatus) => {
		try {
			await updateDoc(doc(db, "campaigns", item.id), { status: newStatus });
			setShowStatuses(false);
		} catch (error) {
			console.log(error);
		}
	};

	const handleDelete = () => {
		Alert.alert(
			"Delete campaign",
			`Are you sure you want to delete ${item.brand}?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await deleteDoc(doc(db, "campaigns", item.id));
						} catch (error) {
							console.log(error);
						}
					},
				},
			],
		);
	};

	const renderRightActions = () => (
		<View style={styles.swipeActions}>
			<TouchableOpacity
				style={[styles.actionBtn, styles.editBtn]}
				onPress={() => onEdit(item)}
			>
				<Text style={styles.actionText}>Edit</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.actionBtn, styles.deleteBtn]}
				onPress={handleDelete}
			>
				<Text style={styles.actionText}>Delete</Text>
			</TouchableOpacity>
		</View>
	);

	return (
		<Swipeable renderRightActions={renderRightActions}>
			<View style={styles.card}>
				<View style={styles.row}>
					<View style={[styles.avatar, { backgroundColor: avatarColor.bg }]}>
						<Text style={[styles.avatarText, { color: avatarColor.text }]}>
							{item.brand.slice(0, 2).toUpperCase()}
						</Text>
					</View>
					<View style={styles.info}>
						<Text style={styles.brandName}>{item.brand}</Text>
						<Text style={styles.detail}>
							{item.type} · {formatDate(item.date)} · ${item.payment}
						</Text>
					</View>
					<TouchableOpacity
						style={[
							styles.pill,
							{ backgroundColor: `${statusColors[item.status]}20` },
						]}
						onPress={() => setShowStatuses(!showStatuses)}
					>
						<Text
							style={[styles.pillText, { color: statusColors[item.status] }]}
						>
							{item.status}
						</Text>
					</TouchableOpacity>
				</View>

				{showStatuses && (
					<View style={styles.statusRow}>
						{STATUSES.map((s) => (
							<TouchableOpacity
								key={s}
								style={[
									styles.statusOption,
									item.status === s && {
										borderColor: statusColors[s],
										backgroundColor: `${statusColors[s]}15`,
									},
								]}
								onPress={() => handleStatusChange(s)}
							>
								<Text
									style={[
										styles.statusText,
										item.status === s && { color: statusColors[s] },
									]}
								>
									{s}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				)}
			</View>
		</Swipeable>
	);
});

export default CampaignCard;

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		padding: 14,
		borderWidth: 1,
		borderColor: colors.border,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	avatar: {
		width: 38,
		height: 38,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	avatarText: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.3,
	},
	info: { flex: 1 },
	brandName: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.text,
		letterSpacing: 0.3,
	},
	detail: {
		fontSize: 12,
		color: colors.inactive,
		marginTop: 3,
		letterSpacing: 0.3,
	},
	pill: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "transparent",
	},
	pillText: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.3,
	},
	statusRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	statusOption: {
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
	},
	statusText: {
		fontSize: 11,
		fontWeight: "600",
		color: colors.inactive,
		letterSpacing: 0.3,
	},
	swipeActions: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 8,
		gap: 8,
	},
	actionBtn: {
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 10,
		justifyContent: "center",
	},
	editBtn: {
		backgroundColor: colorEdit.bgEdit,
		borderColor: colorEdit.bgEditBorder,
	},
	deleteBtn: {
		backgroundColor: colorDelete.bgDelete,
		borderColor: colorDelete.bgDeleteBorder,
	},
	actionText: {
		fontSize: 13,
		fontWeight: "700",
		color: colors.text,
		letterSpacing: 0.3,
	},
});
