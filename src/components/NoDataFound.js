import { Dimensions, Image, StyleSheet, View } from "react-native";

import CustomText from "./CustomText";

import { Images } from "../assets/images";
import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

const NoDataFound = ({ title, marginTop, source, desc, height }) => {
  return (
    <View style={[styles.mainContainer, { height: height || 240 }]}>
      <Image
        style={[styles.image, { marginTop: marginTop || 0 }]}
        source={source || Images.noShow}
      />
      <CustomText
        label={title || "No data found"}
        fontFamily={fonts.semiBold}
        fontSize={18}
        textAlign="center"
        marginTop={15}
        color={COLORS.white}
      />
      <CustomText
        label={desc}
        fontFamily={fonts.medium}
        fontSize={16}
        textAlign="center"
        color={COLORS.white}
        lineHeight={25}
      />
    </View>
  );
};

export default NoDataFound;

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: Dimensions.get("window").width - 40,
    paddingHorizontal: 35,
    // backgroundColor:'red'
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
});
