"use client";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import fonts from "../../../../assets/fonts";
import CustomInput from "../../../../components/CustomInput";
import CustomButton from "../../../../components/CustomButton";
import CustomText from "../../../../components/CustomText";
import ScreenWrapper from "../../../../components/ScreenWrapper";
import { PostApiRequest } from "../../../../services/api";
import { COLORS } from "../../../../utils/COLORS";
import { useToast } from "../../../../utils/Toast/toastContext";

export default function AddClient() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const toast = useToast();

  const topInset = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error states
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const validateName = (name) => name.trim().length >= 3;
  const validatePhone = (phone) => /^\d{10,15}$/.test(phone.replace(/\D/g, ""));
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const handleCreateClient = async () => {
    setNameError("");
    setEmailError("");
    setPhoneError("");
    setPasswordError("");
    let hasError = false;

    if (!name) {
      setNameError("Name is required");
      hasError = true;
    } else if (!validateName(name)) {
      setNameError("Name must be at least 3 characters");
      hasError = true;
    }
    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      hasError = true;
    }
    if (!phone) {
      setPhoneError("Phone is required");
      hasError = true;
    } else if (!validatePhone(phone)) {
      setPhoneError("Phone must be 10-15 digits");
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
    if (hasError) return;

    try {
      setLoading(true);
      const res = await PostApiRequest("api/clients", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });
      if (res.data && res.data.success) {
        toast.showToast({
          type: "success",
          message: res.data.message || "Client created successfully!",
          duration: 3000,
        });
        navigation.goBack();
      } else {
        toast.showToast({
          type: "error",
          message: res.data?.message || "Failed to create client.",
          duration: 4000,
        });
      }
    } catch (error) {
      toast.showToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const Header = () => (
    <View style={[styles.header, { marginTop: topInset }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={wp(6)} color={COLORS.white} />
      </TouchableOpacity>
      <CustomText
        label={t("Client.title") || "Add Client"}
        color={COLORS.white}
        fontSize={hp(2.3)}
        fontFamily={fonts.medium}
        textAlign="center"
        style={styles.headerTitle}
      />
      <View style={styles.headerSpacer} />
    </View>
  );

  return (
    <ScreenWrapper
      backgroundColor={COLORS.backgroundColor}
      statusBarColor={COLORS.backgroundColor}
      barStyle="light-content"
      headerUnScrollable={Header}
      scrollEnabled
      paddingHorizontal={wp(4)}
    >
      <View style={styles.container}>
        <View style={styles.formSection}>
          <CustomText
            label="Client Information"
            color={COLORS.white}
            fontSize={hp(2.2)}
            fontFamily={fonts.semiBold}
            marginBottom={hp(3)}
            textAlign="center"
          />

          <View style={styles.inputGroup}>
            <CustomInput
              placeholder="Full Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setNameError("");
              }}
              keyboardType="default"
              autoCapitalize="words"
              marginBottom={hp(2)}
              error={nameError}
              leftIcon={undefined}
            />

            <CustomInput
              placeholder="Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              marginBottom={hp(2)}
              error={emailError}
              leftIcon={undefined}
            />

            <CustomInput
              placeholder="Phone Number"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setPhoneError("");
              }}
              keyboardType="phone-pad"
              autoCapitalize="none"
              marginBottom={hp(2)}
              error={phoneError}
              leftIcon={undefined}
            />

            <CustomInput
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError("");
              }}
              secureTextEntry={!showPassword}
              leftIcon={undefined}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color={COLORS.gray2}
                  />
                </TouchableOpacity>
              }
              marginBottom={hp(2)}
              error={passwordError}
            />
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Create Client"
              onPress={handleCreateClient}
              loading={loading}
              disabled={loading}
              marginTop={hp(2)}
              height={hp(6)}
              borderRadius={wp(2.5)}
              fontSize={hp(1.8)}
              fontFamily={fonts.medium}
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: COLORS.backgroundColor,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  backButton: {
    padding: wp(2),
    borderRadius: wp(2),
    backgroundColor: COLORS.darkGray,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: wp(2),
  },
  headerSpacer: {
    width: wp(12),
  },
  container: {
    flex: 1,
    paddingTop: hp(2),
  },
  formSection: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: wp(2),
  },
  inputGroup: {
    marginBottom: hp(4),
  },
  buttonContainer: {
    marginTop: hp(2),
  },
});
