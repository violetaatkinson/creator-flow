import { View, Text, StyleSheet } from "react-native";
import EmailBtn from "../components/EmailBtn";

import { colors } from "../constants/colors";

export default function LoginScreen({navigation}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Creator <Text style={styles.titleAccent}>Flow</Text>
      </Text>
      <Text style={styles.sub}>Your influencer business, organized.</Text>

      <EmailBtn onPress={() => navigation.navigate("EmailAuth")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    color: "#fff",
  },
  titleAccent: { color: colors.primary,letterSpacing: 0.5 },
  sub: {
    fontSize: 15,
    color: colors.sub,
    marginTop: 12,
    marginBottom: 35,
    textAlign: "center",
    letterSpacing: 0.3
  },
});