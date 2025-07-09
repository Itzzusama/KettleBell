import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import fonts from "../../../assets/fonts";
import { Icons } from "../../../assets/icons";
import { Images } from "../../../assets/images";
import RouteName from "../../../navigation/RouteName";
import { COLORS } from "../../../utils/COLORS";
export default function AccountCreated() {
  const { t } = useTranslation();
  const navigation = useNavigation();
const route=useRoute()
const {profilePicture}=route.params ||{}
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate(RouteName.Fitness_Coach);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.backgroundColor}
      />

      {/* Profile Image */}
      <TouchableOpacity style={styles.profileImageContainer} >
          <Image 
            source={profilePicture ? {uri:profilePicture} : Images.fruits} 
            style={styles.profileImage} 
          />
      </TouchableOpacity>

      {/* Success Text */}
      <Text style={styles.title}>{t("AccountCreated.title")}</Text>
      <Text style={styles.subtitle}>
        {t("AccountCreated.subtitle")}
      </Text>

      {/* Decorative Elements */}
      <Image
        source={Icons.circles}
        style={styles.backgroundImage}
        resizeMode="contain"
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
  },
  profileImageContainer: {
    marginBottom: hp(3),
  },
  profileImage: {
    width: hp(12),
    height: hp(12),
    borderRadius: hp(6),
    borderWidth: 2,
    borderColor: COLORS.primaryColor,
  },
  title: {
    color: COLORS.white,
    fontSize: hp(4),
    fontWeight: "700",
    marginBottom: hp(1.5),
    textAlign: "center",
    fontFamily: fonts.bold,
  },
  subtitle: {
    color: COLORS.gray2,
    fontSize: hp(2),
    textAlign: "center",
    fontFamily: fonts.regular,
    maxWidth: "80%",
  },
  backgroundImage: {
    position: "absolute",
    bottom: -20,
    right: 0,
    width: wp(80),
    height: hp(40),
    zIndex: 0,
    opacity: 0.8,
  },
});