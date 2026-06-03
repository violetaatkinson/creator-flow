import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export default function SignBtn({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    height: 62,
    backgroundColor: colors.backgroundBtn,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.btnBorder,
    marginTop: 6,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  }
});