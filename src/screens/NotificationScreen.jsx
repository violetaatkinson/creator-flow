import { View, Text, ScrollView, StyleSheet } from "react-native";

import { colors } from "../constants/colors";

export default function NotificationScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    padding: 20,
		marginTop: 35,
  },
});
