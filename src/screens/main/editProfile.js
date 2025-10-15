import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { COLORS } from "../../utils/COLORS";
import fonts from "../../assets/fonts";
import { useNavigation } from "@react-navigation/native";
import CustomInput from "../../components/CustomInput";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { PutApiRequest } from "../../services/api";
import CustomButton from "../../components/CustomButton";
import { useToast } from "../../utils/Toast/toastContext";
import { setUserData } from "../../store/slices/usersSlice";
import { uploadAndGetUrl } from "../../utils/constant"; // ✅ Firebase upload helper

const EditProfile = () => {
  const navigation = useNavigation();
  const toast = useToast();
  const { userData } = useSelector((state) => state.users);

  const [selectedImage, setSelectedImage] = useState(userData?.avatar || "");
  const [uploadedImageUrl, setUploadedImageUrl] = useState(
    userData?.avatar || ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const [name, setName] = useState(userData?.name || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [phone, setPhone] = useState(userData?.phone || "");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const validateForm = () => {
    let valid = true;
    if (!name.trim()) {
      setNameError("Name is required");
      valid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Invalid email format");
      valid = false;
    }

    if (!phone.trim()) {
      setPhoneError("Phone number is required");
      valid = false;
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
      setPhoneError("Enter a valid phone number");
      valid = false;
    }

    return valid;
  };

  // ✅ Upload image to Firebase using uploadAndGetUrl()
  const uploadImage = async (imageUri) => {
    try {
      setIsUploading(true);

      const file = { path: imageUri }; // uploadAndGetUrl expects a file object
      const url = await uploadAndGetUrl(file, "profile", "profiles");

      if (url) {
        setUploadedImageUrl(url);
        console.log("✅ Uploaded Image URL:", url);
      } else {
        throw new Error("Failed to get uploaded image URL");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", "Please try again later.");
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);

      try {
        await uploadImage(imageUri);
      } catch (error) {}
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payLoad = {
        name: name,
        avatar: uploadedImageUrl,
        phone: phone,
      };

      const res = await PutApiRequest("api/users/profile", payLoad);
      if (res?.data?.success) {
        dispatch(setUserData(res?.data?.data));
        toast.showToast({
          message: res?.data?.message,
          type: "success",
          duration: 3000,
        });
      }
      navigation.goBack();
    } catch (err) {
      console.log(err?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={wp(6)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.profileInfo}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri:
                  selectedImage ||
                  uploadedImageUrl ||
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/profile%20%281%29-eXi6mLmmvgcw9cLfiOwFvfXZletFX8.png",
              }}
              style={styles.profileImage}
            />

            <View style={styles.editIconContainer}>
              <FontAwesome name="pencil" size={14} color="white" />
            </View>
          </TouchableOpacity>

          {isUploading && (
            <Text style={{ color: "#999", marginTop: 8 }}>Uploading...</Text>
          )}
        </View>

        <CustomInput
          placeholder="Enter your name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setNameError("");
          }}
          marginBottom={hp(2)}
          error={nameError}
        />

        <CustomInput
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError("");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          marginBottom={hp(2)}
          error={emailError}
          editable={false}
        />

        <CustomInput
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            setPhoneError("");
          }}
          keyboardType="phone-pad"
          marginBottom={hp(2)}
          error={phoneError}
        />

        <CustomButton
          title={"Save Changes"}
          onPress={handleSave}
          loading={loading}
          disabled={loading || isUploading}
          marginTop={40}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: hp(5),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    color: "#FFF",
    fontSize: hp(2.3),
    fontFamily: fonts.medium,
  },
  placeholder: {
    width: wp(10),
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: hp(10),
    paddingHorizontal: wp(5),
  },
  profileInfo: {
    alignItems: "center",
    paddingVertical: 24,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 999,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFD700",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
