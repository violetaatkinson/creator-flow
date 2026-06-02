import { View, Text, StyleSheet } from "react-native";
import GoogleBtn from "../components/GoogleBtn";
import EmailBtn from "../components/EmailBtn";

import { colors } from "../constants/colors";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Creator <Text style={styles.titleAccent}>Flow</Text>
      </Text>
      <Text style={styles.sub}>Your influencer business, organized.</Text>

      <GoogleBtn onPress={() => console.log("Google")} />
      <EmailBtn onPress={() => console.log("Email")} />
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
  titleAccent: { color: colors.active },
  sub: {
    fontSize: 15,
    color: colors.sub,
    marginTop: 12,
    marginBottom: 45,
    textAlign: "center",
  },
});