import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/colors";

export default function EmailButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Ionicons name="mail-outline" size={22} color={colors.active} />
      <Text style={styles.text}>Continue with Email</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    height: 62,
    backgroundColor: colors.backgroundBtn,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.btnBorder,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.active,
  },
});