import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { useDispatch } from "react-redux";
import fonts from "../../../assets/fonts";
import { Icons } from "../../../assets/icons";
import { Images } from "../../../assets/images";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import ExpoImagePicker from "../../../components/imagePicker";
import RouteName from "../../../navigation/RouteName";
import { PostApiRequest } from "../../../services/api";
import {
  nextSection,
  updateUserData,
} from "../../../store/slices/progressSlice";
import { COLORS } from "../../../utils/COLORS";
import { useToast } from "../../../utils/Toast/toastContext";

export default function SignUp() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const validateName = (name) => {
    return name.length >= 3;
  };

  const handleSignUp = async () => {
    setEmailError("");
    setNameError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let hasError = false;

    if (!profilePicture) {
      return toast.showToast({
        type: "error",
        message: "Profile picture is required",
        duration: 4000,
      });
    }

    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      hasError = true;
    }

    if (!name) {
      setNameError("Name is required");
      hasError = true;
    } else if (!validateName(name)) {
      setNameError("Name must be at least 3 characters");
      hasError = true;
    }

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

    const data = {
      email: email.toLowerCase().trim(),
      name,
      password,
      profilePicture,
    };

    try {
      setLoading(true);
      const emailCheckResponse = await PostApiRequest("api/auth/check-email", {
        email: email.toLowerCase().trim(),
      });

      if (!emailCheckResponse.data.success) {
        toast.showToast({
          type: "error",
          message: emailCheckResponse.data.message,
          duration: 4000,
        });
        return;
      }

      const otpResponse = await PostApiRequest(
        "api/auth/send-signup-otp",
        data
      );
      toast.showToast({
        type: "success",
        message: otpResponse.data.message,
        duration: 4000,
      });
      AsyncStorage.setItem("token", otpResponse.data.token);
      AsyncStorage.setItem("refreshToken", otpResponse.data.refreshToken);
      if (otpResponse.data.success) {
        toast.showToast({
          type: "success",
          message: otpResponse.data.message,
          duration: 4000,
        });
        dispatch(updateUserData({ email, password, profilePicture, name }));
        dispatch(nextSection());
        navigation.navigate(RouteName.OTP, {
          email,
          profilePicture,
          otp: otpResponse.data.otp,
        });
      } else {
        toast.showToast({
          type: "error",
          message: otpResponse.data.message,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("SignUp error:", error.response.data.message);
      toast.showToast({
        type: "error",
        message: "An error occurred during signup. Please try again.",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.mainContainer, { paddingBottom: insets.bottom }]}>
      <Image
        source={Images.LoginPic}
        style={styles.backgroundImage}
        resizeMode="contain"
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: hp(4) }}
        >
          <View style={styles.container}>
            <StatusBar
              barStyle="light-content"
              backgroundColor={"transparent"}
              translucent
            />
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
            <Text style={styles.title}>{t("SignUp.title")}</Text>
            <Text style={styles.text}>{t("SignUp.subtitle")}</Text>
            <View style={styles.profileImageContainer}>
              <ExpoImagePicker
                dayName="Profile"
                onSave={(data) => setProfilePicture(data)}
              />
            </View>
            <View style={styles.inputContainer}>
              <CustomInput
                placeholder={t("SignUp.email_placeholder")}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={Icons.messageIcon}
                marginBottom={hp(2)}
                error={emailError}
              />
              <CustomInput
                placeholder={"Name"}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setNameError("");
                }}
                keyboardType="default"
                autoCapitalize="none"
                leftIcon={Icons.profileTab}
                marginBottom={hp(2)}
                error={nameError}
              />
              <CustomInput
                placeholder={t("SignUp.password_placeholder")}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError("");
                }}
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
                marginBottom={hp(2)}
                error={passwordError}
              />
              <CustomInput
                placeholder={t("SignUp.confirm_password_placeholder")}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError("");
                }}
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
                marginBottom={hp(2)}
                error={confirmPasswordError}
              />
            </View>
            <CustomButton
              title={t("SignUp.signup_button")}
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
            />
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                {t("SignUp.already_have_account")}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(RouteName.LOGIN)}
              >
                <Text style={[styles.loginText, styles.loginLink]}>
                  {t("SignUp.signin_link")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
    flex: 1,
    paddingHorizontal: wp(4),
    paddingTop: hp(8),
    zIndex: 1,
    justifyContent: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    padding: hp(1),
    marginBottom: hp(2),
    marginLeft: -hp(1),
  },
  title: {
    color: COLORS.white,
    fontSize: hp(4),
    marginBottom: hp(1),
    textAlign: "left",
    fontFamily: fonts.bold,
  },
  text: {
    color: COLORS.gray2,
    fontSize: hp(1.7),
    marginBottom: hp(3),
    textAlign: "left",
    fontFamily: fonts.regular,
  },
  profileImageContainer: {
    marginBottom: hp(3),
  },
  inputContainer: {
    marginBottom: hp(2),
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(3),
  },
  loginText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  loginLink: {
    color: COLORS.primaryColor,
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
