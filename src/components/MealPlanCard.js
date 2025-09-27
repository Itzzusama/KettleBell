import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import fonts from "../assets/fonts";
import { COLORS } from "../utils/COLORS";

const MealPlanCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri:
            item?.mealPlan?.banner ||
            item?.mealPlan?.images?.[0] ||
            "/placeholder.svg?height=200&width=300",
        }}
        style={styles.mealImage}
      />
      <View style={styles.mealOverlay}>
        <View style={styles.tagContainer}>
          <Text style={styles.mealTitle} numberOfLines={1}>
            {item?.mealPlan?.name}
          </Text>
        </View>
        <View style={styles.mealContent}>
          <View style={styles.mealInfo}>
            <Text style={styles.clientText} numberOfLines={1}>
              {item?.mealPlan?.description || `${item.servings} servings`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MealPlanCard;

const styles = StyleSheet.create({
  mealCard: {
    width: wp(60),
    height: hp(25),
    borderRadius: wp(4),
    marginRight: wp(3),
    overflow: "hidden",
    backgroundColor: "rgba(45, 45, 47, 1)",
  },
  mealImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  mealOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    height: hp(10),
    padding: wp(3),
    justifyContent: "space-between",
  },
  tagContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealTitle: {
    color: "#FFF",
    fontSize: wp(3.4),
    fontFamily: fonts.medium,
    marginBottom: hp(0.5),
  },
  mealContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  mealInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientText: {
    color: "#CCC",
    fontSize: wp(3),
    fontFamily: fonts.regular,
    flex: 1,
    marginRight: wp(2),
  },
});
