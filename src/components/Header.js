import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CustomText from "./CustomText";
import { Ionicons } from "@expo/vector-icons";
import ImageFast from "./ImageFast";
import fonts from "../assets/fonts";
import { COLORS } from "../utils/COLORS";

const Header = ({
  title,
  hideBackArrow,
  onBackPress,
  textColor,
  backgroundColor,
  marginTop,
  fontFamily,
  marginBottom,
}) => {
  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.mainContainer,
        {
          backgroundColor: backgroundColor || "transparent",
          marginTop,
          marginBottom,
        },
      ]}
    >
      <View style={styles.row}>
        {!hideBackArrow && (
          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.backIcon}
            onPress={
              onBackPress
                ? onBackPress
                : () => {
                    if (navigation.canGoBack()) navigation.goBack();
                  }
            }
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
      <CustomText
        label={title}
        color={textColor || COLORS.white}
        fontFamily={fontFamily || fonts.medium}
        textTransform="capitalize"
        fontSize={hp(2.3)}
      />
      <View style={styles.row} />
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: hp(6),
  },
  backIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: 20,
  },
  icon: {
    width: 24,
    height: 24,
    marginLeft: 10,
  },
});
