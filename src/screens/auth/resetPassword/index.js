import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
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

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const toast = useToast();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { resetToken, email } = route.params || {};
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const handleSendResetLink = async () => {
    setPasswordError("");
    setConfirmPasswordError("");

    let hasError = false;

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (!validatePassword(password)) {
      setPasswordError(
        "Password must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Confirm password is required");
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      const response = await PostApiRequest("api/auth/reset-password", {
        email,
        resetToken,
        newPassword: password,
      });
      toast.showToast({
        type: "success",
        message: response.data.message,
        duration: 4000,
      });
      if (response.data.success) {
        navigation.navigate(RouteName.Reset_SuccessFully);
      } else {
        toast.showToast({
          type: "error",
          message: response.data.message,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("error=====", error);
      toast.showToast({
        type: "error",
        message: error.response?.data?.message || "An error occurred during password reset. Please try again.",
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
          <Text style={styles.title}>{t("ResetPassword.title")}</Text>
        </View>
        <Text style={styles.description}>
          {t("ResetPassword.description")}
        </Text>

        <View style={styles.inputContainer}>
          <CustomInput
            placeholder={t("ResetPassword.password_placeholder")}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError("");
            }}
            keyboardType="default"
            autoCapitalize="none"
            secureTextEntry={!showPassword}
            leftIcon={Icons.lockIcon}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={hp(2.2)}
                  color={COLORS.gray2}
                />
              </TouchableOpacity>
            }
            marginBottom={hp(3)}
            error={passwordError}
          />
          <CustomInput
            placeholder={t("ResetPassword.confirm_password_placeholder")}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmPasswordError("");
            }}
            keyboardType="default"
            autoCapitalize="none"
            secureTextEntry={!showConfirmPassword}
            leftIcon={Icons.lockIcon}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Feather
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={hp(2.2)}
                  color={COLORS.gray2}
                />
              </TouchableOpacity>
            }
            marginBottom={hp(3)}
            error={confirmPasswordError}
          />
        </View>

        <CustomButton
          title={t("ResetPassword.change_password_button")}
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