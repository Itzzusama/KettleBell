import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
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

import { Icons } from "../../assets/icons";
import { Images } from "../../assets/images";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { PutApiRequest } from "../../services/api";

import fonts from "../../assets/fonts";
import { COLORS } from "../../utils/COLORS";
import { useToast } from "../../utils/Toast/toastContext";

export default function UpdatedPassword() {
  const toast = useToast();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;

    if (!currentPassword.trim()) {
      setCurrentPasswordError("Current password is required");
      isValid = false;
    } else {
      setCurrentPasswordError("");
    }

    if (!newPassword.trim()) {
      setNewPasswordError("New password is required");
      isValid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError("New password must be at least 6 characters");
      isValid = false;
    } else {
      setNewPasswordError("");
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your new password");
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleUpdatePassword = async () => {
    if (!validateForm()) {
      return;
    }

    const data = {
      currentPassword,
      newPassword,
    };

    try {
      setLoading(true);
      const response = await PutApiRequest("api/auth/update-password", data);
      console.log("response=====", response.data);
      toast.showToast({
        type: "success",
        message: response.data.message || "Password updated successfully",
        duration: 4000,
      });
      navigation.goBack();
    } catch (error) {
      console.error("Password update error:", error);
      toast.showToast({
        type: "error",
        message: error.response?.data?.message || "Failed to update password. Please try again.",
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

            <Text style={styles.title}>Change Password</Text>

            <View style={styles.inputContainer}>
              <CustomInput
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  setCurrentPasswordError("");
                }}
                secureTextEntry={true}
                leftIcon={Icons.lockIcon}
                marginBottom={hp(2)}
                error={currentPasswordError}
              />
              <CustomInput
                placeholder="New Password"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setNewPasswordError("");
                }}
                secureTextEntry={true}
                leftIcon={Icons.lockIcon}
                marginBottom={hp(2)}
                error={newPasswordError}
              />
              <CustomInput
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError("");
                }}
                secureTextEntry={true}
                leftIcon={Icons.lockIcon}
                marginBottom={hp(2)}
                error={confirmPasswordError}
              />
            </View>

            <CustomButton
              title="Update Password"
              onPress={handleUpdatePassword}
              style={styles.loginButton}
              loading={loading}
            />
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
    marginBottom: hp(2),
  },
  inputContainer: {
    marginBottom: hp(2),
  },
  loginButton: {
    width: "100%",
    marginBottom: hp(3),
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