import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
// import { useTranslation } from "react-i18next"; // Comment this out
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
import RouteName from "../../../navigation/RouteName";
import { PostApiRequest } from "../../../services/api";
import { setToken } from "../../../store/slices/AuthConfig";
import { setUserData, setUserRole } from "../../../store/slices/usersSlice";
import { COLORS } from "../../../utils/COLORS";
import { useToast } from "../../../utils/Toast/toastContext";

export default function Login() {
  // const { t } = useTranslation(); // Comment this out

  // Create a simple translation object for now
  const t = (key) => {
    const translations = {
      "login.welcome": "Welcome Back",
      "login.signInToContinue": "Sign in to continue",
      "login.email": "Email",
      "login.password": "Password",
      "login.forgotPassword": "Forgot Password?",
      "login.login": "Login",
      "login.dontHaveAccount": "Don't have an account?",
      "login.signUp": "Sign Up",
    };
    return translations[key] || key;
  };

  const toast = useToast();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("coach@fitnessapp.com");
  const [password, setPassword] = useState("Coach123!");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const insets = useSafeAreaInsets();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    let hasError = false;
    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const data = {
      identifier: email,
      password,
    };
    try {
      setLoading(true);
      const loginResponse = await PostApiRequest("auth/login", data);
      toast.showToast({
        type: "success",
        message: loginResponse.data.message,
        duration: 4000,
      });
      if (loginResponse.data?.token) {
        await AsyncStorage.setItem("token", loginResponse.data?.token);
        await AsyncStorage.setItem(
          "refreshToken",
          loginResponse.data?.refreshToken
        );
        dispatch(setToken(loginResponse.data?.token));
        dispatch(setUserData(loginResponse.data?.user));
        // Set role from API response if available
        if (loginResponse.data?.user?.role) {
          await AsyncStorage.setItem("role", loginResponse.data?.user?.role);
          dispatch(setUserRole(loginResponse.data?.user?.role));
        }
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.showToast({
        type: "error",
        message: "An error occurred during login. Please try again.",
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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

            <Text style={styles.title}>{t("login.welcome")}</Text>
            <Text style={styles.text}>{t("login.signInToContinue")}</Text>

            <View style={styles.inputContainer}>
              <CustomInput
                placeholder={t("login.email")}
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
                placeholder={t("login.password")}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError("");
                }}
                secureTextEntry={true}
                leftIcon={Icons.lockIcon}
                marginBottom={hp(2)}
                error={passwordError}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate(RouteName.Forgot_password)}
            >
              <Text style={styles.forgotText}>{t("login.forgotPassword")}</Text>
            </TouchableOpacity>

            <CustomButton
              title={t("login.login")}
              onPress={handleLogin}
              style={styles.loginButton}
              loading={loading}
            />

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>
                {t("login.dontHaveAccount")}{" "}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(RouteName.Register_Screen)}
              >
                <Text style={[styles.signUpText, styles.signUpLink]}>
                  {t("login.signUp")}
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
    textAlign: "left",
    fontFamily: fonts.bold,
  },
  text: {
    color: COLORS.gray2,
    fontSize: hp(1.7),
    marginBottom: hp(4),
    textAlign: "left",
    fontFamily: fonts.medium,
  },
  inputContainer: {
    marginBottom: hp(2),
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: hp(3),
  },
  forgotText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  loginButton: {
    width: "100%",
    marginBottom: hp(3),
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(2),
    zIndex: 1,
  },
  signUpText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  signUpLink: {
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
