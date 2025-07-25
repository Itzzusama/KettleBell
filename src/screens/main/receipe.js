import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import fonts from "../../assets/fonts";
import RouteName from "../../navigation/RouteName";
import { GetApiRequest } from "../../services/api";
import {
  fetchRecipesFailure,
  fetchRecipesStart,
  fetchRecipesSuccess,
} from "../../store/slices/recipesSlice";
import { COLORS } from "../../utils/COLORS";

export default function YourRecipesScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Redux
  const dispatch = useDispatch();
  const {
    recipes: reduxRecipes,
    loading,
    error,
  } = useSelector((state) => state.recipes);

  // Local state
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredRecipes(reduxRecipes);
    } else {
      const filtered = reduxRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query.toLowerCase()) ||
          (recipe.tag &&
            recipe.tag.toLowerCase().includes(query.toLowerCase())) ||
          (recipe.client &&
            recipe.client.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredRecipes(filtered);
    }
  };

  // Fetch recipes from API
  const fetchRecipes = async () => {
    try {
      dispatch(fetchRecipesStart());
      const response = await GetApiRequest("api/recipes");
      console.log("Recipes API response:", response?.data);

      if (response?.data?.recipes) {
        const formattedRecipes = response.data.recipes.map((recipe) => ({
          id: recipe._id,
          title: recipe.name,
          image:
            recipe.banner ||
            recipe.image ||
            "/placeholder.svg?height=300&width=400",
          tag: recipe.category?.name || "Recipe",
          client: recipe.description || `${recipe.servings} servings`,
          duration: recipe.prepTime ? `${recipe.prepTime}min` : "15min",
          banner: recipe.banner,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          nutrition: recipe.nutrition,
          originalData: recipe,
        }));

        dispatch(fetchRecipesSuccess(formattedRecipes));
        setFilteredRecipes(formattedRecipes);
      } else {
        console.log("No recipes found in API response");
        dispatch(fetchRecipesSuccess([]));
        setFilteredRecipes([]);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      dispatch(fetchRecipesFailure(error.message));
      Alert.alert("Error", "Failed to load recipes");
      setFilteredRecipes([]);
    }
  };

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecipes(reduxRecipes);
    } else {
      const filtered = reduxRecipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, reduxRecipes]);

  // Fetch data on component mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => {
        // Pass the recipe ID to the detail screen
        navigation.navigate(RouteName.Receipe_Detail, {
          recipeId: item.id,
        });
      }}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.recipeOverlay}>
        <View style={styles.recipeContent}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.recipeTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
          </View>
          <View style={styles.recipeDetails}>
            <View style={styles.clientInfo}>
              <Text style={styles.clientText} numberOfLines={1}>
                {item.client}
              </Text>
            </View>
            <View style={styles.durationContainer}>
              <Ionicons name="time-outline" size={wp(4)} color="#FEC635" />
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Loading component
  if (loading && reduxRecipes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.error, marginBottom: 10 }}>
          Error: {error}
        </Text>
        <Button title="Retry" onPress={fetchRecipes} />
      </View>
    );
  }

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
          <Ionicons name="arrow-back" size={wp(6.5)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("YourRecipes.header_title")}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={wp(4.5)} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder={t("YourRecipes.search_placeholder")}
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close" size={wp(4.5)} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.recipeGrid}
          columnWrapperStyle={[
            styles.recipeRow,
            {
              justifyContent:
                filteredRecipes?.length == 1 ? "flex-start" : "center",
            },
          ]}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={wp(15)} color="#888" />
          <Text style={styles.emptyText}>
            {searchQuery
              ? "No recipes found matching your search"
              : "No recipes available"}
          </Text>
          {!searchQuery && (
            <TouchableOpacity style={styles.retryButton} onPress={fetchRecipes}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
    paddingVertical: hp(2),
  },
  backButton: {
    padding: wp(2.5),
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
  searchContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(2.5),
    marginTop: hp(1),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
    borderRadius: wp(2.5),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1),
    borderWidth: 0.3,
    borderColor: COLORS.gray2,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: wp(4),
    marginLeft: wp(3),
    fontFamily: fonts.regular,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    fontSize: wp(4),
    marginTop: hp(2),
    fontFamily: fonts.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(10),
  },
  emptyText: {
    color: "#888",
    fontSize: wp(4),
    textAlign: "center",
    marginTop: hp(2),
    fontFamily: fonts.regular,
  },
  retryButton: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    marginTop: hp(3),
  },
  retryText: {
    color: "#000",
    fontSize: wp(4),
    fontFamily: fonts.medium,
  },
  recipeGrid: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(12),
  },
  recipeRow: {
    justifyContent: "center",
    marginBottom: hp(2),
  },
  recipeCard: {
    width: wp(45),
    height: hp(26),
    borderRadius: wp(3),
    overflow: "hidden",
    position: "relative",
    marginHorizontal: wp(1),
  },
  recipeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  tagContainer: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.6),
    borderRadius: wp(1.5),
    marginLeft: wp(2),
  },
  tagText: {
    color: "#000",
    fontSize: wp(2.6),
    fontFamily: fonts.regular,
  },
  recipeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    height: hp(11),
    padding: wp(2.5),
  },
  recipeContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  recipeTitle: {
    color: "#FFF",
    fontSize: wp(3.8),
    fontFamily: fonts.medium,
    lineHeight: wp(4.8),
    maxWidth: wp(27),
  },
  recipeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(0.5),
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  clientText: {
    color: "#CCC",
    fontSize: wp(3),
    marginLeft: wp(1),
    fontFamily: fonts.regular,
    flex: 1,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    color: COLORS.primaryColor,
    fontSize: wp(3.2),
    fontFamily: fonts.medium,
    marginLeft: wp(1),
  },
});
