import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import fonts from "../../../../assets/fonts";
import { COLORS } from "../../../../utils/COLORS";
import { Images } from "../../../../assets/images";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { baseUrl } from "../../../../services/api";

const Footer = ({
  inputText,
  setInputText,
  sendMessage,
  setMsgType,
  setUrl,
  handleSend,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (imageUri) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const fileExtension = filename.split(".").pop();
      const mimeType = `image/${fileExtension}`;

      formData.append("image", {
        uri: imageUri,
        type: mimeType,
        name: filename,
      });
      formData.append("type", "profile");
      formData.append("folder", "profiles");

      const response = await axios.post(
        `${baseUrl}api/upload/image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );

      const result = response.data;
      if (result.success) {
        const url = result.data.url;
        setUrl(url);
        setMsgType("image");

        return url;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "Failed to upload image. Please try again.";
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Upload failed with status ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Upload timed out. Please try again.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      Alert.alert("Upload Failed", errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need access to your gallery to upload images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedImage = result.assets[0];
        await uploadImage(pickedImage.uri);
      }
    } catch (error) {
      console.error("Image picking error:", error);
    }
  };

  return (
    <View style={[styles.mainContainer]}>
      {/* Attachment Icon */}
      <TouchableOpacity onPress={pickImage} disabled={isUploading}>
        {isUploading ? (
          <ActivityIndicator size="small" color={COLORS.primaryColor} />
        ) : (
          <Ionicons name="attach" size={24} color={COLORS.primaryColor} />
        )}
      </TouchableOpacity>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Write Your Message"
          placeholderTextColor={COLORS.gray}
          value={inputText}
          multiline
          textAlignVertical="top"
          onChangeText={(text) => setInputText(text)}
        />
      </View>

      {/* Send */}
      <TouchableOpacity onPress={handleSend} style={{ padding: 12 }}>
        <Image
          source={Images.send}
          style={{ height: 20, width: 20, tintColor: COLORS.primaryColor }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primaryColor,
    paddingHorizontal: 12,
    width: "95%",
    alignSelf: "center",
    height: 56,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 50,
    justifyContent: "center",
  },
  input: {
    padding: 0,
    margin: 0,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: COLORS.primaryColor,
  },
});
