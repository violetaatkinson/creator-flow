import { View, Text, FlatList, StyleSheet, TouchableOpacity} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { colors } from "../constants/colors";
import CampaignCard from "../components/CampaignCard";

export default function CampaignsScreen({ navigation }) {
	const [campaigns, setCampaigns] = useState([]);

	useEffect(() => {
		const q = query(
			collection(db, "campaigns"),
			where("userId", "==", auth.currentUser.uid),
		);
		const unsuscribe = onSnapshot(q, (snapshot) => {
			const data = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setCampaigns(data);
		});
		return unsuscribe;
	}, []);

	const handleEdit = useCallback((item) => {
		navigation.navigate("EditCampaign", { campaign: item });
	}, []);

	const renderItem = useCallback(({ item, index }) => {
		return <CampaignCard item={item} index={index} onEdit={handleEdit} />;
	}, []);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Campaigns</Text>
				<TouchableOpacity
					style={styles.addBtn}
					onPress={() => navigation.navigate("CreateCampaign")}
				>
					<Text style={styles.addBtnText}>+ New</Text>
				</TouchableOpacity>
			</View>
			<FlatList
				data={campaigns}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				contentContainerStyle={styles.list}
				ListEmptyComponent={
					<Text style={styles.empty}>
						No campaigns yet. Create your first one!
					</Text>
				}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.backgroundScreen,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		marginTop: 50,
	},
	title: {
		fontSize: 28,
		fontWeight: "800",
		color: colors.text,
	},
	addBtn: {
		backgroundColor: colors.backgroundBtn,
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderWidth: 1,
		borderColor: colors.btnBorder,
	},
	addBtnText: {
		color: colors.active,
		fontWeight: "700",
		fontSize: 14,
	},
	list: {
		padding: 18,
		gap: 10,
	},
	empty: {
		textAlign: "center",
		color: colors.inactive,
		marginTop: 60,
		fontSize: 14,
	},
});
