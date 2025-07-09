import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import fonts from "../../../assets/fonts";
import { Icons } from "../../../assets/icons";
import { Images } from "../../../assets/images";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import RouteName from "../../../navigation/RouteName";
import { PostApiRequest } from "../../../services/api";
import { COLORS } from "../../../utils/COLORS";
import { useToast } from "../../../utils/Toast/toastContext";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetLink = async () => {
    setEmailError("");

    let hasError = false;

    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      const response = await PostApiRequest("api/auth/forgot-password", { email });
      toast.showToast({
        type: "success",
        message: response.data.message,
        duration: 4000,
      });
      console.log("response=====", response.data);
      navigation.navigate(RouteName.OTP, { email, flow: "reset-password", otp: response.data.otp });
    } catch (error) {
      console.error("error=====", error);
      toast.showToast({
        type: "error",
        message: error.response?.data?.message || "An error occurred while sending the reset link. Please try again.",
        duration: 4000,
      });
    }
  };

  return (
    <View style={[styles.mainContainer, { paddingBottom: insets.bottom }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.backgroundColor}
      />

      <View style={styles.container}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="arrow-left"
              size={hp(3)}
              color={COLORS.primaryColor}
            />
          </TouchableOpacity>
          <Text style={styles.title}>{t("ForgotPassword.title")}</Text>
        </View>
        <Text style={styles.description}>
          {t("ForgotPassword.description")}
        </Text>

        <View style={styles.inputContainer}>
          <CustomInput
            placeholder={t("ForgotPassword.email_placeholder")}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={Icons.messageIcon}
            marginBottom={hp(3)}
            error={emailError}
          />
        </View>

        <CustomButton
          title={t("ForgotPassword.send_button")}
          onPress={handleSendResetLink}
          style={styles.sendButton}
        />
      </View>

      <Image
        source={Images.LoginPic}
        style={styles.backgroundImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingTop: hp(8),
    zIndex: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: hp(1),
    marginBottom: hp(2),
    marginLeft: -hp(1),
  },
  title: {
    flex: 1,
    color: COLORS.white,
    fontSize: hp(2.3),
    marginBottom: hp(2),
    textAlign: "center",
    fontFamily: fonts.medium,
  },
  description: {
    color: COLORS.gray2,
    fontSize: hp(1.8),
    marginBottom: hp(4),
    textAlign: "left",
    fontFamily: fonts.regular,
    lineHeight: hp(2.5),
  },
  inputContainer: {
    marginBottom: hp(2),
  },
  sendButton: {
    width: "100%",
    backgroundColor: COLORS.primaryColor,
  },
  backgroundImage: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: wp(50),
    height: hp(30),
    zIndex: 0,
    opacity: 0.8,
  },
});