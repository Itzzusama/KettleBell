import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import fonts from "../../../../assets/fonts";
import CustomText from "../../../../components/CustomText";
import ImageFast from "../../../../components/ImageFast";
import { COLORS } from "../../../../utils/COLORS";
import { Images } from "../../../../assets/images";

const Item = ({ title, time, desc, img, onCardPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onCardPress}
      style={styles.mainContainer}
    >
      <ImageFast source={Images.SplashImage} style={styles.img} />
      <View style={styles.container}>
        <View style={styles.row}>
          <CustomText
            label={title}
            fontFamily={fonts.semiBold}
            fontSize={16}
            // width={"85%"}
          />
          <CustomText label={time} fontFamily={fonts.medium} fontSize={10} />
        </View>
        <CustomText
          label={desc}
          numberOfLines={3}
          marginBottom={15}
          marginTop={2}
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
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  img: {
    width: 48,
    height: 48,
    // borderRadius: 100,
    // tintColor: COLORS.primaryColor,
  },
  container: {
    width: "84%",
    // backgroundColor:'red'
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
