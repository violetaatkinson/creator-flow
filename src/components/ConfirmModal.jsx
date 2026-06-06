import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, errorModal } from "../constants/colors";

export default function ConfirmModal({ visible, title, message, onConfirm, onCancel }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          <View style={styles.iconWrap}>
            <Ionicons name="trash-outline" size={32} color={colors.paused} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
              <Text style={styles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnConfirm} onPress={onConfirm}>
              <Text style={styles.btnConfirmText}>Delete</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: errorModal.bg,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: errorModal.iconWrap,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 14,
    color: colors.inactive,
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.3,
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  btnCancel: {
    flex: 1,
    height: 52,
    backgroundColor: colors.backgroundBtn,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.btnBorder,
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.active,
    letterSpacing: 0.3,
  },
  btnConfirm: {
    flex: 1,
    height: 52,
    backgroundColor: errorModal.btnBg,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: errorModal.btnBorder,
  },
  btnConfirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.paused,
    letterSpacing: 0.3,
  },
});