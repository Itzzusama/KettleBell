import { StyleSheet, View } from "react-native";
import React from "react";

import CustomButton from "./CustomButton";
import CustomModal from "./CustomModal";
import CustomText from "./CustomText";

import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

const LogoutModal = ({ isVisible, onDisable, onPress, loading }) => {
  return (
    <CustomModal
      backdropOpacity={0.8}
      isChange
      isVisible={isVisible}
      onDisable={onDisable}
    >
      <View style={[styles.mainContainer]}>
        <CustomText
          label="Logout"
          fontFamily={fonts.bold}
          fontSize={18}
          color={COLORS.red}
          marginBottom={25}
        />
        <View style={styles.border}>
          <CustomText
            textAlign="center"
            lineHeight={22}
            alignSelf={"center"}
            label={`You are about to logout, Do you want to continue?`}
            color="#818898"
            marginBottom={30}
          />
        </View>
        <View style={styles.row}>
          <CustomButton
            title="Cancel"
            backgroundColor="transparent"
            color={COLORS.red}
            borderColor={COLORS.red}
            borderWidth={1}
            width="48%"
            onPress={onDisable}
          />
          <CustomButton
            title="Logout"
            width="48%"
            backgroundColor={COLORS.red}
            onPress={onPress}
            loading={loading}
          />
        </View>
      </View>
    </CustomModal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
  mainContainer: {
    padding: 25,
    backgroundColor: COLORS.white,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    alignItems: "center",
    paddingTop: 35,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 5,
  },
  border: {
    borderTopWidth: 0.3,
    borderTopColor: COLORS.gray,
    paddingTop: 25,
    width: "100%",
    alignItems: "center",
  },
});
