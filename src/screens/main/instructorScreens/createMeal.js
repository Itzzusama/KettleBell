"use client";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
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
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import fonts from "../../../assets/fonts";
import CustomButton from "../../../components/CustomButton";
import ExpoImagePicker from "../../../components/imagePicker";
import { GetApiRequest, PostApiRequest, PutApiRequest } from "../../../services/api"; // Added PutApiRequest
import { COLORS } from "../../../utils/COLORS";
import { useToast } from "../../../utils/Toast/toastContext";

export default function CreateMeal() {
  const [mealName, setMealName] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfWeeks, setNumberOfWeeks] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown states
  const [categories, setCategories] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  // Check if in edit mode
  const isEditMode = route.params?.isEditMode || false;
  const recipe = route.params?.recipe || null;

  // Pre-fill form for edit mode
  useEffect(() => {
    if (isEditMode && recipe) {
      setMealName(recipe.name || "");
      setDescription(recipe.description || "");
      setNumberOfWeeks(recipe.numberOfWeeks?.toString() || "");
      setSelectedImage(recipe.banner || recipe.image || null);
      setSelectedCategory(recipe.category?._id || recipe.category || "");
    }
  }, [isEditMode, recipe]);

  // Handle image selection from ExpoImagePicker
  const handleImagePickerSave = (data) => {
    setSelectedImage(data);
  };

  // Fetch meal plan categories
  const fetchCategories = async () => {
    try {
      const response = await GetApiRequest("api/meal-plan-categories/my-categories");
      let categoriesData = [];

      if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response && response.data) {
        if (Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
        }
      }

      if (categoriesData.length > 0) {
        const formattedCategories = categoriesData.map((cat) => ({
          label: cat.name,
          value: cat._id,
        }));
        setCategories(formattedCategories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.log("Error fetching categories:", error);
      Alert.alert("Error", "Failed to load categories");
      setCategories([]);
    }
  };

  // Validate form data
  const validateForm = () => {
    if (!mealName.trim()) {
      Alert.alert("Error", "Meal plan name is required");
      return false;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Description is required");
      return false;
    }

    if (!numberOfWeeks.trim() || isNaN(numberOfWeeks) || Number.parseInt(numberOfWeeks) <= 0) {
      Alert.alert("Error", "Please enter a valid number of weeks");
      return false;
    }

    if (!selectedImage) {
      Alert.alert("Error", "Please select an image for the meal plan");
      return false;
    }

    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return false;
    }

    return true;
  };

  // Handle create or update meal plan
  const handleMealPlan = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting meal plan process...");
      console.log("Uploading image:", selectedImage);

      let bannerUrl = selectedImage;

      if (!bannerUrl || !bannerUrl.startsWith("http")) {
        throw new Error("Invalid image URL");
      }

      const mealPlanData = {
        name: mealName.trim(),
        description: description.trim(),
        category: selectedCategory,
        numberOfWeeks: Number.parseInt(numberOfWeeks),
        banner: bannerUrl,
      };

      console.log("Meal plan data being sent:", mealPlanData);

      let res;
      if (isEditMode) {
        // Update meal plan
        res = await PutApiRequest(`api/meal-plans/${recipe._id || recipe.id}`, mealPlanData);
      } else {
        // Create new meal plan
        res = await PostApiRequest("api/meal-plans", mealPlanData);
      }

      if (res.status === 200 || res.status === 201) {
        toast.showToast({
          message: isEditMode ? "Meal plan updated successfully" : "Meal plan created successfully",
          type: "success",
          duration: 3000,
        });

        // Navigate back or to meal plan detail
        navigation.goBack();
      } else {
        throw new Error("Failed to process meal plan");
      }
    } catch (error) {
      console.error("Meal plan error:", error);
      Alert.alert("Error", error.message || `Failed to ${isEditMode ? "update" : "create"} meal plan`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundColor} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={hp(3)} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? "Edit Meal Plan" : "Add Meal Plan"}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Upload Banner Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Banner</Text>
          <ExpoImagePicker
            onSave={handleImagePickerSave}
            initialImage={selectedImage} // Pass initial image for edit mode
          />
        </View>

        {/* Meal Plan Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("AddMeal.mealname")}</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Meal Plan Name"
            placeholderTextColor={COLORS.gray2}
            value={mealName}
            onChangeText={setMealName}
          />
        </View>

        {/* Category Dropdown */}
        <View style={[styles.section, { zIndex: 2000 }]}>
          <Text style={styles.sectionTitle}>Category</Text>
          <DropDownPicker
            open={categoryOpen}
            value={selectedCategory}
            items={categories}
            setOpen={setCategoryOpen}
            setValue={setSelectedCategory}
            setItems={setCategories}
            placeholder="Select category"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            placeholderStyle={styles.dropdownPlaceholder}
            arrowIconStyle={styles.dropdownArrow}
            tickIconStyle={styles.dropdownTick}
            zIndex={2000}
            zIndexInverse={1000}
            loading={categories.length === 0}
            ActivityIndicatorComponent={() => <Text style={styles.dropdownText}>Loading categories...</Text>}
          />
        </View>

        {/* Number of Weeks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of weeks</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Number of weeks"
            placeholderTextColor={COLORS.gray2}
            value={numberOfWeeks}
            onChangeText={setNumberOfWeeks}
            keyboardType="numeric"
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

        {/* Create/Update Button */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title={isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Meal Plan" : "Create Meal Plan")}
            onPress={handleMealPlan}
            disabled={isLoading}
            loading={isLoading}
          />
        </View>
      </ScrollView>
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
    marginBottom: hp(3),
    marginTop: hp(2),
  },
  sectionTitle: {
    fontSize: hp(1.7),
    fontFamily: fonts.regular,
    color: COLORS.white,
    marginBottom: hp(1),
  },
  textInput: {
    backgroundColor: "#1D1D20",
    borderRadius: wp(2),
    color: COLORS.white,
    fontSize: hp(1.7),
    fontFamily: fonts.regular,
    borderWidth: 0.5,
    borderColor: COLORS.gray3,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  textArea: {
    height: hp(12),
    paddingTop: hp(1.8),
    textAlignVertical: "top",
  },
  dropdown: {
    backgroundColor: "#1D1D20",
    borderColor: COLORS.gray3,
    borderWidth: 0.5,
    borderRadius: wp(2),
    minHeight: hp(6),
  },
  dropdownContainer: {
    backgroundColor: "#1D1D20",
    borderColor: COLORS.gray3,
    borderWidth: 0.5,
    borderRadius: wp(2),
    maxHeight: hp(25),
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
    tintColor: COLORS.white,
  },
  dropdownTick: {
    tintColor: COLORS.primaryColor,
  },
  buttonContainer: {
    paddingBottom: hp(4),
    paddingTop: hp(2),
  },
});