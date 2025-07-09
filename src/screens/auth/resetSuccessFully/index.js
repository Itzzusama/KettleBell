import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image, StatusBar, StyleSheet, Text, View } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import fonts from "../../../assets/fonts";
import { Icons } from "../../../assets/icons";
import { Images } from "../../../assets/images";
import RouteName from "../../../navigation/RouteName";
import { COLORS } from "../../../utils/COLORS";
export default function AccountCreated({ route }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { profileImage } = route.params || { profileImage: null };

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate(RouteName.LOGIN);
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
      <View style={styles.profileImageContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <Image 
            source={Images.lockCircle} 
            style={styles.profileImage} 
          />
        )}
      </View>

      {/* Success Text */}
      <Text style={styles.title}>{t("ResetSuccess.title")}</Text>
      <Text style={styles.subtitle}>{t("ResetSuccess.subtitle")}</Text>

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
    maxWidth: "85%",
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