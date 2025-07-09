"use client";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import fonts from "../../../assets/fonts";
import CustomButton from "../../../components/CustomButton";
import {
  GetApiRequest,
  PostApiRequest,
  PutApiRequest
} from "../../../services/api";
import { COLORS } from "../../../utils/COLORS";
import { uploadAndGetUrl } from "../../../utils/constant";
import { useToast } from "../../../utils/Toast/toastContext";

export default function CreateExercise() {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const isEditMode = route.params?.editMode || false;
  const exerciseData = route.params?.exerciseData || null;
  const workoutId = route.params?.workoutId || null;
  const day = route.params?.day || null;

  const onExerciseAdded = route.params?.onExerciseAdded || null;

  const [exerciseName, setExerciseName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Beginner");
  const [instruction, setInstruction] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [steps, setSteps] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [equipmentInput, setEquipmentInput] = useState("");
  const [muscleInput, setMuscleInput] = useState("");
  const [duration, setDuration] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [difficultyItems, setDifficultyItems] = useState([
    { label: "Beginner", value: "Beginner" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Advanced", value: "Advanced" },
  ]);

  useEffect(() => {
    if (isEditMode && exerciseData) {
      setExerciseName(exerciseData.name || "");
      setSelectedCategory(
        exerciseData.category?._id || exerciseData.category || null
      );
      setDescription(exerciseData.description || "");
      setSelectedDifficulty(exerciseData.difficulty || "Beginner");
      setSelectedImages(exerciseData.images || []);
      setSelectedEquipment(exerciseData.equipment?.filter((item) => item.trim()) || []);
      setSelectedMuscles(exerciseData.targetMuscles?.filter((item) => item.trim()) || []);
      setSteps(exerciseData.instructions?.filter((item) => item.trim()) || []);
      setDuration(exerciseData.duration?.toString() || "");
    }
  }, [isEditMode, exerciseData]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await GetApiRequest(
        "api/exercise-categories/my-categories"
      );
      if (response && response.data && response.data.data) {
        const formattedCategories = response.data.data.map((cat) => ({
          label: cat.name,
          value: cat._id,
        }));
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.log("Error fetching categories:", error);
      Alert.alert("Error", "Failed to load categories");
    }
  };

  const pickMultipleImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets) {
      const newImageUris = result.assets.map((asset) => asset.uri);
      setSelectedImages((prevImages) => [...prevImages, ...newImageUris]);
    }
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  const removeEquipment = (equipment) => {
    setSelectedEquipment(
      selectedEquipment.filter((item) => item !== equipment)
    );
  };

  const removeMuscle = (muscle) => {
    setSelectedMuscles(selectedMuscles.filter((item) => item !== muscle));
  };

  const addStep = () => {
    if (instruction.trim()) {
      setSteps([...steps, instruction.trim()]);
      setInstruction("");
    } else {
      toast.showToast({
        type: "error",
        message: "Please enter a valid instruction step",
        duration: 4000,
      });
    }
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const addEquipment = () => {
    if (equipmentInput.trim()) {
      setSelectedEquipment((prev) => [...prev, equipmentInput.trim()]);
      setEquipmentInput("");
    } else {
      toast.showToast({
        type: "error",
        message: "Please enter a valid equipment",
        duration: 4000,
      });
    }
  };

  const addMuscle = () => {
    if (muscleInput.trim()) {
      setSelectedMuscles((prev) => [...prev, muscleInput.trim()]);
      setMuscleInput("");
    } else {
      toast.showToast({
        type: "error",
        message: "Please enter a valid target muscle",
        duration: 4000,
      });
    }
  };

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

      console.log("All images processed successfully:", allImages);
      return allImages;
    } catch (error) {
      console.log("Error in uploadAllImages:", error);
      throw error;
    }
  };

  const validateForm = () => {
    if (!exerciseName.trim()) {
      toast.showToast({
        type: "error",
        message: "Exercise name is required",
        duration: 4000,
      });
      return false;
    }

    if (!selectedCategory) {
      toast.showToast({
        type: "error",
        message: "Please select a category",
        duration: 4000,
      });
      return false;
    }

    if (!description.trim()) {
      toast.showToast({
        type: "error",
        message: "Description is required",
        duration: 4000,
      });
      return false;
    }

    if (!duration.trim() || isNaN(Number.parseInt(duration))) {
      toast.showToast({
        type: "error",
        message: "Please enter a valid duration in minutes",
        duration: 4000,
      });
      return false;
    }

    if (selectedEquipment.length === 0) {
      toast.showToast({
        type: "error",
        message: "Please add at least one equipment",
        duration: 4000,
      });
      return false;
    }

    if (selectedMuscles.length === 0) {
      toast.showToast({
        type: "error",
        message: "Please add at least one target muscle",
        duration: 4000,
      });
      return false;
    }

    if (steps.length === 0) {
      toast.showToast({
        type: "error",
        message: "Please add at least one instruction step",
        duration: 4000,
      });
      return false;
    }

    return true;
  };

  // Add exercise to workout day
  const addExerciseToDay = async (exerciseId) => {
    try {
      const url = `api/workout-plans/${workoutId}/daily-workouts/${day}/exercises`
      const response = await PostApiRequest(url, { exerciseId })

      if (response.data.success || response.status === 200) {
        // Close modal and refresh workout data
      } else {
        throw new Error("Failed to add exercise")
      }
    } catch (err) {
      console.error("Error adding exercise:", err)
      Alert.alert("Error", err.message || "Failed to add exercise")
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let uploadedImageUrls = [];

      if (selectedImages.length > 0) {
        try {
          uploadedImageUrls = await uploadAllImages(selectedImages);

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
        name: exerciseName.trim(),
        description: description.trim(),
        category: selectedCategory,
        images: uploadedImageUrls,
        difficulty: selectedDifficulty,
        equipment: selectedEquipment,
        targetMuscles: selectedMuscles,
        instructions: steps,
        duration: Number.parseInt(duration),
      };

      let response;
      if (isEditMode && exerciseData) {
        response = await PutApiRequest(
          `api/exercises/${exerciseData._id}`,
          payload
        );
      } else {
        response = await PostApiRequest("api/exercises", payload);
      }

      if (response && response.data) {

        if (workoutId && day && onExerciseAdded) {
          await addExerciseToDay(response.data.data._id)
        }

        toast.showToast({
          type: "success",
          message: isEditMode
            ? "Exercise updated successfully"
            : "Exercise created successfully",
          duration: 4000,
        });
        navigation.goBack();
      }
    } catch (error) {
      console.log("Error:", error);
      toast.showToast({
        type: "error",
        message: isEditMode
          ? "Failed to update exercise"
          : "Failed to create exercise",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.backgroundColor}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={hp(3)}
            color={COLORS.white}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? "Edit Exercise" : t("CreateExercise.title")}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("CreateExercise.UploadMultipleImages")}
            </Text>
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={pickMultipleImages}
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

            {selectedImages.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                {selectedImages.map((imageUri, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.previewImage}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("CreateExercise.ExerciseName")}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Name"
              placeholderTextColor={COLORS.gray2}
              value={exerciseName}
              onChangeText={setExerciseName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Duration"
              placeholderTextColor={COLORS.gray2}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.section, { zIndex: 3000 }]}>
            <Text style={styles.sectionTitle}>
              {t("CreateExercise.Category")}
            </Text>
            <DropDownPicker
              open={categoryOpen}
              value={selectedCategory}
              items={categories}
              setOpen={setCategoryOpen}
              setValue={setSelectedCategory}
              setItems={setCategories}
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("CreateExercise.Description")}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Description"
              placeholderTextColor={COLORS.gray2}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={[styles.section, { zIndex: 2000 }]}>
            <Text style={styles.sectionTitle}>
              {t("CreateExercise.Difficulty")}
            </Text>
            <DropDownPicker
              open={difficultyOpen}
              value={selectedDifficulty}
              items={difficultyItems}
              setOpen={setDifficultyOpen}
              setValue={setSelectedDifficulty}
              setItems={setDifficultyItems}
              placeholder="Select difficulty"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              arrowIconStyle={styles.dropdownArrow}
              tickIconStyle={styles.dropdownTick}
              zIndex={2000}
              zIndexInverse={2000}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("CreateExercise.Equipment")}
            </Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.textInput, styles.inputWithButtonText]}
                placeholder="Enter equipment"
                placeholderTextColor={COLORS.gray2}
                value={equipmentInput}
                onChangeText={setEquipmentInput}
              />
              <TouchableOpacity style={styles.addButton} onPress={addEquipment}>
                <Text style={styles.addButtonIconText}>
                  {t("CreateExercise.AddButton")}
                </Text>
              </TouchableOpacity>
            </View>
            {selectedEquipment.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tagsContainer}
                contentContainerStyle={styles.tagsContentContainer}
              >
                {selectedEquipment.map((equipment, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tag}
                    onPress={() => removeEquipment(equipment)}
                  >
                    <Text style={styles.tagText}>{equipment}</Text>
                    <Ionicons
                      name="close"
                      size={12}
                      color="#5C5C60"
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("CreateExercise.TargetMuscles")}
            </Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.textInput, styles.inputWithButtonText]}
                placeholder="Enter target muscle"
                placeholderTextColor={COLORS.gray2}
                value={muscleInput}
                onChangeText={setMuscleInput}
              />
              <TouchableOpacity style={styles.addButton} onPress={addMuscle}>
                <Text style={styles.addButtonIconText}>
                  {t("CreateExercise.AddButton")}
                </Text>
              </TouchableOpacity>
            </View>
            {selectedMuscles.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tagsContainer}
                contentContainerStyle={styles.tagsContentContainer}
              >
                {selectedMuscles.map((muscle, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tag}
                    onPress={() => removeMuscle(muscle)}
                  >
                    <Text style={styles.tagText}>{muscle}</Text>
                    <Ionicons
                      name="close"
                      size={12}
                      color="#5C5C60"
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("CreateExercise.Instruction")}
            </Text>
            <Text style={styles.instructionSubtitle}>
              {t("CreateExercise.InstructionSubtitle")}
            </Text>

            {steps.length > 0 && (
              <>
                {steps.map((step, index) => (
                  <View key={index} style={styles.stepContainer}>
                    <Text style={styles.stepNumber}>{index + 1}.</Text>
                    <Text style={styles.stepText}>{step}</Text>
                    <TouchableOpacity
                      onPress={() => removeStep(index)}
                      style={styles.removeStepButton}
                    >
                      <Ionicons name="close" size={16} color="#FF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter instruction step"
              placeholderTextColor={COLORS.gray2}
              value={instruction}
              onChangeText={setInstruction}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
              <Text style={styles.addStepButtonText}>
                {t("CreateExercise.AddStepButton")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.createButton}>
            <CustomButton
              title={
                isEditMode
                  ? "Edit Exercise"
                  : t("CreateExercise.CreateExerciseButton")
              }
              onPress={handleSubmit}
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
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  backButton: {
    padding: wp(1),
  },
  headerTitle: {
    fontSize: hp(2.3),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  headerSpacer: {
    width: wp(8),
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: hp(1.7),
    fontFamily: fonts.regular,
    color: COLORS.white,
    marginBottom: hp(1.5),
  },
  textInput: {
    backgroundColor: "#1D1D20",
    borderRadius: wp(2),
    color: COLORS.white,
    fontSize: hp(1.7),
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: COLORS.gray3,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    height: hp(6.5),
  },
  textArea: {
    height: hp(12),
    paddingTop: hp(1.8),
    paddingBottom: hp(1),
    textAlignVertical: "top",
  },
  dropdown: {
    backgroundColor: "#1D1D20",
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.gray3,
    paddingHorizontal: wp(3),
    height: hp(6.5),
  },
  dropdownContainer: {
    backgroundColor: "#1D1D20",
    borderColor: COLORS.gray3,
    borderRadius: wp(2),
    marginTop: hp(0.5),
  },
  dropdownText: {
    color: COLORS.white,
    fontSize: hp(1.7),
    fontFamily: fonts.regular,
  },
  dropdownPlaceholder: {
    color: COLORS.gray2,
    fontSize: hp(1.7),
    fontFamily: fonts.regular,
  },
  dropdownArrow: {
    tintColor: "#FFF",
  },
  dropdownTick: {
    tintColor: COLORS.primaryColor,
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
    marginBottom: hp(2),
  },
  placeholderContainer: {
    alignItems: "center",
    paddingHorizontal: hp(2),
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
    fontSize: 12,
  },
  uploadHint: {
    color: "#999",
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'center'
  },
  uploadFormats: {
    color: "#666",
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  imagePreviewContainer: {
    flexDirection: "row",
    marginTop: hp(2),
    gap: wp(2.5),
    flexWrap: "wrap",
  },
  previewImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
  },
  removeImageButton: {
    position: "absolute",
    top: -hp(0.5),
    right: -wp(0.5),
    backgroundColor: "red",
    borderRadius: wp(2.5),
    width: wp(5),
    height: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  inputWithButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1D1D20",
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.gray3,
    paddingVertical: hp(0.5),
  },
  inputWithButtonText: {
    flex: 1,
    borderWidth: 0,
    paddingRight: wp(12),
    backgroundColor: "transparent",
  },
  addButton: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(1),
    marginRight: wp(2),
  },
  addButtonIconText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  tagsContainer: {
    marginTop: hp(1.5),
    maxHeight: hp(10),
  },
  tagsContentContainer: {
    flexDirection: "row",
    gap: wp(2),
    paddingRight: wp(4),
  },
  tag: {
    backgroundColor: "#1D1D20",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: wp(5),
    borderColor: COLORS.gray3,
    borderWidth: 0.3,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    color: "#5C5C60",
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  instructionSubtitle: {
    fontSize: hp(1.4),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    marginBottom: hp(1.5),
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1D1D20",
    padding: hp(1.5),
    borderRadius: wp(2),
    marginBottom: hp(1),
    borderWidth: 1,
    borderColor: COLORS.gray3,
  },
  stepNumber: {
    color: COLORS.primaryColor,
    fontSize: hp(1.6),
    fontFamily: fonts.medium,
    marginRight: wp(2),
  },
  stepText: {
    flex: 1,
    color: COLORS.white,
    fontSize: hp(1.5),
    fontFamily: fonts.regular,
  },
  removeStepButton: {
    padding: wp(1),
  },
  addStepButton: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(1.5),
    alignSelf: "flex-end",
    marginTop: hp(1),
  },
  addStepButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  createButton: {
    marginBottom: hp(3),
  },
})