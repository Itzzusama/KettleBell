import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../../../components/CustomButton";
import { COLORS } from "../../../utils/COLORS";
import RouteName from "../../../navigation/RouteName";
import fonts from "../../../assets/fonts";

export default function UnverifiedUser() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Ionicons
        name="alert-circle-outline"
        size={wp(20)}
        color={COLORS.primaryColor}
      />
      <Text style={styles.title}>Account Not Verified</Text>
      <Text style={styles.message}>
        Your account is not yet verified. Once your coach verifies your account,
        you will be able to log in and continue.
      </Text>
      <CustomButton
        title="Go to Login"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: RouteName.LOGIN }],
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(6),
  },
  title: {
    fontSize: wp(6),
    fontFamily: fonts.bold,
    color: "white",
    marginTop: hp(2),
    marginBottom: hp(1),
    textAlign: "center",
  },
  message: {
    fontSize: wp(3.5),
    color: "#cccccc",
    textAlign: "center",
    marginBottom: hp(4),
    lineHeight: wp(5),
    fontFamily: fonts.regular,
  },
});
