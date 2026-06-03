import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export default function OptionSelector({ options, selected, onSelect }) {
  return (
    <View style={styles.row}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.option, selected === option && styles.optionActive]}
          onPress={() => onSelect(option)}
        >
          <Text style={[styles.text, selected === option && styles.textActive]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionActive: {
    backgroundColor: colors.backgroundBtn,
    borderColor: colors.btnBorder,
  },
  text: {
    fontSize: 13,
    color: colors.inactive,
    fontWeight: "600",
  },
  textActive: {
    color: colors.active,
  },
});