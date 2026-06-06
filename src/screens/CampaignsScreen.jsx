import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { colors } from "../constants/colors";
import CampaignCard from "../components/CampaignCard";
import CampaignCalendar from "../components/CampaignCalendar";
import CampaignHistory from "../components/CampaignHistory";

export default function CampaignsScreen({ navigation }) {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "campaigns"),
      where("userId", "==", auth.currentUser.uid)
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

  const active = campaigns.filter((c) => c.status !== "Completed");
  const completed = campaigns.filter((c) => c.status === "Completed");

  const getSubtitle = () => {
    const parts = [];
    const activeCount = campaigns.filter(c => c.status === "Active").length;
    const pendingCount = campaigns.filter(c => c.status === "Pending").length;
    const pausedCount = campaigns.filter(c => c.status === "Paused").length;
    const completedCount = completed.length;

    if (activeCount) parts.push(`${activeCount} active`);
    if (pendingCount) parts.push(`${pendingCount} pending`);
    if (pausedCount) parts.push(`${pausedCount} paused`);
    if (completedCount) parts.push(`${completedCount} completed`);

    return parts.join(" · ");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Campaigns</Text>
          {campaigns.length > 0 && (
            <Text style={styles.subtitle}>{getSubtitle()}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("CreateCampaign")}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {active.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active</Text>
            {active.map((item, index) => (
              <View key={item.id} style={styles.cardWrap}>
                <CampaignCard item={item} index={index} onEdit={handleEdit} />
              </View>
            ))}
          </View>
        )}

        {active.length === 0 && completed.length === 0 && (
          <Text style={styles.empty}>No campaigns yet. Create your first one!</Text>
        )}

        <CampaignCalendar campaigns={active} />

        {completed.length > 0 && (
          <CampaignHistory campaigns={completed} />
        )}

      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 0.3,
  },

  subtitle: {
    fontSize: 13,
    color: colors.inactive,
    marginTop: 8,
    letterSpacing: 0.3,
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
    letterSpacing: 0.3,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 40,
  },

  section: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.inactive,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  cardWrap: {
    marginBottom: 8,
  },

  empty: {
    textAlign: "center",
    color: colors.inactive,
    marginTop: 60,
    fontSize: 14,
    letterSpacing: 0.3,
  },
});