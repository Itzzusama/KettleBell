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
import { GetApiRequest, PostApiRequest, PutApiRequest } from "../../../services/api";
import { COLORS } from "../../../utils/COLORS";
import { useToast } from "../../../utils/Toast/toastContext";

export default function AddRecipes() {
  const { t } = useTranslation();
  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [preTime, setPreTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState([{ quantity: "", unit: "", name: "" }]);
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [steps, setSteps] = useState([]);
  const [instruction, setInstruction] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Dropdown states
  const [categories, setCategories] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  // Check if in edit mode
  const isEditMode = route.params?.isEditMode || false;
  const recipe = route.params?.recipe || null;

  // Pre-fill form for edit mode
  useEffect(() => {
    if (isEditMode && recipe) {
      setRecipeName(recipe.name || "");
      setDescription(recipe.description || "");
      setPreTime(recipe.prepTime?.toString() || "");
      setCookTime(recipe.cookTime?.toString() || "");
      setServings(recipe.servings?.toString() || "");
      setIngredients(
        recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0
          ? recipe.ingredients
          : [{ quantity: "", unit: "", name: "" }]
      );
      setCalories(recipe.näutrition?.calories?.toString() || "");
      setProtein(recipe.nutrition?.protein?.toString() || "");
      setCarbs(recipe.nutrition?.carbs?.toString() || "");
      setFat(recipe.nutrition?.fat?.toString() || "");
      setTags(recipe.tags && Array.isArray(recipe.tags) ? recipe.tags : []);
      setSteps(recipe.instructions && Array.isArray(recipe.instructions) ? recipe.instructions : []);
      setSelectedImage(recipe.banner);
      setSelectedCategory(recipe.category?._id || recipe.category || "");
    }
  }, [isEditMode, recipe]);

  const addIngredient = () => {
    setIngredients([...ingredients, { quantity: "", unit: "", name: "" }]);
  };

  const updateIngredient = (index, field, value) => {
    const updated = ingredients.map((ingredient, i) =>
      i === index ? { ...ingredient, [field]: value } : ingredient
    );
    setIngredients(updated);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addStep = () => {
    if (instruction.trim()) {
      setSteps((prevSteps) => [...prevSteps.filter((step) => step.trim()), instruction.trim()]);
      setInstruction("");
    }
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  // Handle image selection from ExpoImagePicker
  const handleImageSelected = (imageUri) => {
    console.log("Image selected:", imageUri);
    setSelectedImage(imageUri);
  };
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await GetApiRequest("api/recipe-categories/my-categories");
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
      Alert.alert("Error", "Failed to load categories");
      setCategories([]);
    }
  };

  // Validate form data
  const validateForm = () => {
    if (!recipeName.trim()) {
      Alert.alert("Error", "Recipe name is required");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Description is required");
      return false;
    }
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image for the recipe");
      return false;
    }
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return false;
    }
    const validSteps = steps.filter((step) => step.trim());
    if (validSteps.length === 0) {
      Alert.alert("Error", "Please add at least one instruction step");
      return false;
    }
    return true;
  };

  // Create or update recipe function
  const handleRecipe = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting recipe process...");
      console.log("Image:", selectedImage);
      let bannerUrl = selectedImage;

      if (!bannerUrl || !bannerUrl.startsWith("http")) {
        throw new Error("Invalid image URL");
      }

      const formattedIngredients = ingredients
        .filter((ingredient) => ingredient.name.trim() !== "")
        .map((ingredient) => ({
          quantity: Number.parseFloat(ingredient.quantity) || 0,
          unit: ingredient.unit,
          name: ingredient.name,
        }));

      const validSteps = steps.filter((step) => step.trim());

      const nutrition = {
        calories: Number.parseInt(calories) || 0,
        protein: Number.parseFloat(protein) || 0,
        carbs: Number.parseFloat(carbs) || 0,
        fat: Number.parseFloat(fat) || 0,
      };

      const recipeData = {
        name: recipeName,
        description: description,
        category: selectedCategory,
        banner: bannerUrl,
        prepTime: Number.parseInt(preTime) || 0,
        cookTime: Number.parseInt(cookTime) || 0,
        servings: Number.parseInt(servings) || 1,
        ingredients: formattedIngredients,
        nutrition: nutrition,
        tags: tags.filter((tag) => tag.trim() !== ""),
        instructions: validSteps,
      };

      console.log("Recipe data being sent:", recipeData);
      let res;
      if (isEditMode) {
        // Update recipe
        res = await PutApiRequest(`api/recipes/${recipe._id || recipe.id}`, recipeData);
      } else {
        // Create new recipe
        res = await PostApiRequest("api/recipes", recipeData);
      }

      if (res.status === 200 || res.status === 201) {
        toast.showToast({
          message: isEditMode ? "Recipe updated successfully" : "Recipe created successfully",
          type: "success",
          duration: 3000,
        });
        // Navigate back to ClientRecipe or to detail
        navigation.goBack();
      } else {
        throw new Error("Failed to process recipe");
      }
    } catch (error) {
      console.error("Recipe error:", error);
      Alert.alert("Error", error.message || `Failed to ${isEditMode ? "update" : "create"} recipe`);
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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={hp(3)} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? t("EditRecipe.title") : t("AddRecipe.title")}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Banner Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("AddRecipe.dec1")}</Text>
          <ExpoImagePicker onSave={handleImageSelected} initialImage={selectedImage} />
        </View>

        {/* Recipe Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("AddRecipe.desc2")}</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Name"
            placeholderTextColor={COLORS.gray2}
            value={recipeName}
            onChangeText={setRecipeName}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("AddRecipe.desc3")}</Text>
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

        {/* Pre Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("AddRecipe.pretime")}</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0"
            placeholderTextColor={COLORS.gray2}
            value={preTime}
            onChangeText={setPreTime}
            keyboardType="numeric"
          />
        </View>

        {/* Cook Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("AddRecipe.cook")}</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0"
            placeholderTextColor={COLORS.gray2}
            value={cookTime}
            onChangeText={setCookTime}
            keyboardType="numeric"
          />
        </View>

        {/* Servings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("AddRecipe.serve")}</Text>
          <TextInput
            style={styles.textInput}
            placeholder="1"
            placeholderTextColor={COLORS.gray2}
            value={servings}
            onChangeText={setServings}
            keyboardType="numeric"
          />
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("AddRecipe.ingredients")}</Text>
            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
              <Text style={styles.addButtonText}>{t("AddRecipe.addbtn")}</Text>
            </TouchableOpacity>
          </View>
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <TextInput
                style={[styles.textInput, styles.ingredientInput]}
                placeholder="0"
                placeholderTextColor={COLORS.gray2}
                value={ingredient.quantity}
                onChangeText={(value) => updateIngredient(index, "quantity", value)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.textInput, styles.ingredientInput]}
                placeholder="Unit"
                placeholderTextColor={COLORS.gray2}
                value={ingredient.unit}
                onChangeText={(value) => updateIngredient(index, "unit", value)}
              />
              <TextInput
                style={[styles.textInput, styles.ingredientInputLarge]}
                placeholder="Ingredient Name"
                placeholderTextColor={COLORS.gray2}
                value={ingredient.name}
                onChangeText={(value) => updateIngredient(index, "name", value)}
              />
            </View>
          ))}
        </View>

        {/* Nutrition Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("AddRecipe.info")}</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>{t("AddRecipe.cal")}</Text>
                <TextInput
                  style={[styles.textInput, styles.nutritionInput]}
                  placeholder="0"
                  placeholderTextColor={COLORS.gray2}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>{t("AddRecipe.protein")} (g)</Text>
                <TextInput
                  style={[styles.textInput, styles.nutritionInput]}
                  placeholder="0"
                  placeholderTextColor={COLORS.gray2}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>{t("AddRecipe.carb")} (g)</Text>
                <TextInput
                  style={[styles.textInput, styles.nutritionInput]}
                  placeholder="0"
                  placeholderTextColor={COLORS.gray2}
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>{t("AddRecipe.fat")} (g)</Text>
                <TextInput
                  style={[styles.textInput, styles.nutritionInput]}
                  placeholder="0"
                  placeholderTextColor={COLORS.gray2}
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("AddRecipe.tags")}</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.textInput, styles.tagInput]}
              placeholder="Add tag"
              placeholderTextColor={COLORS.gray2}
              value={newTag}
              onChangeText={setNewTag}
            />
            <TouchableOpacity style={styles.tagAddButton} onPress={addTag}>
              <Text style={{ color: COLORS.white }}>{t("AddRecipe.addbtn")}</Text>
            </TouchableOpacity>
          </View>
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <TouchableOpacity key={index} style={styles.tag} onPress={() => removeTag(tag)}>
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Instruction Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("AddRecipe.instruction")}</Text>
          <Text style={styles.instructionSubtitle}>{t("AddRecipe.description")}</Text>

          {/* Display existing steps */}
          {steps
            .filter((step) => step.trim())
            .map((step, index) => (
              <View key={index} style={styles.stepContainer}>
                <Text style={styles.stepNumber}>{index + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
                <TouchableOpacity onPress={() => removeStep(index)} style={styles.removeStepButton}>
                  <Ionicons name="close" size={16} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}

          {/* Input for new step */}
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

          {/* Add step button */}
          <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
            <Text style={styles.addStepButtonText}>{t("AddRecipe.addstep")}</Text>
          </TouchableOpacity>
        </View>

        {/* Create/Update Recipe Button */}
        <View style={styles.createButton}>
          <CustomButton
            title={isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Edit Recipe" : "Add Recipe")}
            onPress={handleRecipe}
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
    marginTop: hp(2),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1.5),
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
  ingredientRow: {
    flexDirection: "row",
    gap: wp(2),
    marginBottom: hp(1.5),
  },
  ingredientInput: {
    flex: 1,
  },
  ingredientInputLarge: {
    flex: 2,
  },
  nutritionGrid: {
    flexDirection: "column",
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: wp(4),
    marginBottom: hp(2),
  },
  nutritionItem: {
    flex: 1,
  },
  nutritionInput: {
    flex: 1,
  },
  nutritionLabel: {
    fontSize: hp(1.4),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    marginBottom: hp(0.8),
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.darkGray,
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.gray3,
    marginBottom: hp(2),
    position: "relative",
  },
  tagInput: {
    flex: 1,
    paddingRight: wp(10),
  },
  tagAddButton: {
    position: "absolute",
    right: wp(2),
    backgroundColor: COLORS.primaryColor,
    borderRadius: 7,
    padding: wp(1.5),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: hp(2),
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
  },
  tag: {
    backgroundColor: COLORS.darkGray,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(5),
    borderColor: COLORS.gray3,
    borderWidth: 1,
  },
  tagText: {
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
  addButton: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.7),
    borderRadius: wp(1.5),
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: hp(1.4),
    fontFamily: fonts.medium,
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
  createButton: {
    paddingVertical: hp(2),
  },
});