import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import fonts from "../../assets/fonts";
import CustomButton from "../../components/CustomButton";
import { COLORS } from "../../utils/COLORS";

export default function RecipeDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Add your refresh logic here
    setRefreshing(false);
  }, []);

  // Get the recipe ID from route params
  const { recipeId } = route.params || {};

  // Get the recipe from Redux store
  const recipe = useSelector((state) =>
    state.recipes.recipes.find((r) => r.id === recipeId)
  );
  console.log("Current recipe:=================>", recipe);

  // Format recipe data with fallbacks
  const recipeData = recipe
    ? {
        title: recipe.originalData?.name || recipe.title || "",
        description: recipe.originalData?.description || recipe.client || "",
        image:
          recipe.banner ||
          recipe.image ||
          "https://via.placeholder.com/400x300?text=No+Image",
        preTime: recipe.originalData?.prepTime
          ? `${recipe.originalData.prepTime} min`
          : t("RecipeDetail.pre_time_value"),
        cookTime: recipe.originalData?.cookTime
          ? `${recipe.originalData.cookTime} min`
          : t("RecipeDetail.cook_time_value"),
        serving: recipe.originalData?.servings
          ? `${recipe.originalData.servings} servings`
          : t("RecipeDetail.serving_value"),
        ingredients: recipe.ingredients || [],
        nutrition: recipe.nutrition || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
        instructions: recipe.instructions || [],
        category: recipe.originalData?.category?.name || recipe.tag || "",
      }
    : null;

  // Show loading if recipe is not loaded yet
  if (!recipeData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryColor} />
      </View>
    );
  }

  const renderIngredient = (item) => (
    <View key={item._id || item.id} style={styles.ingredientItem}>
      <View style={styles.bulletPoint} />
      <View style={styles.ingredientContent}>
        {item.quantity && (
          <Text style={styles.ingredientAmount}>Quantity: {item.quantity}</Text>
        )}
        {item.unit && (
          <Text style={styles.ingredientUnit}>Unit: {item.unit}</Text>
        )}
        <Text style={styles.ingredientName}>{item.name}</Text>
      </View>
    </View>
  );

  const renderInstruction = (item, index) => (
    <View key={index} style={styles.instructionStep}>
      <Text style={styles.stepNumber}>{index + 1}.</Text>
      <Text style={styles.instructionText}>
        {typeof item === "string" ? item : item.text || ""}
      </Text>
    </View>
  );

  const renderNutritionItem = (label, value) => (
    <View style={styles.nutritionItem}>
      <Text style={styles.nutritionValue}>{value || "0"}</Text>
      <Text style={styles.nutritionLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={wp(6)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recipe Detail</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primaryColor]}
            tintColor={COLORS.primaryColor}
          />
        }
      >
        {/* Recipe Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipeData.image }}
            style={styles.recipeImage}
          />
        </View>

        {/* Recipe Info */}
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{recipeData.title}</Text>
          <Text style={styles.recipeDescription}>{recipeData.description}</Text>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="time-outline"
                  size={wp(5)}
                  color={COLORS.primaryColor}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  {t("RecipeDetail.pre_time_label")}
                </Text>
                <Text style={styles.infoValue}>{recipeData.preTime}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="time-outline"
                  size={wp(5)}
                  color={COLORS.primaryColor}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  {t("RecipeDetail.cook_time_label")}
                </Text>
                <Text style={styles.infoValue}>{recipeData.cookTime}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="people-outline"
                  size={wp(5)}
                  color={COLORS.primaryColor}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  {t("RecipeDetail.serving_label")}
                </Text>
                <Text style={styles.infoValue}>{recipeData.serving}</Text>
              </View>
            </View>
            <View style={styles.divider} />
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("RecipeDetail.ingredients_title")}
            </Text>
            <View style={styles.divider2} />

            <View style={styles.ingredientsList}>
              {recipeData.ingredients.map(renderIngredient)}
            </View>
          </View>

          {/* Nutrition Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("RecipeDetail.nutrition_title")}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: hp(3) }}
              style={styles.nutritionContainer}
            >
              {Object.entries(recipeData.nutrition)
                .filter(([key]) => key.toLowerCase() !== "_id")
                .map(([key, value]) =>
                  renderNutritionItem(
                    key.charAt(0).toUpperCase() + key.slice(1),
                    value
                  )
                )}
            </ScrollView>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>
                {t("RecipeDetail.instructions_title")}
              </Text>
              {recipeData.instructions.map(renderInstruction)}
            </View>
          </View>

          <CustomButton
            title={t("RecipeDetail.next_button")}
            // onPress={() => navigation.navigate(RouteName.Recipe_Time)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
  },
  container: {
    flex: 1,
    backgroundColor: "#1F1F21",
    paddingTop: hp(6),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingTop: Platform.OS === "ios" ? hp(1) : hp(2),
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    color: "#FFF",
    fontSize: hp(2.3),
    textAlign: "center",
    flex: 1,
    fontFamily: fonts.medium,
  },
  placeholder: {
    width: wp(10),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(5),
  },
  imageContainer: {
    width: "100%",
    height: hp(30),
    paddingHorizontal: wp(4),
  },
  recipeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 14,
  },
  recipeInfo: {
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
  },
  recipeTitle: {
    color: "#FFF",
    fontSize: wp(5),
    marginBottom: hp(1),
    fontFamily: fonts.medium,
  },
  recipeDescription: {
    color: "#CCC",
    fontSize: wp(3.5),
    lineHeight: wp(5),
    marginBottom: hp(3),
    fontFamily: fonts.regular,
  },
  divider: {
    borderWidth: 0.3,
    borderColor: COLORS.gray3,
  },
  divider2: {
    borderWidth: 0.3,
    borderColor: COLORS.gray3,
    marginBottom: hp(2),
  },
  infoSection: {
    marginBottom: hp(3),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp(1),
  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: wp(2),
  },
  infoLabel: {
    color: "#FFF",
    fontSize: wp(3),
    fontFamily: fonts.regular,
  },
  infoValue: {
    color: "#CCC",
    fontSize: wp(3.2),
    fontFamily: fonts.regular,
  },
  section: {
    marginBottom: hp(3),
    fontFamily: fonts.regular,
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: wp(5),
    marginBottom: hp(1.3),
    fontFamily: fonts.medium,
  },
  ingredientsList: {
    marginLeft: wp(2),
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp(2),
    width: "100%",
  },
  ingredientContent: {
    flex: 1,
    marginLeft: wp(3),
  },
  bulletPoint: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
    backgroundColor: COLORS.primaryColor,
    marginRight: wp(3),
  },
  ingredientAmount: {
    color: COLORS.primaryColor,
    fontSize: wp(3.5),
    marginBottom: 2,
    fontFamily: fonts.medium,
  },
  ingredientUnit: {
    color: "#AAA",
    fontSize: wp(3.3),
    marginBottom: 2,
    fontFamily: fonts.regular,
  },
  ingredientName: {
    color: "#FFF",
    fontSize: wp(3.8),
    fontFamily: fonts.semiBold,
  },
  nutritionContainer: {
    flexDirection: "row",
    flexWrap: "nowrap", // Prevent wrapping
    overflow: "scroll", // Enable horizontal scrolling
    padding: wp(4),
    marginTop: hp(1),
  },
  nutritionItem: {
    backgroundColor: "#2A2A2D",
    borderRadius: wp(2),
    padding: wp(3),
    alignItems: "center",
    marginRight: wp(3),
    minWidth: wp(20),
  },
  nutritionValue: {
    color: COLORS.primaryColor,
    fontSize: wp(4.5),
    fontFamily: fonts.semiBold,
    marginBottom: wp(1),
  },
  nutritionLabel: {
    color: "#AAA",
    fontSize: wp(3.2),
    fontFamily: fonts.regular,
  },
  instructionsContainer: {
    backgroundColor: "#FEC635",
    borderRadius: wp(3),
    padding: wp(4),
  },
  instructionsTitle: {
    color: COLORS.white,
    fontSize: wp(4.5),
    paddingBottom: hp(1),
    fontFamily: fonts.medium,
  },
  instructionItem: {
    marginBottom: hp(1.5),
  },
  instructionStep: {
    flexDirection: "row",
    marginBottom: hp(1.5),
    paddingBottom: hp(1.5),
  },
  stepNumber: {
    color: COLORS.white,
    fontFamily: fonts.bold,
    marginRight: wp(2),
    fontSize: wp(4),
  },
  instructionText: {
    color: COLORS.white,
    fontSize: wp(3.8),
    fontFamily: fonts.regular,
    flex: 1,
  },
});
