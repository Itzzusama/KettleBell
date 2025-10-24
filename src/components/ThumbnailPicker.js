import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/COLORS";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import fonts from "../assets/fonts";

export default function ThumbnailPicker({
  thumbnail,
  setThumbnail,
  title = "Thumbnail Image",
}) {
  const [isUploadingUI, setIsUploadingUI] = useState(false);
  const [isSuccessUI, setIsSuccessUI] = useState(false);

  const pickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;

      setThumbnail(uri);
      setIsUploadingUI(true);
      setIsSuccessUI(false);

      // Fake UI upload animation (no overlay)
      setTimeout(() => {
        setIsUploadingUI(false);
        setIsSuccessUI(true);
      }, 1000);
    }
  };

  useEffect(() => {
    if (!thumbnail) {
      setIsUploadingUI(false);
      setIsSuccessUI(false);
    }
  }, [thumbnail]);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity
        style={styles.uploadArea}
        onPress={pickThumbnail}
        activeOpacity={0.7}
        disabled={isUploadingUI}
      >
        {thumbnail ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: thumbnail }} style={styles.selectedImage} />

            {isUploadingUI && (
              <ActivityIndicator
                style={styles.loader}
                size="small"
                color={COLORS.primaryColor}
              />
            )}

            {isSuccessUI && !isUploadingUI && (
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={30} color="#4CAF50" />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={styles.uploadIcon}>
              <Ionicons name="cloud-upload-outline" size={25} color="#666" />
            </View>

            <Text style={styles.uploadText}>
              <Text style={styles.uploadLink}>Click to upload Thumbnail</Text>
              <Text style={styles.uploadHint}>
                {" "}
                or drag & drop SVG, PNG, JPG or GIF (max. 800×400px)
              </Text>
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: hp(3) },
  title: {
    fontSize: hp(1.7),
    color: COLORS.white,
    marginBottom: hp(1.5),
    fontFamily: fonts.medium,
  },
  uploadArea: {
    height: hp(20),
    borderWidth: 2,
    borderColor: "#444",
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(34, 34, 37)",
    overflow: "hidden",
  },
  imageContainer: { width: "100%", height: "100%" },
  selectedImage: { width: "100%", height: "100%", resizeMode: "cover" },
  loader: {
    position: "absolute",
    bottom: 10,
    left: 10,
  },
  successIconContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    padding: 3,
  },
  placeholderContainer: { alignItems: "center", paddingHorizontal: hp(2) },
  uploadIcon: {
    padding: hp(1.2),
    borderRadius: 30,
    backgroundColor: COLORS.white,
    marginBottom: hp(1.5),
  },
  uploadText: { textAlign: "center" },
  uploadLink: {
    color: COLORS.primaryColor,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  uploadHint: {
    color: "#999",
    fontFamily: fonts.regular,
    fontSize: 12,
  },
});
