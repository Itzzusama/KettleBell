"use client"

import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen"
import fonts from "../../../assets/fonts"
import { GetApiRequest } from "../../../services/api"
import { COLORS } from "../../../utils/COLORS"
import { useToast } from "../../../utils/Toast/toastContext"

export default function ClientRecipeDetail() {
  const navigation = useNavigation()
  const route = useRoute()
  const { t } = useTranslation()
  const toast = useToast()

  // State management
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(false)

  // Get recipe from navigation params or fetch from API
  useEffect(() => {
    const recipeFromParams = route.params?.recipe
    if (recipeFromParams) {
      setRecipe(recipeFromParams)
    } else {
      // If no recipe passed, you might want to fetch it by ID
      const recipeId = route.params?.recipeId
      if (recipeId) {
        fetchRecipeById(recipeId)
      }
    }
  }, [route.params])

  // Fetch recipe by ID if needed
  const fetchRecipeById = async (recipeId) => {
    try {
      setLoading(true)
      const res = await GetApiRequest(`api/recipes/${recipeId}`)

      if (res && res.data) {
        setRecipe(res.data.data || res.data)
      } else {
        toast.showToast({
          type: "error",
          message: "Failed to load recipe details",
          duration: 4000,
        })
        navigation.goBack()
      }
    } catch (error) {
      console.log("Error fetching recipe:", error)
      toast.showToast({
        type: "error",
        message: "Failed to load recipe details",
        duration: 4000,
      })
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get recipe image
  const getRecipeImage = () => {
    if (!recipe) return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&crop=center"

    if (recipe.images && Array.isArray(recipe.images) && recipe.images.length > 0) {
      return recipe.images[0]
    }
    if (recipe.banner) {
      return recipe.banner
    }
    if (recipe.image) {
      return recipe.image
    }
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&crop=center"
  }

  // Helper function to format time
  const formatTime = (time) => {
    if (!time) return "N/A"
    if (typeof time === "number") {
      return `${time} min`
    }
    return time
  }

  // Helper function to format servings
  const formatServings = (servings) => {
    if (!servings) return "N/A"
    if (typeof servings === "number") {
      return `${servings} ${servings === 1 ? "person" : "people"}`
    }
    return servings
  }

  const renderIngredient = (item, index) => (
    <View key={item._id || item.id || index} style={styles.ingredientItem}>
      <View style={styles.bulletPoint} />
      <Text style={styles.ingredientText}>
        <Text style={styles.ingredientAmount}>
          {item.amount || item.quantity || ""} {item.unit || ""}{" "}
        </Text>
        {item.name || item.ingredient || "Unknown ingredient"}
      </Text>
    </View>
  )

  const renderInstruction = (instruction, index) => (
    <View
      key={index}
      style={[styles.instructionItem, index < (recipe?.instructions?.length || 0) - 1 && styles.instructionBorder]}
    >
      <Text style={styles.instructionText}>
        {index + 1}. {typeof instruction === "string" ? instruction : instruction.step || instruction.description || ""}
      </Text>
    </View>
  )

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryColor} />
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Error state - no recipe data
  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={wp(15)} color={COLORS.gray3} />
          <Text style={styles.errorText}>Recipe not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={wp(6)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipe.name || recipe.title || "Recipe Details"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Recipe Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: getRecipeImage() }} style={styles.recipeImage} />
        </View>

        {/* Recipe Info */}
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{recipe.name || recipe.title || "Untitled Recipe"}</Text>
          <Text style={styles.recipeDescription}>
            {recipe.description || "No description available for this recipe."}
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            {/* Prep Time */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={wp(5)} color={COLORS.primaryColor} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t("ClientRecipeDetail.time")}</Text>
                <Text style={styles.infoValue}>{formatTime(recipe.prepTime || recipe.preparationTime)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Cook Time */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="flame-outline" size={wp(5)} color={COLORS.primaryColor} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t("ClientRecipeDetail.cook")}</Text>
                <Text style={styles.infoValue}>{formatTime(recipe.cookTime || recipe.cookingTime)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Servings */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="people-outline" size={wp(5)} color={COLORS.primaryColor} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t("ClientRecipeDetail.serve")}</Text>
                <Text style={styles.infoValue}>{formatServings(recipe.servings || recipe.serves)}</Text>
              </View>
            </View>

            {/* Difficulty Level */}
            {recipe.difficulty && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="bar-chart-outline" size={wp(5)} color={COLORS.primaryColor} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Difficulty</Text>
                    <Text style={styles.infoValue}>{recipe.difficulty}</Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.divider} />
          </View>

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("ClientRecipeDetail.Ingredients")}</Text>
              <View style={styles.divider2} />
              <View style={styles.ingredientsList}>{recipe.ingredients.map(renderIngredient)}</View>
            </View>
          )}

          {/* Nutrition Information */}
          {recipe.nutrition && Object.keys(recipe.nutrition).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("ClientRecipeDetail.nutri")}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: hp(3) }}
                style={styles.nutritionContainer}
              >
                {Object.entries(recipe.nutrition)
                  .filter(([key, value]) => key !== "_id" && key !== "id")
                  .map(([key, value]) => (
                    <View key={key} style={styles.nutritionBox}>
                      <Text style={styles.nutritionValue}>{value}</Text>
                      <Text style={styles.nutritionLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                    </View>
                  ))}
              </ScrollView>
            </View>
          )}

          {/* Instructions */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>{t("ClientRecipeDetail.Instructions")}</Text>
                {recipe.instructions.map(renderInstruction)}
              </View>
            </View>
          )}

          {/* <CustomButton title={t("ClientRecipeDetail.next")} onPress={() => navigation.navigate(RouteName.Meal_plan)} /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
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
    fontSize: wp(6),
    fontWeight: "700",
    marginBottom: hp(1),
    fontFamily: fonts.semiBold,
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
    borderColor: COLORS.lightGray,
  },
  divider2: {
    borderWidth: 0.3,
    borderColor: COLORS.lightGray,
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
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
  },
  section: {
    marginBottom: hp(3),
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
    alignItems: "center",
    marginBottom: hp(1),
  },
  bulletPoint: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: COLORS.primaryColor,
    marginRight: wp(3),
  },
  ingredientText: {
    color: "#CCC",
    fontSize: wp(3.5),
    flex: 1,
    fontFamily: fonts.medium,
  },
  ingredientAmount: {
    color: "#FFF",
    fontWeight: "600",
  },
  nutritionContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    overflow: "scroll",
    padding: wp(4),
    marginTop: hp(1),
  },
  nutritionBox: {
    width: wp(25),
    backgroundColor: "#333335",
    borderRadius: wp(2),
    padding: wp(3),
    marginRight: wp(3),
    alignItems: "center",
  },
  nutritionValue: {
    color: "#FFF",
    fontSize: wp(5),
    fontWeight: "700",
    marginBottom: hp(0.5),
    fontFamily: fonts.medium,
  },
  nutritionLabel: {
    color: "#CCC",
    fontSize: wp(3),
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
    paddingBottom: hp(2),
    fontFamily: fonts.medium,
  },
  instructionItem: {
    marginBottom: hp(1.5),
  },
  instructionBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#E1A104",
    paddingBottom: hp(1.5),
  },
  instructionText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    lineHeight: wp(5),
    fontFamily: fonts.regular,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: hp(1),
  },
  tagItem: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
    marginRight: wp(2),
    marginBottom: hp(1),
  },
  tagText: {
    color: "#000",
    fontSize: wp(3),
    fontFamily: fonts.medium,
  },
  notesText: {
    color: "#CCC",
    fontSize: wp(3.5),
    lineHeight: wp(5),
    fontFamily: fonts.regular,
    marginTop: hp(1),
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
    marginTop: hp(2),
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(10),
  },
  errorText: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontFamily: fonts.medium,
    textAlign: "center",
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  backButtonText: {
    color: COLORS.primaryColor,
    fontSize: wp(4),
    fontFamily: fonts.medium,
  },
})
