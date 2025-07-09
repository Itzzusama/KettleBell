import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
  View
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import fonts from "../../../assets/fonts";
import CustomButton from "../../../components/CustomButton";
import { PostApiRequest, PutApiRequest } from "../../../services/api";
import { COLORS } from "../../../utils/COLORS";
import { uploadAndGetUrl } from "../../../utils/constant";
import { useToast } from "../../../utils/Toast/toastContext";

export default function CreateNewRecipe() {
  const { t } = useTranslation();
  const { weekSchedule } = useSelector((state) => state.mealPlan);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const toast = useToast();

  const { recipe: mealPlanId } = route.params;
  const isEditMode = route.params?.editMode || false;
  const mealData = route.params?.mealData || null;

  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [mealName, setMealName] = useState("");
  const [description, setDescription] = useState("");
  const [recipe, setRecipe] = useState("");
  const [time, setTime] = useState("");
  const [instruction, setInstruction] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [steps, setSteps] = useState([]);
  const [openDayDropdown, setOpenDayDropdown] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [disabledMealTypes, setDisabledMealTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const mealTypes = [
    { id: "breakfast", name: t("AddMeal.Breakfast"), icon: "sunny" },
    { id: "lunch", name: t("AddMeal.Lunch"), icon: "sunny-outline" },
    { id: "dinner", name: t("AddMeal.Dinner"), icon: "moon" },
  ];

  const daysOfWeek = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
  ];

  useEffect(() => {
    if (selectedDay !== null && weekSchedule) {
      const dayData = weekSchedule.find((day) => day.dayOfWeek === selectedDay);
      if (dayData) {
        const existingMeals = Object.entries(dayData.meals)
          .filter(([mealType, meal]) => {
            if (meal === null) return false;
            // If in edit mode, don't disable the meal being edited
            if (isEditMode && mealData && meal._id === mealData._id) {
              return false;
            }
            return true;
          })
          .map(([mealType, _]) => mealType);
        setDisabledMealTypes(existingMeals);

        // If the currently selected meal type is now disabled (and not in edit mode), reset it
        if (existingMeals.includes(selectedMealType) && !isEditMode) {
          setSelectedMealType(null);
        }

      } else {
        setDisabledMealTypes([]);
      }
    } else {
      setDisabledMealTypes([]);
    }
  }, [selectedDay, weekSchedule, isEditMode, mealData]);

  useEffect(() => {
    if (isEditMode && mealData) {
      setMealName(mealData.name || "");
      setDescription(mealData.description || "");
      setSelectedImages(Array.isArray(mealData.images) ? mealData.images : mealData.images ? [mealData.images] : []);
      setTime(mealData.time || "");
      setRecipes(Array.isArray(mealData.ingredients) ? mealData.ingredients.filter((item) => item.trim()) : []);
      setSteps(Array.isArray(mealData.instructions) ? mealData.instructions.filter((item) => item.trim()) : []);
      setSelectedMealType(mealData.mealType || "breakfast");
      // Use dayOfWeek (number 0-6) for the dropdown
      setSelectedDay(mealData.dayOfWeek !== undefined ? Number(mealData.dayOfWeek) : null);
    }
  }, [isEditMode, mealData]);

  const pickMultipleImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
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
            "nutrition",
            "nutrition"
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

  const handleAddRecipe = () => {
    if (recipe.trim()) {
      setRecipes([...recipes, recipe.trim()]);
      setRecipe("");
    } else {
      toast.showToast({
        type: "error",
        message: "Please enter a valid ingredient",
        duration: 4000,
      });
    }
  };

  const handleRemoveRecipe = (index) => {
    const newRecipes = recipes.filter((_, i) => i !== index);
    setRecipes(newRecipes);
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

  const validateForm = () => {
    if (!mealName.trim()) {
      toast.showToast({
        type: "error",
        message: "Meal name is required",
        duration: 4000,
      });
      return false;
    }

    // Only validate selectedDay if not in edit mode
    if (!isEditMode && selectedDay === null) {
      toast.showToast({
        type: "error",
        message: "Please select a day",
        duration: 4000,
      });
      return false;
    }

    if (!selectedMealType) {
      toast.showToast({
        type: "error",
        message: "Please select a meal type",
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

    if (recipes.length === 0) {
      toast.showToast({
        type: "error",
        message: "Please add at least one recipe ingredient",
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

  const handleCreateMeal = async () => {
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

      const mealPayload = {
        name: mealName.trim(),
        description: description.trim(),
        images: uploadedImageUrls,
        time: time.trim(),
        ingredients: recipes,
        instructions: steps,
        mealType: selectedMealType,
        dayOfWeek: isEditMode ? mealData.dayOfWeek : selectedDay, // Use existing dayOfWeek in edit mode
      };

      console.log("Creating/updating meal with payload:", mealPayload);

      let response;
      if (isEditMode && mealData) {
        response = await PutApiRequest(
          `api/meal-plans/${mealPlanId}/daily-meals/${mealData.dayOfWeek}/${mealData.mealType}`,
          mealPayload
        );
      } else {
        response = await PostApiRequest(
          `api/meal-plans/${mealPlanId}/daily-meals/${selectedDay}/${selectedMealType}`,
          mealPayload
        );
      }

      if (response && response.data) {
        toast.showToast({
          type: "success",
          message: isEditMode ? "Meal updated successfully" : "Meal created successfully",
          duration: 4000,
        });
        navigation.goBack();
      }
    } catch (error) {
      console.log("Error:", error);
      toast.showToast({
        type: "error",
        message: isEditMode ? "Failed to update meal" : "Failed to create meal",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundColor} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={hp(3)} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? "Edit Meal" : t("AddMeal.title")}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Day Dropdown - Only show if not in edit mode */}
          {!isEditMode && (
            <View style={[styles.section, { zIndex: 3000 }]}>
              <Text style={styles.sectionTitle}>Day</Text>
              <View style={{ height: hp(6), zIndex: 3000 }}>
                <DropDownPicker
                  open={openDayDropdown}
                  value={selectedDay}
                  items={daysOfWeek}
                  setOpen={setOpenDayDropdown}
                  setValue={setSelectedDay}
                  style={styles.dropdown}
                  dropDownContainerStyle={[styles.dropdownContainer, { maxHeight: hp(30) }]}
                  textStyle={styles.dropdownText}
                  placeholder="Select a day"
                  zIndex={3000}
                  zIndexInverse={1000}
                  arrowIconStyle={styles.dropdownArrow}
                  listMode="SCROLLVIEW"
                />
              </View>
            </View>
          )}

          {!isEditMode && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("AddMeal.subTitle")}</Text>
              <View style={styles.mealTypeContainer}>
                {mealTypes.map((meal) => (
                  <TouchableOpacity
                    key={meal.id}
                    disabled={disabledMealTypes.includes(meal.id)}
                    style={[
                      styles.mealTypeButton,
                      selectedMealType === meal.id && styles.selectedMealType,
                      disabledMealTypes.includes(meal.id) && styles.disabledMealButton,
                    ]}
                    onPress={() => setSelectedMealType(meal.id)}
                  >
                    <Ionicons
                      name={meal.icon}
                      size={hp(3)}
                      color={selectedMealType === meal.id ? COLORS.black : COLORS.gray2}
                    />
                    <Text
                      style={[
                        styles.mealTypeText,
                        selectedMealType === meal.id && styles.mealTypeTextActive,
                      ]}
                    >
                      {meal.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("AddMeal.images")}</Text>
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={pickMultipleImages}
              activeOpacity={0.7}
            >
              <View style={styles.placeholderContainer}>
                <View style={styles.uploadIcon}>
                  <Ionicons name="cloud-upload-outline" size={hp(3)} color={COLORS.primaryColor} />
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

            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.imageScrollContainer}>
                    {selectedImages.map((imageUri, index) => (
                      <View key={index} style={styles.imagePreview}>
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => removeImage(index)}
                        >
                          <Ionicons name="close" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>

          {/* Meal Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("AddMeal.mealname")}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Name"
              placeholderTextColor={COLORS.gray2}
              value={mealName}
              onChangeText={setMealName}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("AddMeal.description")}</Text>
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

          {/* Add Recipe */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Ingredients</Text>
            <View style={styles.addRecipeContainer}>
              <TextInput
                style={[styles.textInput, styles.recipeInput]}
                placeholder="Add Ingredients"
                placeholderTextColor={COLORS.gray2}
                value={recipe}
                onChangeText={setRecipe}
              />
              <TouchableOpacity
                style={styles.tagAddButton}
                onPress={handleAddRecipe}
                accessible={true}
                accessibilityLabel="Add new recipe"
              >
                <Text style={{ color: COLORS.white, fontFamily: fonts.medium }}>
                  {t("AddMeal.addbtn")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recipe Tags */}
            {recipes.length > 0 && (
              <View style={styles.recipeTagsContainer}>
                {recipes.map((recipeItem, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recipeTag}
                    onPress={() => handleRemoveRecipe(index)}
                  >
                    <Text style={styles.recipeTagText}>{recipeItem}</Text>
                    <Ionicons name="close" size={12} color="#5C5C60" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("AddMeal.time")}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Time"
              placeholderTextColor={COLORS.gray2}
              value={time}
              onChangeText={setTime}
            />
          </View>

          {/* Instruction */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("AddMeal.instruction")}</Text>
            <Text style={styles.instructionSubtitle}>
              {t("AddMeal.description1")}
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
              style={[styles.textInput, styles.instructionTextArea]}
              placeholder="Enter instruction step"
              placeholderTextColor={COLORS.gray2}
              value={instruction}
              onChangeText={setInstruction}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.addStepButton}
              onPress={addStep}
              accessible={true}
              accessibilityLabel="Add new step"
            >
              <Text style={styles.addStepButtonText}>{t("AddMeal.addstep")}</Text>
            </TouchableOpacity>
          </View>

          {/* Add Button */}
          <View style={styles.buttonContainer}>
            <CustomButton
              title={isEditMode ? "Update Meal" : t("AddMeal.add")}
              onPress={handleCreateMeal}
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
    paddingBottom: hp(2),
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
    paddingTop: hp(2),
  },
  section: {
    marginBottom: hp(1),
    marginTop: hp(1),
  },
  sectionTitle: {
    fontSize: hp(1.7),
    fontFamily: fonts.regular,
    color: COLORS.white,
    marginBottom: hp(1),
  },
  mealTypeContainer: {
    flexDirection: "row",
    gap: wp(3),
  },
  dropdownArrow: {
    tintColor: "#FFF",
  },
  mealTypeButton: {
    flex: 1,
    backgroundColor: "#1D1D20",
    borderRadius: wp(3),
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.gray3,
  },
  selectedMealType: {
    backgroundColor: COLORS.primaryColor,
    borderColor: COLORS.primaryColor,
  },
  disabledMealButton: {
    backgroundColor: COLORS.lightgray,
    opacity: 0.5,
  },
  mealTypeText: {
    fontSize: hp(1.6),
    fontFamily: fonts.medium,
    color: COLORS.gray2,
    marginTop: hp(0.5),
  },
  mealTypeTextActive: {
    color: COLORS.black,
  },
  dropdown: {
    backgroundColor: "#1D1D20",
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.gray3,
    height: hp(6),
  },
  dropdownContainer: {
    backgroundColor: "#1D1D20",
    borderWidth: 1,
    borderColor: COLORS.gray3,
  },
  dropdownText: {
    color: COLORS.white,
    fontSize: hp(1.7),
    fontFamily: fonts.regular,
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
    textAlign: "center",
  },
  uploadFormats: {
    color: "#666",
    fontSize: 12,
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
    marginRight: wp(2),

  },
  previewImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
  },
  removeImageButton: {
    position: "absolute",
    top: 0,
    right: -wp(0.5),
    backgroundColor: "red",
    borderRadius: wp(2.5),
    width: wp(5),
    height: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    backgroundColor: "#1D1D20",
    borderRadius: wp(2),
    color: COLORS.white,
    fontSize: hp(1.7),
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: COLORS.gray3,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  textArea: {
    height: hp(12),
    paddingTop: hp(1.8),
    textAlignVertical: "top",
  },
  instructionTextArea: {
    height: hp(12),
    paddingTop: hp(1.8),
    textAlignVertical: "top",
  },
  addRecipeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1D1D20",
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.gray3,
    marginBottom: hp(2),
    position: "relative",
  },
  recipeInput: {
    flex: 1,
    paddingRight: wp(10),
  },
  tagAddButton: {
    position: "absolute",
    right: wp(2),
    backgroundColor: COLORS.primaryColor,
    borderRadius: wp(1.5),
    padding: wp(1),
    paddingHorizontal: hp(1.3),
    alignItems: "center",
    justifyContent: "center",
  },
  recipeTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
  },
  recipeTag: {
    backgroundColor: "#1D1D20",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(5),
    borderColor: COLORS.gray3,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  recipeTagText: {
    color: COLORS.white,
    fontSize: hp(1.4),
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
    fontSize: hp(1.4),
    fontFamily: fonts.medium,
  },
  buttonContainer: {
    paddingBottom: hp(4),
    paddingTop: hp(2),
  },
});