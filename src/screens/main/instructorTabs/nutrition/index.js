"use client"

import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen"
import fonts from "../../../../assets/fonts"
import RouteName from "../../../../navigation/RouteName"
import { DeleteApiRequest, GetApiRequest, PostApiRequest, PutApiRequest } from "../../../../services/api"
import { COLORS } from "../../../../utils/COLORS"
import { useToast } from "../../../../utils/Toast/toastContext"

export default function InstructorNutrition() {
  const navigation = useNavigation()

  // Recipe Categories State
  const [recipeCategoriesState, setRecipeCategoriesState] = useState([])
  const [selectedRecipeCategory, setSelectedRecipeCategory] = useState("All")
  const [categoryModal, setCategoryModal] = useState("")
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [newRecipeCategoryName, setNewRecipeCategoryName] = useState("")
  const [editingRecipeCategory, setEditingRecipeCategory] = useState(null)

  // Meal Plan Categories State
  const [mealPlanCategoriesState, setMealPlanCategoriesState] = useState([])
  const [selectedMealPlanCategory, setSelectedMealPlanCategory] = useState("All")
  const [newMealPlanCategoryName, setNewMealPlanCategoryName] = useState("")
  const [editingMealPlanCategory, setEditingMealPlanCategory] = useState(null)

  const [recipes, setRecipes] = useState([])
  const [mealPlans, setMealPlans] = useState([])
  const [recipeLoading, setRecipeLoading] = useState(false)
  const [mealPlanLoading, setMealPlanLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Loading states for operations
  const [isDeletingRecipeCategory, setIsDeletingRecipeCategory] = useState(false)
  const [isDeletingMealPlanCategory, setIsDeletingMealPlanCategory] = useState(false)

  const { t } = useTranslation()
  const toast = useToast()

  // Recipe Category Functions
  const handleAddRecipeCategory = () => {
    if (categoryName.trim()) {
      switch (categoryModal) {
        case "add-recipe-category":
          createRecipeCategory()
          break;
        case "edit-recipe-category":
          updateRecipeCategory()
          break;
        case "add-meal-plan-category":
          createMealPlanCategory()
          break;
        case "edit-meal-plan-category":
          updateMealPlanCategory()
          break;

        default:
          break;
      }

    }
  }

  const handleDeleteRecipeCategory = (category) => {
    if (category.name === "All") {
      toast.showToast({
        type: "error",
        message: "You cannot delete the 'All' category",
        duration: 4000,
      })
      return
    }

    Alert.alert("Delete Recipe Category", "Are you sure you want to delete this recipe category?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteRecipeCategory(category._id || category.id),
      },
    ])
  }

  const handleRecipeCategorySelect = async (category) => {
    setRecipeCategoriesState(
      recipeCategoriesState.map((cat) => ({
        ...cat,
        active: cat.name === category.name,
      })),
    )
    setSelectedRecipeCategory(category.name)

    if (category.name !== "All" && category._id !== "all") {
      await getCategoryRecipes(category._id || category.id)
    } else {
      await getRecipes()
    }
  }

  const openEditRecipeCategoryModal = (category) => {
    setEditingRecipeCategory(category)
    setCategoryName(category.name)
    setCategoryModal("edit-recipe-category")
  }

  const handleDeleteMealPlanCategory = (category) => {
    if (category.name === "All") {
      toast.showToast({
        type: "error",
        message: "You cannot delete the 'All' category",
        duration: 4000,
      })
      return
    }

    Alert.alert("Delete Meal Plan Category", "Are you sure you want to delete this meal plan category?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMealPlanCategory(category._id || category.id),
      },
    ])
  }

  const handleMealPlanCategorySelect = async (category) => {
    setMealPlanCategoriesState(
      mealPlanCategoriesState.map((cat) => ({
        ...cat,
        active: cat.name === category.name,
      })),
    )
    setSelectedMealPlanCategory(category.name)

    if (category.name !== "All" && category._id !== "all") {
      await getCategoryMealPlans(category._id || category.id)
    } else {
      await getMealPlans()
    }
  }

  const openEditMealPlanCategoryModal = (category) => {
    setEditingMealPlanCategory(category)
    setCategoryName(category.name)
    setCategoryModal("edit-meal-plan-category")
  }

  // API Functions
  const getRecipeCategories = async () => {
    try {
      const res = await GetApiRequest("api/recipe-categories/my-categories")
      let categories = []

      if (res && res.data) {
        if (Array.isArray(res.data)) {
          categories = res.data
        } else if (res.data.data && Array.isArray(res.data.data)) {
          categories = res.data.data
        } else if (Array.isArray(res)) {
          categories = res
        }
      }

      if (categories.length > 0) {
        const fetchedCategories = categories.map((cat) => ({
          ...cat,
          id: cat._id || cat.id,
          active: false,
        }))
        setRecipeCategoriesState([{ id: "all", name: "All", active: true }, ...fetchedCategories])
      } else {
        setRecipeCategoriesState([{ id: "all", name: "All", active: true }])
      }
    } catch (error) {
      console.log("Error fetching recipe categories:", error)
      setRecipeCategoriesState([{ id: "all", name: "All", active: true }])
      toast.showToast({
        type: "error",
        message: "Failed to load recipe categories",
        duration: 4000,
      })
    }
  }

  const getCategoryRecipes = async (categoryId) => {
    try {
      setRecipeLoading(true)
      const res = await GetApiRequest(`api/recipe-categories/${categoryId}`)

      if (res && res.data && res.data.data) {
        if (res.data.data.recipes) {
          setRecipes(res.data.data.recipes)
        } else {
          setRecipes([])
        }
      } else {
        setRecipes([])
      }
    } catch (error) {
      console.log("Error fetching category recipes:", error)
      toast.showToast({
        type: "error",
        message: "Failed to load category recipes",
        duration: 4000,
      })
      setRecipes([])
    } finally {
      setRecipeLoading(false)
    }
  }

  const createRecipeCategory = async () => {
    try {
      setCategoryLoading(true)
      const res = await PostApiRequest("api/recipe-categories", {
        name: categoryName.trim(),
      })

      if (res && res.data) {
        await getRecipeCategories()
        setCategoryModal("")
        setCategoryName("")
        toast.showToast({
          type: "success",
          message: "Recipe category created successfully",
          duration: 4000,
        })
      }
    } catch (error) {
      console.log(error)
      toast.showToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to create recipe category",
        duration: 4000,
      })
    } finally {
      setCategoryLoading(false)
    }
  }

  const updateRecipeCategory = async () => {
    try {
      setCategoryLoading(true)
      const categoryId = editingRecipeCategory._id || editingRecipeCategory.id
      const res = await PutApiRequest(`api/recipe-categories/${categoryId}`, {
        name: categoryName.trim(),
      })

      if (res && res.data) {
        await getRecipeCategories()
        setCategoryModal("")
        setCategoryName("")
        setEditingRecipeCategory(null)
        toast.showToast({
          type: "success",
          message: "Recipe category updated successfully",
          duration: 4000,
        })
      }
    } catch (error) {
      console.log(error)
      toast.showToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to update recipe category",
        duration: 4000,
      })
    } finally {
      setCategoryLoading(false)
    }
  }

  const deleteRecipeCategory = async (categoryId) => {
    try {
      setIsDeletingRecipeCategory(true)
      const res = await DeleteApiRequest(`api/recipe-categories/${categoryId}`)

      if (res) {
        await getRecipeCategories()
        if (selectedRecipeCategory === recipeCategoriesState.find((cat) => (cat._id || cat.id) === categoryId)?.name) {
          setSelectedRecipeCategory("All")
          await getRecipes()
        }
        toast.showToast({
          type: "success",
          message: "Recipe category deleted successfully",
          duration: 4000,
        })
      }
    } catch (error) {
      console.log(error)
      toast.showToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to delete recipe category",
        duration: 4000,
      })
    } finally {
      setIsDeletingRecipeCategory(false)
    }
  }

  const getMealPlanCategories = async () => {
    try {
      const res = await GetApiRequest("api/meal-plan-categories/my-categories")
      let categories = []

      if (res && res.data) {
        if (Array.isArray(res.data)) {
          categories = res.data
        } else if (res.data.data && Array.isArray(res.data.data)) {
          categories = res.data.data
        } else if (Array.isArray(res)) {
          categories = res
        }
      }

      if (categories.length > 0) {
        const fetchedCategories = categories.map((cat) => ({
          ...cat,
          id: cat._id || cat.id,
          active: false,
          name: cat.name || "Unnamed Category"
        }))
        setMealPlanCategoriesState([{ id: "all", name: "All", active: true }, ...fetchedCategories])
      } else {
        setMealPlanCategoriesState([{ id: "all", name: "All", active: true }])
      }
    } catch (error) {
      console.log("Error fetching meal plan categories:", error)
      setMealPlanCategoriesState([{ id: "all", name: "All", active: true }])
      toast.showToast({
        type: "error",
        message: "Failed to load meal plan categories",
        duration: 4000,
      })
    }
  }

  const getCategoryMealPlans = async (categoryId) => {
    try {
      setMealPlanLoading(true)
      const res = await GetApiRequest(`api/meal-plan-categories/${categoryId}`)

      if (res && res.data && res.data.data && res.data.data.mealPlans) {
        setMealPlans(res.data.data.mealPlans)
      } else {
        setMealPlans([])
      }
    } catch (error) {
      console.log("Error fetching category meal plans:", error)
      toast.showToast({
        type: "error",
        message: "Failed to load category meal plans",
        duration: 4000,
      })
      setMealPlans([])
    } finally {
      setMealPlanLoading(false)
    }
  }

  const createMealPlanCategory = async () => {
    try {
      setCategoryLoading(true)
      const res = await PostApiRequest("api/meal-plan-categories", {
        name: categoryName.trim(),
      })

      if (res && res.data) {
        await getMealPlanCategories()
        setCategoryModal("")
        setCategoryName("")
        toast.showToast({
          type: "success",
          message: "Meal plan category created successfully",
          duration: 4000,
        })
      }
    } catch (error) {
      console.log(error)
      toast.showToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to create meal plan category",
        duration: 4000,
      })
    } finally {
      setCategoryLoading(false)
    }
  }

  const updateMealPlanCategory = async () => {
    try {
      setCategoryLoading(true)
      const categoryId = editingMealPlanCategory._id || editingMealPlanCategory.id
      const res = await PutApiRequest(`api/meal-plan-categories/${categoryId}`, {
        name: categoryName.trim(),
      })

      if (res && res.data) {
        await getMealPlanCategories()
        setCategoryModal("")
        setCategoryName("")
        setEditingMealPlanCategory(null)
        toast.showToast({
          type: "success",
          message: "Meal plan category updated successfully",
          duration: 4000,
        })
      }
    } catch (error) {
      console.log(error)
      toast.showToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to update meal plan category",
        duration: 4000,
      })
    } finally {
      setCategoryLoading(false)
    }
  }

  const deleteMealPlanCategory = async (categoryId) => {
    try {
      setIsDeletingMealPlanCategory(true)
      const res = await DeleteApiRequest(`api/meal-plan-categories/${categoryId}`)

      if (res) {
        await getMealPlanCategories()
        if (
          selectedMealPlanCategory === mealPlanCategoriesState.find((cat) => (cat._id || cat.id) === categoryId)?.name
        ) {
          setSelectedMealPlanCategory("All")
          await getMealPlans()
        }
        toast.showToast({
          type: "success",
          message: "Meal plan category deleted successfully",
          duration: 4000,
        })
      }
    } catch (error) {
      console.log(error)
      toast.showToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to delete meal plan category",
        duration: 4000,
      })
    } finally {
      setIsDeletingMealPlanCategory(false)
    }
  }

  const getRecipes = async () => {
    try {
      setRecipeLoading(true)
      const res = await GetApiRequest("api/recipes/my-recipes")

      if (res && res.data && Array.isArray(res.data)) {
        setRecipes(res.data)
      } else if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
        setRecipes(res.data.data)
      } else {
        setRecipes([])
      }
    } catch (error) {
      console.log(error)
      setRecipes([])
      toast.showToast({
        type: "error",
        message: "Failed to load recipes",
        duration: 4000,
      })
    } finally {
      setRecipeLoading(false)
    }
  }

  const getMealPlans = async () => {
    try {
      setMealPlanLoading(true)
      const res = await GetApiRequest("api/meal-plans/my-meal-plans")

      if (res && res.data && Array.isArray(res.data)) {
        setMealPlans(res.data)
      } else if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
        setMealPlans(res.data.data)
      } else if (res && Array.isArray(res)) {
        setMealPlans(res)
      } else {
        setMealPlans([])
      }
    } catch (error) {
      console.log("Error fetching meal plans:", error)
      setMealPlans([])
      toast.showToast({
        type: "error",
        message: "Failed to load meal plans",
        duration: 4000,
      })
    } finally {
      setMealPlanLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([getRecipeCategories(), getMealPlanCategories(), getRecipes(), getMealPlans()])
    } catch (error) {
      console.log(error)
      toast.showToast({
        type: "error",
        message: "Failed to refresh data",
        duration: 4000,
      })
    } finally {
      setRefreshing(false)
    }
  }

  // Category Components
  const RecipeCategories = () => (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={[styles.categoryActionButton, styles.editActionButton]}
            onPress={() => {
              const activeCategory = recipeCategoriesState.find((cat) => cat.active)
              if (activeCategory && activeCategory.name !== "All") {
                openEditRecipeCategoryModal(activeCategory)
              } else {
                Alert.alert("Error", "Please select a recipe category to edit")
              }
            }}
          >
            <Ionicons name="create-outline" size={wp(3.5)} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryActionButton, styles.deleteActionButton]}
            onPress={() => {
              const activeCategory = recipeCategoriesState.find((cat) => cat.active)
              if (activeCategory && activeCategory.name !== "All") {
                handleDeleteRecipeCategory(activeCategory)
              } else {
                Alert.alert("Error", "Please select a recipe category to delete")
              }
            }}
            disabled={isDeletingRecipeCategory}
          >
            {isDeletingRecipeCategory ? (
              <ActivityIndicator size={wp(3.5)} color={COLORS.white} />
            ) : (
              <Ionicons name="trash-outline" size={wp(3.5)} color={COLORS.white} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primaryColor,
              borderRadius: 7,
              paddingVertical: wp(1.3),
              paddingHorizontal: wp(3),
            }}
            onPress={() => setCategoryModal("add-recipe-category")}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: wp(3),
                fontFamily: fonts.medium,
              }}
            >
              + Add Category
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {recipeCategoriesState.length > 0 ? (
        <FlatList
          data={recipeCategoriesState}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterTab, item.active && styles.filterTabActive]}
              onPress={() => handleRecipeCategorySelect(item)}
            >
              <Text style={[styles.filterText, item.active && styles.filterTextActive]}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => (item._id || item.id).toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primaryColor} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      )}
    </View>
  )

  const MealPlanCategories = () => (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={[styles.categoryActionButton, styles.editActionButton]}
            onPress={() => {
              const activeCategory = mealPlanCategoriesState.find((cat) => cat.active)
              if (activeCategory && activeCategory.name !== "All") {
                openEditMealPlanCategoryModal(activeCategory)
              } else {
                Alert.alert("Error", "Please select a meal plan category to edit")
              }
            }}
          >
            <Ionicons name="create-outline" size={wp(3.5)} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryActionButton, styles.deleteActionButton]}
            onPress={() => {
              const activeCategory = mealPlanCategoriesState.find((cat) => cat.active)
              if (activeCategory && activeCategory.name !== "All") {
                handleDeleteMealPlanCategory(activeCategory)
              } else {
                Alert.alert("Error", "Please select a meal plan category to delete")
              }
            }}
            disabled={isDeletingMealPlanCategory}
          >
            {isDeletingMealPlanCategory ? (
              <ActivityIndicator size={wp(3.5)} color={COLORS.white} />
            ) : (
              <Ionicons name="trash-outline" size={wp(3.5)} color={COLORS.white} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primaryColor,
              borderRadius: 7,
              paddingVertical: wp(1.3),
              paddingHorizontal: wp(3),
            }}
            onPress={() => setCategoryModal("add-meal-plan-category")}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: wp(3),
                fontFamily: fonts.medium,
              }}
            >
              + Add Category
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {mealPlanCategoriesState.length > 0 ? (
        <FlatList
          data={mealPlanCategoriesState}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterTab, item.active && styles.filterTabActive]}
              onPress={() => handleMealPlanCategorySelect(item)}
            >
              <Text style={[styles.filterText, item.active && styles.filterTextActive]}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => (item._id || item.id).toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primaryColor} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      )}
    </View>
  )

  // Card Components
  const RecipeCard = ({ recipe }) => {
    const navigation = useNavigation()
    const imageSource = recipe.banner || recipe.images?.[0] || recipe.image || "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center"

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => {
          navigation.navigate(RouteName.Client_Recipe_Detail, { recipe });
        }}
      >
        <Image source={{ uri: imageSource }} style={styles.recipeImage} />
      </TouchableOpacity>
    )
  }

  const MealPlanCard = ({ mealPlan }) => {
    const imageSource = mealPlan.banner || mealPlan.image || "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center"

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => {
          navigation.navigate(RouteName.Client_Meal_Detail, { recipe: mealPlan });
        }}
      >
        <Image
          source={{ uri: imageSource }}
          style={styles.recipeImage}
          defaultSource={{
            uri: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center",
          }}
        />
      </TouchableOpacity>
    )
  }

  const renderRecipe = ({ item }) => <RecipeCard recipe={item} />
  const renderMealPlan = ({ item }) => <MealPlanCard mealPlan={item} />

  useEffect(() => {
    const initializeData = async () => {
      setRecipeLoading(true)
      setMealPlanLoading(true)
      await Promise.all([getRecipeCategories(), getMealPlanCategories(), getRecipes(), getMealPlans()])
    }
    initializeData()
  }, [])

  const closeModal = () => {
    setCategoryModal("")
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={wp(6.5)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("InstructorNutrition.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={wp(5)} color={COLORS.white} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("InstructorNutrition.placeHolder")}
            placeholderTextColor={COLORS.white}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primaryColor]}
            tintColor={COLORS.primaryColor}
          />
        }
      >
        {/* Your Recipes Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("InstructorNutrition.yourrecipes")}</Text>
          <TouchableOpacity onPress={() => navigation.navigate(RouteName.Client_Recipe)}>
            <Text style={styles.viewAllText}>{t("InstructorNutrition.Viewall")}</Text>
          </TouchableOpacity>
        </View>

        {/* Recipe Categories Section */}
        <View style={styles.filterContainer}>
          <RecipeCategories />
        </View>

        {/* Recipe Cards */}
        {recipeLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primaryColor} />
            <Text style={styles.loadingText}>Loading recipes...</Text>
          </View>
        ) : (
          <FlatList
            data={recipes}
            renderItem={renderRecipe}
            keyExtractor={(item) => (item._id || item.id).toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No recipes found for this category</Text>
              </View>
            }
          />
        )}

        {/* Meal Plans Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("InstructorNutrition.mealPlan")}</Text>
          <TouchableOpacity onPress={() => navigation.navigate(RouteName.Client_Meal)}>
            <Text style={styles.viewAllText}>{t("InstructorNutrition.Viewall")}</Text>
          </TouchableOpacity>
        </View>

        {/* Meal Plan Categories Section */}
        <View style={styles.filterContainer}>
          <MealPlanCategories />
        </View>

        {/* Meal Plan Cards */}
        {mealPlanLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primaryColor} />
            <Text style={styles.loadingText}>Loading meal plans...</Text>
          </View>
        ) : (
          <FlatList
            data={mealPlans}
            renderItem={renderMealPlan}
            keyExtractor={(item) => (item._id || item.id).toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No meal plans found for this category</Text>
              </View>
            }
          />
        )}
      </ScrollView>

      <Modal
        visible={categoryModal !== ""}
        transparent={true}
        animationType="fade"
        onRequestClose={() => closeModal()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Recipe Category</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Recipe Category Name"
                placeholderTextColor="#666"
                value={categoryName}
                onChangeText={setCategoryName}
                autoFocus={true}
              />
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  closeModal()
                  setCategoryName("")
                }}
                activeOpacity={0.8}
                disabled={categoryLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddRecipeCategory}
                activeOpacity={0.8}
                disabled={categoryLoading}
              >
                {categoryLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.addButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: hp(2.3),
    textAlign: "center",
    flex: 1,
    fontFamily: fonts.medium,
  },
  placeholder: {
    width: wp(10),
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(12),
  },
  searchContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(2.5),
    marginTop: hp(1),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(29, 29, 32, 1)",
    borderRadius: wp(2.5),
    paddingHorizontal: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.gray3,
    height: hp(7),
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 12,
    marginLeft: wp(2.5),
    fontFamily: fonts.regular,
  },
  filterContainer: {
    paddingHorizontal: wp(5),
    marginVertical: hp(1.4),
  },
  filterContent: {
    paddingVertical: hp(1),
  },
  filterTab: {
    paddingHorizontal: wp(5),
    paddingVertical: wp(0.7),
    borderRadius: wp(6),
    backgroundColor: COLORS.backgroundColor,
    marginRight: wp(3),
    borderWidth: 0.5,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    minHeight: wp(8),
  },
  filterTabActive: {
    backgroundColor: COLORS.primaryColor,
    borderColor: COLORS.gray3,
  },
  filterText: {
    color: COLORS.gray2,
    fontSize: 12,
    fontFamily: fonts.medium,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: wp(4),
  },
  filterTextActive: {
    color: "#000",
    fontFamily: fonts.medium,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(2),
    marginBottom: hp(1.5),
    paddingHorizontal: wp(5),
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: COLORS.white,
  },
  viewAllText: {
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
    color: COLORS.white,
  },
  cardsContainer: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
  },
  recipeCard: {
    width: wp(60),
    height: hp(26),
    borderRadius: wp(3),
    overflow: "hidden",
    marginRight: wp(3),
  },
  recipeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categorySection: {
    marginBottom: hp(2),
  },
  categoryHeader: {
    alignItems: "flex-end",
    marginBottom: hp(1),
  },
  categoryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  categoryActionButton: {
    backgroundColor: COLORS.primaryColor,
    borderRadius: wp(5),
    padding: wp(2),
    alignItems: "center",
    justifyContent: "center",
    minWidth: wp(8),
    minHeight: wp(8),
  },
  editActionButton: {
    backgroundColor: "#4CAF50",
  },
  deleteActionButton: {
    backgroundColor: "#FF4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
  },
  modalContainer: {
    backgroundColor: "#2A2A2D",
    borderRadius: wp(4),
    padding: wp(6),
    width: "100%",
    maxWidth: wp(80),
  },
  modalTitle: {
    color: "#FFF",
    fontSize: wp(4.5),
    fontFamily: fonts.medium,
    textAlign: "center",
    marginBottom: hp(3),
  },
  inputContainer: {
    marginBottom: hp(3),
  },
  inputLabel: {
    color: "#FFF",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
    marginBottom: hp(1),
  },
  modalInput: {
    backgroundColor: "#1F1F21",
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    color: "#FFF",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: "#444",
  },
  modalButtonContainer: {
    flexDirection: "row",
    gap: wp(3),
  },
  modalButton: {
    flex: 1,
    borderRadius: wp(2.5),
    paddingVertical: hp(1.5),
    alignItems: "center",
    justifyContent: "center",
    minHeight: hp(6),
  },
  addButton: {
    backgroundColor: COLORS.primaryColor,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#666",
  },
  addButtonText: {
    color: "white",
    fontSize: wp(4),
    fontFamily: fonts.medium,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: wp(4),
    fontFamily: fonts.medium,
  },
  loadingContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: wp(2),
  },
  loadingText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
  },
  emptyContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: "center",
    justifyContent: "center",
    minWidth: wp(90),
  },
  emptyText: {
    color: COLORS.gray3,
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
    textAlign: "center",
  },
})