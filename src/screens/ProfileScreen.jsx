import { View, Text, ScrollView, StyleSheet } from "react-native";

import { colors } from "../constants/colors";

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundScreen },
  title: { color: colors.text, fontSize: 24, fontWeight: "800", padding: 20,marginTop: 35 },
});