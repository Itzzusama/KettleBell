import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
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
import { baseUrl } from "../services/api";
import { COLORS } from "../utils/COLORS";

export default function ExpoImagePicker({
  onSave,
  initialImage = null,
}) {
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const uploadImage = async (imageUri) => {
    try {
      setIsUploading(true);

      // Create FormData for the upload
      const formData = new FormData();

      // Get file name from URI
      const filename = imageUri.split('/').pop();
      const fileExtension = filename.split('.').pop();
      const mimeType = `image/${fileExtension}`;

      // Append image file
      formData.append('image', {
        uri: imageUri,
        type: mimeType,
        name: filename,
      });

      // Append additional fields
      formData.append('type', 'profile');
      formData.append('folder', 'profiles');

      // Make the API call using axios
      const response = await axios.post(`${baseUrl}api/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });

      const result = response.data;
      if (result.success) {
        // Upload successful
        setUploadedImageUrl(result.data.url);

        // Call parent callbacks
        if (onSave) {
          onSave(result.data.url);
        }

        return result;
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('Upload error:', error);

      // Handle axios errors
      let errorMessage = "Failed to upload image. Please try again.";

      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Upload failed with status ${error.response.status}`;
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        errorMessage = "Upload timed out. Please try again.";
      } else {
        // Other errors
        errorMessage = error.message || errorMessage;
      }

      Alert.alert("Upload Failed", errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    // Launch image picker - SINGLE IMAGE ONLY
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);

      // Upload the image first
      try {
        await uploadImage(imageUri);
      } catch (error) {
        // Error already handled in uploadImage function
        // Don't call onImageSelected since upload failed
      }
    }
  };

  const retryUpload = async () => {
    if (selectedImage) {
      try {
        await uploadImage(selectedImage);
      } catch (error) {
        // Error already handled in uploadImage function
      }
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
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />

            {/* Loading overlay */}
            {isUploading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primaryColor} />
                <Text style={styles.loadingText}>Uploading...</Text>
              </View>
            )}

            {/* Success indicator */}
            {uploadedImageUrl && !isUploading && (
              <View style={styles.successOverlay}>
                <Ionicons name="checkmark-circle" size={30} color="#4CAF50" />
              </View>
            )}

            {/* Retry button if upload failed */}
            {!isUploading && !uploadedImageUrl && (
              <TouchableOpacity style={styles.retryButton} onPress={retryUpload}>
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
  sectionTitle: {
    fontSize: heightPercentageToDP(1.8),
    color: "white",
    fontFamily: fonts.medium,
    marginBottom: heightPercentageToDP(1.5),
  },
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
  uploadFormats: {
    color: "#666",
    fontSize: 12,
    fontFamily: fonts.regular,
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