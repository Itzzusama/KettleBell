"use client";

import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import fonts from "../../../assets/fonts/index";
import CustomButton from "../../../components/CustomButton";
import { GetApiRequest, PostApiRequest, PutApiRequest } from "../../../services/api";
import { COLORS } from "../../../utils/COLORS";
import { uploadAndGetUrl } from "../../../utils/constant";
import { useToast } from "../../../utils/Toast/toastContext";

export default function CreateWorkoutPlans() {
  const { isEdit, item } = useRoute().params;
  const navigation = useNavigation();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  // Temporary translation function (to be replaced with react-i18next)
  const t = (key) => {
    const translations = {
      "CreateWorkoutPlans.title": "Create Workout Plan",
      "CreateWorkoutPlans.images": "Upload Images",
      "CreateWorkoutPlans.category": "Category",
      "CreateWorkoutPlans.workname": "Workout Plan Name",
      "CreateWorkoutPlans.description": "Description",
      "CreateWorkoutPlans.weeknumb": "Number of Weeks",
      "CreateWorkoutPlans.plancreate": "Create Plan",
    };
    return translations[key] || key;
  };

  const [workoutName, setWorkoutName] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfWeeks, setNumberOfWeeks] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [categoriesState, setCategoriesState] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setUploadedImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const removeImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const getCategories = async () => {
    try {
      const res = await GetApiRequest(
        "api/workout-plan-categories/my-categories"
      );
      if (res && res.data && res.data.data) {
        const fetchedCategories = res.data.data.map((cat) => ({
          label: cat.name,
          value: cat.id,
        }));
        setCategoriesState(fetchedCategories);
      }
    } catch (error) {
      console.log("Error fetching categories:", error);
      Alert.alert("Error", "Failed to load categories");
    }
  };

  useEffect(() => {
    getCategories();
    if (isEdit && item) {
      setWorkoutName(item.name);
      setDescription(item.description);
      setNumberOfWeeks(item.numberOfWeeks.toString());
      setSelectedCategory(item.category._id);
      setUploadedImages(item.images);
    } else {
      setWorkoutName("");
      setDescription("");
      setNumberOfWeeks("");
      setSelectedCategory(null);
      setUploadedImages([]);
    }
  }, []);

  const uploadAllImages = async (images) => {
    try {
      toast.showToast({
        type: "info",
        message: "Uploading images...",
        duration: 3000,
      });

      const localImages = images.filter((image) => !image.startsWith("http"));

      if (localImages.length === 0) {
        return images;
      }

      const uploadPromises = localImages.map(async (imageUri) => {
        try {
          const uploadedUrl = await uploadAndGetUrl(
            { path: imageUri, uri: imageUri },
            "workout",
            "workouts"
          );
          return uploadedUrl;
        } catch (error) {
          console.log("Error uploading image:", error);
          throw error;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url) => url);

      const remoteImages = images.filter((image) => image.startsWith("http"));
      const allImages = [...remoteImages, ...validUrls];

      console.log("All images uploaded successfully:", allImages);
      return allImages;
    } catch (error) {
      console.log("Error in uploadAllImages:", error);
      throw error;
    }
  };

  const handleCreatePlan = async () => {
    if (!workoutName.trim()) {
      toast.showToast({
        type: "error",
        message: "Workout name is required",
        duration: 4000,
      });
      setIsLoading(false);
      return;
    }

    if (!numberOfWeeks.trim() || isNaN(Number.parseInt(numberOfWeeks))) {
      toast.showToast({
        type: "error",
        message: "Please enter a valid number of weeks",
        duration: 4000,
      });
      setIsLoading(false);
      return;
    }

    if (!selectedCategory) {
      toast.showToast({
        type: "error",
        message: "Please select a category",
        duration: 4000,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let uploadedImageUrls = [];

      if (uploadedImages.length > 0) {
        try {
          uploadedImageUrls = await uploadAllImages(uploadedImages);

          if (uploadedImageUrls.length === 0) {
            toast.showToast({
              type: "error",
              message: "Failed to upload images",
              duration: 4000,
            });
            setIsLoading(false);
            return;
          }

          toast.showToast({
            type: "success",
            message: "Images uploaded successfully",
            duration: 2000,
          });
        } catch (uploadError) {
          console.log("Image upload failed:", uploadError);
          toast.showToast({
            type: "error",
            message: "Failed to upload images. Please try again.",
            duration: 4000,
          });
          setIsLoading(false);
          return;
        }
      }

      const payload = {
        name: workoutName.trim(),
        description: description.trim(),
        category: selectedCategory,
        images: uploadedImageUrls,
        numberOfWeeks: Number.parseInt(numberOfWeeks),
      };

      if (isEdit && item) {
        const res = await PutApiRequest(`api/workout-plans/${item._id}`, payload);
        if (res && res.data) {
          toast.showToast({
            type: "success",
            message: "Workout plan updated successfully",
            duration: 4000,
          });
        }
      } else {
        const res = await PostApiRequest("api/workout-plans", payload);
        if (res && res.data) {
          toast.showToast({
            type: "success",
            message: "Workout plan created successfully",
            duration: 4000,
          });

          // navigation.navigate(RouteName.CLient_workout_plan, { item: res.data.data });
        }
        setWorkoutName("");
        setDescription("");
        setNumberOfWeeks("");
        setUploadedImages([]);
        setSelectedCategory(null);
      }
    } catch (error) {
      console.log("Error creating workout plan:", error);
      toast.showToast({
        type: "error",
        message: "Failed to create workout plan. Please try again.",
        duration: 4000,
      });
    } finally {
      navigation.goBack();
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
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
          <Feather name="arrow-left" size={wp(6)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? "Edit Workout Plan" : t("CreateWorkoutPlans.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: hp(5) }}
        >
          {/* Upload Section */}
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>
              {t("CreateWorkoutPlans.images")}
            </Text>
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <View style={styles.placeholderContainer}>
                <View style={styles.uploadIcon}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={hp(3)}
                    color={COLORS.primaryColor}
                  />
                </View>
                <Text style={styles.uploadText}>
                  <Text style={styles.uploadLink}>Click to upload Images</Text>
                </Text>
                <Text style={styles.uploadHint}>
                  or drag and drop{" "}
                  <Text style={styles.uploadFormats}>
                    SVG, PNG, JPG or GIF (max. 800×400px)
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>

            {uploadedImages.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                <Text style={styles.selectedImagesText}>
                  Selected Images ({uploadedImages.length})
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.imageScrollContainer}
                >
                  {uploadedImages.map((imageUri, index) => (
                    <View key={index} style={styles.imagePreview}>
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.uploadedImage}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close" size={wp(4)} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.formSection}>
            <View style={[styles.inputGroup, { zIndex: 3000 }]}>
              <Text style={styles.inputLabel}>
                {t("CreateWorkoutPlans.category")}
              </Text>
              <DropDownPicker
                open={open}
                value={selectedCategory}
                items={categoriesState}
                setOpen={setOpen}
                setValue={setSelectedCategory}
                setItems={setCategoriesState}
                placeholder="Select a category"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                arrowIconStyle={styles.dropdownArrow}
                tickIconStyle={styles.dropdownTick}
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t("CreateWorkoutPlans.workname")}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Beginner Strength Program"
                placeholderTextColor="#666"
                value={workoutName}
                onChangeText={setWorkoutName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t("CreateWorkoutPlans.description")}
              </Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Description"
                placeholderTextColor="#666"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t("CreateWorkoutPlans.weeknumb")}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 4"
                placeholderTextColor="#666"
                value={numberOfWeeks}
                onChangeText={setNumberOfWeeks}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title={isEdit ? "Update" : t("CreateWorkoutPlans.plancreate")}
              onPress={handleCreatePlan}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
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
    marginBottom: hp(3),
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    color: "#FFF",
    fontSize: hp(2.3),
    fontFamily: fonts.medium,
  },
  headerSpacer: {
    width: wp(8),
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  uploadSection: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: hp(1.7),
    fontFamily: fonts.medium,
    marginBottom: hp(1.5),
  },
  uploadArea: {
    height: hp(20),
    borderWidth: 2,
    borderColor: "#444",
    borderStyle: "dashed",
    borderRadius: wp(3),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1D1D20",
    marginBottom: hp(2),
  },
  placeholderContainer: {
    alignItems: "center",
    paddingHorizontal: wp(4),
  },
  uploadIcon: {
    padding: hp(1.2),
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
  },
  uploadText: {
    textAlign: "center",
    marginBottom: hp(1),
  },
  uploadLink: {
    color: COLORS.primaryColor,
    fontFamily: fonts.medium,
    fontSize: hp(1.7),
  },
  uploadHint: {
    color: "#999",
    fontFamily: fonts.regular,
    fontSize: hp(1.5),
    textAlign: "center"
  },
  uploadFormats: {
    color: "#666",
    fontSize: hp(1.5),
    fontFamily: fonts.regular,
  },
  imagePreviewContainer: {
    marginTop: hp(2),
  },
  selectedImagesText: {
    fontSize: hp(1.6),
    fontFamily: fonts.medium,
    color: COLORS.white,
    marginBottom: hp(1),
  },
  imageScrollContainer: {
    flexDirection: "row",
    gap: wp(2.5),
  },
  imagePreview: {
    position: "relative",
  },
  uploadedImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: -wp(0.5),
    right: -wp(0.5),
    backgroundColor: "#FF4444",
    borderRadius: wp(2.5),
    width: wp(5),
    height: wp(5),
    alignItems: "center",
    justifyContent: "center",
  },
  formSection: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: hp(3),
  },
  inputLabel: {
    color: "#FFF",
    fontSize: hp(1.7),
    fontFamily: fonts.medium,
    marginBottom: hp(1),
  },
  textInput: {
    backgroundColor: "#1D1D20",
    borderRadius: wp(2.5),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    color: "#FFF",
    fontSize: hp(1.7),
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: "#444",
  },
  textArea: {
    height: hp(12),
    paddingTop: hp(1.5),
    textAlignVertical: "top",
  },
  buttonContainer: {
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  dropdown: {
    backgroundColor: "#1D1D20",
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: "#444",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  dropdownContainer: {
    backgroundColor: "#1D1D20",
    borderColor: "#444",
    borderRadius: wp(2.5),
    marginTop: hp(0.5),
  },
  dropdownText: {
    color: "#FFF",
    fontSize: hp(1.7),
    fontFamily: fonts.regular,
  },
  dropdownPlaceholder: {
    color: "#666",
    fontSize: hp(1.7),
    fontFamily: fonts.regular,
  },
  dropdownArrow: {
    tintColor: "#FFF",
  },
  dropdownTick: {
    tintColor: COLORS.primaryColor,
  },
});