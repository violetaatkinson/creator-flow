import { TextInput, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export default function CustomInput({
	placeholder,
	value,
	onChangeText,
	secureTextEntry = false,
	keyboardType = "default",
	autoCapitalize = "sentences",
}) {
	return (
		<TextInput
			style={styles.input}
			placeholder={placeholder}
			placeholderTextColor={colors.placeHolder}
			value={value}
			onChangeText={onChangeText}
			secureTextEntry={secureTextEntry}
			keyboardType={keyboardType}
			autoCapitalize={autoCapitalize}
		/>
	);
}

const styles = StyleSheet.create({
	input: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		padding: 16,
		color: colors.text,
		fontSize: 15,
		borderWidth: 1,
		borderColor: colors.border,
		marginBottom: 16,
	},
});
