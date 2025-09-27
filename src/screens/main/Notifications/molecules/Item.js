import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import fonts from "../../../../assets/fonts";
import CustomText from "../../../../components/CustomText";
import { COLORS } from "../../../../utils/COLORS";
import { Images } from "../../../../assets/images";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // use icons

const Item = ({ title, time, desc, onCardPress, type }) => {
  const renderIcon = () => {
    switch (type) {
      case "system":
        return (
          <Ionicons
            name="settings-outline"
            size={28}
            color={COLORS.primaryColor}
          />
        );
      case "workout":
        return (
          <MaterialCommunityIcons
            name="dumbbell"
            size={28}
            color={COLORS.primaryColor}
          />
        );
      case "meal":
        return (
          <Ionicons
            name="fast-food-outline"
            size={28}
            color={COLORS.primaryColor}
          />
        );
      case "message":
        return (
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={28}
            color={COLORS.primaryColor}
          />
        );
      default:
        return (
          <Ionicons
            name="notifications-outline"
            size={28}
            color={COLORS.primaryColor}
          />
        );
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onCardPress}
      style={styles.mainContainer}
    >
      <View style={styles.iconWrapper}>{renderIcon()}</View>

      <View style={styles.container}>
        <View style={styles.row}>
          <View style={{ width: "80%" }}>
            <CustomText
              label={title}
              fontFamily={fonts.medium}
              fontSize={16}
              color={COLORS.white}
            />
          </View>

          <CustomText
            label={time}
            fontFamily={fonts.medium}
            fontSize={10}
            color={"#5C5C60"}
          />
        </View>
        <CustomText
          label={desc}
          marginBottom={15}
          marginTop={5}
          color={"#5C5C60"}
          fontSize={16}
          lineHeight={22}
        />
      </View>
    </TouchableOpacity>
  );
};

export default Item;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: hp(3.2),
    paddingHorizontal: wp(4),
    backgroundColor: "#242427",
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: "#33373B",
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#33373B",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "75%",
    marginRight: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
