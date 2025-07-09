"use client";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import fonts from "../../../../assets/fonts";
import CustomInput from "../../../../components/CustomInput";
import CustomButton from "../../../../components/CustomButton";
import { PostApiRequest } from "../../../../services/api";
import { COLORS } from "../../../../utils/COLORS";
import { useToast } from "../../../../utils/Toast/toastContext";

export default function AddClient() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const toast = useToast();

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

  return (
    <SafeAreaView style={styles.container}>
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
          <Ionicons name="arrow-back" size={wp(6.5)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("Client.title") || "Add Client"}
        </Text>
        <View style={{ width: 32 }} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
        >
          <CustomInput
            placeholder="Name"
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
            placeholder="Email"
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
            placeholder="Phone"
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
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color={COLORS.gray2}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            marginBottom={hp(2)}
            error={passwordError}
          />
          <CustomButton
            title="Create Client"
            onPress={handleCreateClient}
            loading={loading}
            disabled={loading}
            marginTop={hp(6)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: hp(6),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  backButton: {
    padding: wp(2.5),
  },
  headerTitle: {
    color: "#FFF",
    fontSize: hp(2.3),
    textAlign: "center",
    flex: 1,
    fontFamily: fonts.medium,
  },
  formContainer: {
    flexGrow: 1,
    paddingHorizontal: wp(4),
  },
});
