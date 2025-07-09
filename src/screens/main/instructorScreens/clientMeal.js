"use client";

import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import fonts from "../../../assets/fonts";
import RouteName from "../../../navigation/RouteName";
import { DeleteApiRequest, GetApiRequest } from "../../../services/api"; // Added DeleteApiRequest
import { COLORS } from "../../../utils/COLORS";
import { useToast } from "../../../utils/Toast/toastContext";
export default function ClientMeal() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const toast = useToast();
  const insets = useSafeAreaInsets()
  // State management
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch recipes from API
  const getRecipes = async () => {
    try {
      setLoading(true);
      const res = await GetApiRequest("api/meal-plans/my-meal-plans");

      if (res && res.data && Array.isArray(res.data)) {
        setRecipes(res.data);
      } else if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
        setRecipes(res.data.data);
      } else if (res && Array.isArray(res)) {
        setRecipes(res);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.log("Error fetching recipes:", error);
      setRecipes([]);
      toast.showToast({
        type: "error",
        message: "Failed to load recipes",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete recipe function
  const deleteRecipe = async (recipeId) => {
    try {
      const res = await DeleteApiRequest(`api/meal-plans/${recipeId}`);
      if (res.status === 200 || res.status === 201) {
        setRecipes(recipes.filter((recipe) => (recipe._id || recipe.id) !== recipeId));
        toast.showToast({
          type: "success",
          message: "Recipe deleted successfully",
          duration: 3000,
        });
      } else {
        throw new Error("Failed to delete recipe");
      }
    } catch (error) {
      console.log("Error deleting recipe:", error);
      toast.showToast({
        type: "error",
        message: "Failed to delete recipe",
        duration: 4000,
      });
    }
  };

  // Confirm delete action
  const confirmDelete = (recipeId) => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteRecipe(recipeId),
        },
      ],
      { cancelable: true }
    );
  };

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getRecipes();
    } catch (error) {
      console.log(error);
      toast.showToast({
        type: "error",
        message: "Failed to refresh recipes",
        duration: 4000,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const RecipeCard = ({ recipe }) => {
    const getImageSource = () => {
      if (recipe.images && Array.isArray(recipe.images) && recipe.images.length > 0) {
        return recipe.images[0];
      }
      if (recipe.banner) {
        return recipe.banner;
      }
      if (recipe.image) {
        return recipe.image;
      }
      // Fallback placeholder image
      return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center";
    };

    const imageSource = getImageSource();

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => {
          navigation.navigate(RouteName.Client_Meal_Detail, { recipe });
        }}
      >
        <Image
          source={{ uri: imageSource }}
          style={styles.recipeImage}
          defaultSource={{
            uri: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center",
          }}
        />
        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              navigation.navigate(RouteName.Create_Meal, { recipe, isEditMode: true });
            }}
            accessible={true}
            accessibilityLabel="Edit recipe"
          >
            <Feather name="edit" size={wp(3)} color={COLORS.primaryColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => confirmDelete(recipe._id || recipe.id)}
            accessible={true}
            accessibilityLabel="Delete recipe"
          >
            <Feather name="trash-2" size={wp(3)} color={COLORS.primaryColor} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecipe = ({ item }) => <RecipeCard recipe={item} />;

  // Load recipes on component mount
  useFocusEffect(
    useCallback(() => {
      getRecipes();
    }, [])
  );
  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={wp(6.5)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Plans</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(RouteName.Create_Meal)}
          style={styles.addButton}
          accessible={true}
          accessibilityLabel="Add new recipe"
        >
          <Ionicons name="add" size={wp(4)} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {/* <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={wp(5)} color={COLORS.white} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("ClientRecipe.placeholder")}
            placeholderTextColor={COLORS.white}
          />
        </View>
      </View> */}

      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => (item._id || item.id).toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.recipeGrid}
        columnWrapperStyle={styles.recipeRow}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primaryColor]}
            tintColor={COLORS.primaryColor}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={wp(15)} color={COLORS.gray3} />
              <Text style={styles.emptyText}>No recipes found</Text>
              <Text style={styles.emptySubText}>Add your first recipe to get started</Text>
            </View>
          ) : null
        }
      />
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
    paddingBottom: hp(2),
  },
  backButton: {
    padding: wp(2.5),
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: hp(2.3),
    fontFamily: fonts.medium,
    textAlign: "center",
    flex: 1,
  },
  addButton: {
    backgroundColor: COLORS.primaryColor,
    borderRadius: wp(10),
    padding: wp(2.5),
    alignItems: "center",
    justifyContent: "center",
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
    fontFamily: fonts.regular,
    marginLeft: wp(2.5),
  },
  recipeGrid: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(12),
    flexGrow: 1,
  },
  recipeRow: {
    justifyContent: "space-between",
    marginBottom: hp(2),
  },
  recipeCard: {
    width: wp(42.5),
    height: hp(26),
    borderRadius: wp(3),
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: "relative", // Added for absolute positioning of icons
  },
  recipeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  iconContainer: {
    position: "absolute",
    top: wp(2),
    right: wp(2),
    flexDirection: "row",
    gap: wp(2),
  },
  iconButton: {
    backgroundColor: COLORS.white,
    borderRadius: wp(5),
    padding: wp(1.5),
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(10),
  },
  loadingText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
    marginTop: hp(2),
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(10),
    paddingHorizontal: wp(10),
  },
  emptyText: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontFamily: fonts.medium,
    textAlign: "center",
    marginTop: hp(2),
  },
  emptySubText: {
    color: COLORS.gray2,
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
    textAlign: "center",
    marginTop: hp(1),
    lineHeight: wp(5),
  },
});