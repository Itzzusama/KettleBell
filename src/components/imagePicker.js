import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import fonts from "../assets/fonts";
import { COLORS } from "../utils/COLORS";

// ✅ Firebase modular imports
import { getApp } from "@react-native-firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "@react-native-firebase/storage";

export default function ExpoImagePicker({ onSave, initialImage = null }) {
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  // 🔥 Firebase upload handler
  const uploadImageToFirebase = async (imageUri) => {
    try {
      setIsUploading(true);

      // Get reference to Firebase Storage
      const app = getApp();
      const storage = getStorage(app);

      // File name and path
      const filename = imageUri.split("/").pop();
      const folder = "profiles";
      const storageRef = ref(storage, `${folder}/${filename}`);

      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload with progress listener
      const uploadTask = uploadBytesResumable(storageRef, blob);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Uploading: ${progress.toFixed(0)}%`);
          },
          (error) => reject(error),
          () => resolve()
        );
      });

      // Get final download URL
      const downloadUrl = await getDownloadURL(storageRef);

      setUploadedImageUrl(downloadUrl);
      if (onSave) onSave(downloadUrl);

      console.log("✅ Uploaded successfully:", downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error("🔥 Firebase upload error:", error);
      Alert.alert("Upload Failed", error.message || "Something went wrong");
      throw error;
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
        await uploadImageToFirebase(imageUri);
      } catch {
        // Already handled in uploadImageToFirebase
      }
    }
  };

  const retryUpload = async () => {
    if (selectedImage) {
      try {
        await uploadImageToFirebase(selectedImage);
      } catch {}
    }
  };

  useEffect(() => {
    if (initialImage) {
      setSelectedImage(initialImage);
      setUploadedImageUrl(initialImage);
    }
  }, [initialImage]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.uploadArea}
        onPress={pickImage}
        disabled={isUploading}
      >
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.selectedImage}
            />

            {isUploading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primaryColor} />
                <Text style={styles.loadingText}>Uploading...</Text>
              </View>
            )}

            {uploadedImageUrl && !isUploading && (
              <View style={styles.successOverlay}>
                <Ionicons name="checkmark-circle" size={30} color="#4CAF50" />
              </View>
            )}

            {!isUploading && !uploadedImageUrl && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={retryUpload}
              >
                <Ionicons name="refresh" size={20} color="#FF6B6B" />
                <Text style={styles.retryText}>Retry Upload</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={styles.uploadIcon}>
              <Ionicons name="cloud-upload-outline" size={25} color="#666" />
            </View>
            <Text style={styles.uploadText}>
              <Text style={styles.uploadLink}>
                Click to upload Banner Image
              </Text>
              <Text style={styles.uploadHint}>
                {" "}
                or drag and drop SVG, PNG, JPG or GIF (max. 800×400px)
              </Text>
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  uploadArea: {
    height: heightPercentageToDP(20),
    borderWidth: 2,
    borderColor: "#444",
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(34, 34, 37)",
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  placeholderContainer: {
    alignItems: "center",
    paddingHorizontal: heightPercentageToDP(2),
  },
  uploadIcon: {
    padding: heightPercentageToDP(1.2),
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: heightPercentageToDP(2),
  },
  uploadText: {
    textAlign: "center",
    marginBottom: heightPercentageToDP(1),
  },
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
  selectedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "white",
    fontFamily: fonts.medium,
    fontSize: 14,
    marginTop: 10,
  },
  successOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 5,
  },
  retryButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  retryText: {
    color: "#FF6B6B",
    fontFamily: fonts.medium,
    fontSize: 12,
    marginLeft: 5,
  },
});
