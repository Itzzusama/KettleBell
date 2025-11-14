import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

const { width } = Dimensions.get("window");

export default function ConfirmationModal({
  visible,
  title,
  subtitle,
  icon = "alert-circle-outline",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal visible={visible} transparent onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIconContainer}>
              <MaterialCommunityIcons
                name={icon}
                size={32}
                color={COLORS.primaryColor}
              />
            </View>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalSubtitle}>{subtitle}</Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loader} />
              ) : (
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.2)",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.medium,
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  confirmButton: {
    backgroundColor: COLORS.primaryColor,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  loader: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
    borderTopColor: "transparent",
  },
});
