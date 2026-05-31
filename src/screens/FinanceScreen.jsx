import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function FinanceScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Finances</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b12" },
  title: { color: "#f0eeff", fontSize: 24, fontWeight: "800", padding: 20, marginTop: 35 },
});