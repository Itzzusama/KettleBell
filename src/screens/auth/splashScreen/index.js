import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { Images } from "../../../assets/images";
import RouteName from "../../../navigation/RouteName";
import { COLORS } from "../../../utils/COLORS";

export default function SplashScreen() {
  const navigation = useNavigation();
  const isToken = useSelector((state) => state.authConfigs.token);

  useEffect(() => {
    const timer = setTimeout(() => {
      // console.log("navigation.replace(RouteName.ONBOARDING_SCREEN)", JSON.stringify(isToken))
      navigation.replace(isToken ? RouteName.MainStack : RouteName.AuthStack);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.conatiner}>
      <Image source={Images.SplashImage} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  conatiner: {
    backgroundColor: COLORS.backgroundColor,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    resizeMode: "contain",
  },
});
