import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Svg, { Circle } from "react-native-svg";
import fonts from "../../../../assets/fonts";
import RouteName from "../../../../navigation/RouteName";
import { GetApiRequest } from "../../../../services/api";
import { COLORS } from "../../../../utils/COLORS";
import { useSelector } from "react-redux";
import MealPlanCard from "../../../../components/MealPlanCard";

export default function Nutritions() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [stats, setStats] = useState({});
  const [mealPlans, setMealPlans] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const { userData } = useSelector((state) => state.users);
  const clientId = userData?._id;
  const fetchInitialData = async () => {
    try {
      const [mealPlansRes, recipesRes] = await Promise.all([
        GetApiRequest(`api/clients/${clientId}/plans`),
        GetApiRequest("api/recipes"),
      ]);

      if (mealPlansRes?.data?.success) {
        setMealPlans(mealPlansRes?.data?.data?.mealPlans);
      } else {
        setMealPlans([]);
      }
      if (recipesRes?.data?.recipes) {
        const recipeList = recipesRes.data.recipes;
        setRecipes(recipeList);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);

      setMealPlans([]);
      setRecipes([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await GetApiRequest(`api/users/dashboard-stats`);
      if (res?.data?.success) {
        console.log(res?.data?.data?.workoutStats);
        setStats(res?.data?.data?.mealStats);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchStats();
    fetchInitialData();
  }, []);

  const renderRecommendedRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.recommendedCard}
      activeOpacity={0.8}
      onPress={() => {
        navigation.navigate(RouteName.Receipe_Detail, {
          recipeId: item._id,
        });
      }}
    >
      <Image
        source={{
          uri:
            item.banner ||
            item.image ||
            "/placeholder.svg?height=200&width=300",
        }}
        style={styles.recommendedImage}
      />
      <View style={styles.recommendedOverlay}>
        <View style={styles.tagContainer}>
          <Text style={styles.recommendedTitle}>{item.name}</Text>
          <Text style={styles.tagText}>{item.category?.name || "Recipe"}</Text>
        </View>
        <View style={styles.recommendedContent}>
          <View style={styles.recommendedInfo}>
            <Text style={styles.clientText} numberOfLines={1}>
              {`${item.servings} servings`}
            </Text>
            <View style={styles.durationContainer}>
              <Ionicons name="time-outline" size={wp(3)} color={COLORS.white} />
              <Text style={styles.durationText}>
                {item.prepTime ? `${item.prepTime}min` : "15min"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
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
          <Ionicons name="arrow-back" size={wp(6)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("Nutrition.header_title")}</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="fire"
              size={28}
              color="#FEC635"
              style={styles.statIcon}
            />
            <View>
              <Text style={styles.statValue}>
                {stats?.totalCalories || 0} kcal
              </Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="bread-slice"
              size={28}
              color="#FEC635"
              style={styles.statIcon}
            />
            <View>
              <Text style={styles.statValue}>
                {stats?.nutritionTotals?.carbs || 0} g
              </Text>
              <Text style={styles.statLabel}>Carbs</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="food-steak"
              size={28}
              color="#FEC635"
              style={styles.statIcon}
            />
            <View>
              <Text style={styles.statValue}>
                {stats?.nutritionTotals?.protein || 0} g
              </Text>
              <Text style={styles.statLabel}>Protein</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="peanut-outline"
              size={28}
              color="#FEC635"
              style={styles.statIcon}
            />
            <View>
              <Text style={styles.statValue}>
                {stats?.nutritionTotals?.fat || 0} g
              </Text>
              <Text style={styles.statLabel}>Fat</Text>
            </View>
          </View>
        </View>

        {/* Meal Plans Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("Nutrition.active_meal_plan_title")}
            </Text>
          </View>
          {mealPlans.length > 0 ? (
            <FlatList
              data={mealPlans}
              renderItem={({ item }) => (
                <MealPlanCard
                  item={item}
                  onPress={() =>
                    navigation.navigate(RouteName.Recipe_Time, {
                      mealPlan: item?.mealPlan,
                    })
                  }
                />
              )}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mealList}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                Your coach hasn’t assigned you any meal plans yet.
              </Text>
            </View>
          )}
        </View>

        {/* Recommended Recipes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("Nutrition.recommended_recipes_title")}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(RouteName.Receipes)}
            >
              <Text style={styles.viewAllText}>{t("Nutrition.view_all")}</Text>
            </TouchableOpacity>
          </View>
          {recipes.length > 0 ? (
            <FlatList
              data={recipes}
              renderItem={renderRecommendedRecipe}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedList}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No recipes available</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
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
    paddingVertical: hp(2),
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    color: "#FFF",
    fontSize: hp(2.3),
    fontFamily: fonts.medium,
  },
  placeholder: {
    width: wp(10),
  },
  caloriesCard: {
    backgroundColor: "rgba(45, 45, 47, 1)",
    marginHorizontal: wp(4),
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(3),
  },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(3),
  },
  progressCircleContainer: {
    position: "relative",
    marginRight: wp(6),
  },
  progressCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    color: "#FFF",
    fontSize: wp(4.7),
    fontFamily: fonts.regular,
  },
  progressLabel: {
    color: "#888",
    fontSize: wp(2.2),
    fontFamily: fonts.regular,
  },
  caloriesStats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.5),
  },

  emojiIcon: {
    fontSize: wp(4),
  },

  statUnit: {
    color: "#888",
    fontSize: wp(3),
    fontFamily: fonts.regular,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: wp(4),
    marginBottom: hp(3),
  },
  statBox: {
    backgroundColor: "rgba(45, 45, 47, 1)",
    borderRadius: wp(4),
    padding: wp(3),
    flex: 1,
    marginHorizontal: wp(1),
    alignItems: "center",
  },
  progressStatLabel: {
    color: "#888",
    fontSize: wp(2.7),
    marginBottom: hp(1),
    fontFamily: fonts.regular,
  },
  progressStatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  progressStatValue: {
    color: "#FFF",
    fontSize: wp(3.7),
    fontFamily: fonts.regular,
  },
  section: {
    marginHorizontal: wp(4),
    marginBottom: hp(3),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: wp(4),
    fontFamily: fonts.medium,
  },
  viewAllText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontFamily: fonts.medium,
  },
  mealList: {
    paddingRight: wp(4),
  },

  tagContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tagText: {
    backgroundColor: "#FEC635",
    color: "#000",
    fontSize: wp(2.3),
    fontFamily: fonts.regular,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(1),
  },
  mealContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  mealInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientText: {
    color: "#CCC",
    fontSize: wp(3),
    fontFamily: fonts.regular,
    flex: 1,
    marginRight: wp(2),
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    color: COLORS.white,
    fontSize: wp(3),
    marginLeft: wp(1),
    fontFamily: fonts.regular,
  },
  noLogsContainer: {
    alignItems: "center",
    paddingVertical: hp(4),
    backgroundColor: "rgba(45, 45, 47, 1)",
    borderRadius: 15,
  },
  noLogsIcon: {
    marginBottom: hp(2),
  },
  noLogsText: {
    color: "#888",
    fontSize: wp(3.7),
    fontFamily: fonts.medium,
  },
  noDataContainer: {
    alignItems: "center",
    paddingVertical: hp(3),
    backgroundColor: "rgba(45, 45, 47, 1)",
    borderRadius: wp(4),
    paddingHorizontal: 20,
  },
  noDataText: {
    color: "#888",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
    textAlign: "center",
  },
  recommendedList: {
    paddingRight: wp(4),
  },
  recommendedCard: {
    width: wp(60),
    height: hp(25),
    borderRadius: wp(4),
    marginRight: wp(3),
    overflow: "hidden",
    backgroundColor: "rgba(45, 45, 47, 1)",
  },
  recommendedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  recommendedOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    height: hp(10),
    padding: wp(3),
    justifyContent: "space-between",
  },
  recommendedContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  recommendedTitle: {
    color: "#FFF",
    fontSize: wp(3.4),
    fontFamily: fonts.medium,
    marginBottom: hp(0.5),
    width: wp(35),
  },
  recommendedInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomSpacer: {
    height: hp(10),
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  statCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#242427", // keep the dark background
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#33373B",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statIcon: {
    marginRight: 12,
  },
  statValue: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.white, // matches your theme
    marginTop: 2,
    fontFamily: fonts.regular,
  },
});
