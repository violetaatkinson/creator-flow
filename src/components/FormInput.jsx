import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export default function FormInput({ label, ...props }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.placeHolder}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.inactive,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
});