import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { getDB } from "../database/db";
import { auth } from "../firebase/firebaseConfig";
import { colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import Swipeable from "react-native-gesture-handler/Swipeable";

const typeIcon = {
	status_completed: { name: "checkmark-circle-outline", color: colors.active },
	status_active: { name: "play-circle-outline", color: colors.active },
	status_paused: { name: "pause-circle-outline", color: colors.pending },
	status_pending: { name: "time-outline", color: colors.pending },
	deadline: { name: "calendar-outline", color: colors.active },
	overdue: { name: "alert-circle-outline", color: colors.paused },
	campaign_created: { name: "add-circle-outline", color: colors.active },
	expense_added: { name: "arrow-down-circle-outline", color: colors.paused },
	monthly_summary: { name: "wallet-outline", color: colors.active },
};

const defaultIcon = { name: "notifications-outline", color: colors.inactive };

const timeAgo = (dateStr) => {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	const now = new Date();
	const diff = Math.round((now - date) / (1000 * 60));
	if (diff < 1) return "Just now";
	if (diff < 60) return `${diff}m ago`;
	const hours = Math.round(diff / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.round(hours / 24)}d ago`;
};

export default function NotificationScreen() {
	const insets = useSafeAreaInsets();
	const [notifications, setNotifications] = useState([]);

	useFocusEffect(
		useCallback(() => {
			const loadNotifications = async () => {
				try {
					const db = await getDB();
					const uid = auth.currentUser.uid;
					const data = await db.getAllAsync(
						`SELECT * FROM notifications WHERE userId=? AND read=0 ORDER BY createdAt DESC`,
						[uid],
					);
					setNotifications(data);
				} catch (e) {
					console.log("NotificationScreen error:", e);
				}
			};
			loadNotifications();
		}, []),
	);

	const markAsRead = async (id) => {
		try {
			const db = await getDB();
			await db.runAsync("DELETE FROM notifications WHERE id=?", [id]);
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		} catch (e) {
			console.log(e);
		}
	};

	const clearAll = async () => {
		try {
			const db = await getDB();
			const uid = auth.currentUser.uid;
			await db.runAsync("DELETE FROM notifications WHERE userId=? AND read=0", [
				uid,
			]);
			setNotifications([]);
		} catch (e) {
			console.log(e);
		}
	};

	const renderRightActions = (id) => (
		<TouchableOpacity style={styles.swipeDelete} onPress={() => markAsRead(id)}>
			<Ionicons name="trash-outline" size={18} color="#fff" />
		</TouchableOpacity>
	);

	return (
		<ScrollView style={styles.container}>
			<View style={[styles.header, { paddingTop: insets.top + 12 }]}>
				{notifications.length > 0 && (
					<TouchableOpacity onPress={clearAll}>
						<Text style={styles.clearAll}>Clear all</Text>
					</TouchableOpacity>
				)}
			</View>

			{notifications.length === 0 ? (
				<View style={styles.emptyWrap}>
					<View style={styles.emptyIconWrap}>
						<Ionicons
							name="notifications-outline"
							size={36}
							color={colors.primary}
						/>
					</View>
					<Text style={styles.emptyText}>All clear!</Text>
					<Text style={styles.emptySub}>No pending updates or alerts.</Text>
				</View>
			) : (
				<View style={styles.list}>
					{notifications.map((n) => {
						const icon = typeIcon[n.type] || defaultIcon;
						return (
							<Swipeable
								key={n.id}
								renderRightActions={() => renderRightActions(n.id)}
							>
								<TouchableOpacity
									style={styles.card}
									onPress={() => markAsRead(n.id)}
									activeOpacity={0.8}
								>
									<View
										style={[
											styles.iconWrap,
											{ backgroundColor: `${icon.color}15` },
										]}
									>
										<Ionicons name={icon.name} size={20} color={icon.color} />
									</View>
									<View style={styles.content}>
										<Text style={styles.message}>{n.message}</Text>
										<View
											style={{
												flexDirection: "row",
												alignItems: "center",
												gap: 4,
												marginTop: 6,
											}}
										>
											{n.detail && (
												<Text
													style={[styles.detail, { color: colors.inactive }]}
												>
													{n.detail}
												</Text>
											)}
											{n.amount != null && (
												<Text
													style={[
														styles.detail,
														{
															color:
																n.type === "expense_added"
																	? colors.paused
																	: colors.active,
														},
													]}
												>
													{n.type === "expense_added"
														? ` -$${Math.abs(n.amount)}`
														: ` +$${n.amount}`}
												</Text>
											)}
										</View>
										<Text style={[styles.time, { marginTop: 4 }]}>
											{timeAgo(n.createdAt)}
										</Text>
									</View>
									<View style={styles.unreadDot} />
								</TouchableOpacity>
							</Swipeable>
						);
					})}
				</View>
			)}
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
		paddingBottom: 16,
	},
	clearAll: {
		fontSize: 13,
		color: colors.active,
		fontWeight: "600",
		letterSpacing: 0.3,
	},
	list: { paddingHorizontal: 18, gap: 8, paddingBottom: 40 },
	card: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 14,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	iconWrap: {
		width: 40,
		height: 40,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	content: { flex: 1 },
	message: {
		fontSize: 13,
		color: colors.text,
		letterSpacing: 0.3,
		lineHeight: 18,
	},
	time: {
		fontSize: 11,
		color: colors.inactive,
		marginTop: 4,
		letterSpacing: 0.3,
	},
	unreadDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.active,
		flexShrink: 0,
	},
	swipeDelete: {
		backgroundColor: colors.paused,
		borderRadius: 14,
		marginLeft: 8,
		paddingHorizontal: 18,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyWrap: { alignItems: "center", marginTop: 100, gap: 10 },
	emptyIconWrap: {
		width: 72,
		height: 72,
		borderRadius: 20,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	emptyText: {
		fontSize: 16,
		fontWeight: "700",
		color: colors.text,
		letterSpacing: 0.3,
	},
	emptySub: { fontSize: 13, color: colors.inactive, letterSpacing: 0.3 },
	detail: {
		fontSize: 12,
		color: colors.inactive,
		marginTop: 2,
		letterSpacing: 0.3,
	},
});
