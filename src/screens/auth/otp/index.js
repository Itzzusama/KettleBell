import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import fonts from "../../../assets/fonts";
import CustomButton from "../../../components/CustomButton";
import RouteName from "../../../navigation/RouteName";
import { PostApiRequest } from "../../../services/api";
import { COLORS } from "../../../utils/COLORS";
import { useToast } from "../../../utils/Toast/toastContext";

export default function Otp() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const toast = useToast()
  const { email, flow, profilePicture, otp: otpFromParams } = route.params || {}; // Extract email and flow props
  const insets = useSafeAreaInsets()
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef([]);
  const [loading, setLoading] = useState(false);
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = ({ nativeEvent: { key: keyValue } }, index) => {
    if (keyValue === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 4 || otp.includes("")) {
      return;
    }

    try {
      setLoading(true);
      const verifyResponse = await PostApiRequest(
        "api/auth/verify-signup-otp",
        {
          email,
          otp: enteredOtp,
        }
      );

      if (verifyResponse.data.success) {
        toast.showToast({
          type: 'success',
          message: verifyResponse.data.message,
          duration: 4000,
        });
        AsyncStorage.setItem("token", verifyResponse.data.token);
        AsyncStorage.setItem("refreshToken", verifyResponse.data.refreshToken);
        navigation.navigate(RouteName.Account_Created, { profilePicture });
      } else {
        toast.showToast({
          type: 'error',
          message: verifyResponse.data.message,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const forgotPasswordapi = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 4 || otp.includes("")) {
      return;
    }
    try {
      const response = await PostApiRequest("api/auth/verify-reset-otp", {
        email,
        otp: enteredOtp,
      });
      const resetToken = response.data.resetToken;

      if (response.data.success) {
        navigation.navigate(RouteName.Reset_Password, { resetToken, email });
        toast.showToast({
          type: 'success',
          message: response.data.message,
          duration: 4000,
        });
      } else {
        toast.showToast({
          type: 'error',
          message: response.data.message,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("error=====", error);
      toast.showToast({
        type: 'error',
        message: "An error occurred during login. Please try again.",
        duration: 4000,
      });
    }
  };

  const handleSubmit = () => {
    if (flow === "reset-password") {
      forgotPasswordapi();
    } else {
      handleVerify();
    }
  };

  return (
    <View style={[styles.mainContainer, { paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <StatusBar
              barStyle="light-content"
              backgroundColor="transparent"
              translucent
            />
            <View style={styles.header}>
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
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>{t("Otp.title")}</Text>
              <Text style={styles.text}>
                {t("Otp.subtitle")}{" "}
                <Text style={styles.emailText}>{email || ""}</Text>
              </Text>
              {otpFromParams && (
                <Text style={styles.text}>
                  <Text style={styles.emailText}>{otpFromParams || ""}</Text>
                </Text>
              )}
              <View style={styles.otpContainer}>
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (inputs.current[index] = ref)}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={otp[index]}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      onFocus={() => {
                        if (otp[index]) {
                          handleOtpChange("", index);
                        }
                      }}
                    />
                  ))}
              </View>

              <CustomButton
                title={t("Otp.verify_button")}
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
              />

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  {t("Otp.did_not_receive_code")}
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.resendText, styles.resendLink]}>
                    {t("Otp.resend_link")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingHorizontal: wp(5),
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: hp(6),
    left: wp(5),
    zIndex: 1,
  },
  backButton: {
    padding: hp(1),
  },
  content: {
    alignItems: "center",
  },
  title: {
    color: COLORS.white,
    fontSize: hp(3.5),
    fontFamily: fonts.semiBold,
    marginBottom: hp(2),
    textAlign: "center",
  },
  text: {
    color: COLORS.gray2,
    fontSize: hp(1.8),
    fontFamily: fonts.regular,
    textAlign: "center",
    marginBottom: hp(5),
    lineHeight: hp(2.8),
    paddingHorizontal: wp(5),
  },
  emailText: {
    color: COLORS.primaryColor,
    fontFamily: fonts.medium,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: hp(5),
  },
  otpInput: {
    width: wp(15),
    height: hp(7),
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: wp(3),
    textAlign: "center",
    fontSize: hp(2.5),
    fontFamily: fonts.semiBold,
    color: COLORS.white,
    backgroundColor: "#1C1C1E",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(4),
  },
  resendText: {
    color: COLORS.gray2,
    fontSize: hp(1.8),
    fontFamily: fonts.regular,
  },
  resendLink: {
    color: COLORS.primaryColor,
    fontFamily: fonts.medium,
  },
});