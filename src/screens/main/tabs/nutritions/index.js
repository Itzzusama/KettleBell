import { Ionicons } from "@expo/vector-icons";
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

const ProgressCircle = ({
  percentage,
  color = "#FEC635",
  size = wp(20),
  strokeWidth = wp(2),
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const { t } = useTranslation();

  return (
    <View style={styles.progressCircleContainer}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.gray3}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={styles.progressCenter}>
        <Text style={styles.progressText}>1190</Text>
        <Text style={styles.progressLabel}>{t("Nutrition.kcal_left")}</Text>
      </View>
    </View>
  );
};

const SmallProgressCircle = ({
  percentage,
  color = "#FEC635",
  size = wp(6),
  strokeWidth = wp(0.8),
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="gray"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90, ${size / 2}, ${size / 2})`}
      />
    </Svg>
  );
};

export default function Nutritions() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // State for data only
  const [mealPlans, setMealPlans] = useState([]);
  const [recipes, setRecipes] = useState([]);

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      const [mealPlansRes, recipesRes] = await Promise.all([
        GetApiRequest("api/meal-plans"),
        GetApiRequest("api/recipes"),
      ]);

      // console.log(
      //   "Meal plans response:========================>",
      //   mealPlansRes?.data
      // );
      // console.log(
      //   "Recipes response:========================>",
      //   recipesRes?.data
      // );

      // Set initial meal plans - API returns object with mealPlans array
      if (mealPlansRes?.data?.mealPlans) {
        setMealPlans(mealPlansRes.data.mealPlans);
      } else {
        console.log("No meal plans found");
        setMealPlans([]);
      }

      if (recipesRes?.data?.recipes) {
        setRecipes(recipesRes.data.recipes);
      } else {
        console.log("No recipes found");
        setRecipes([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load data");
      setMealPlans([]);
      setRecipes([]);
    }
  };

  // useEffect hooks
  useEffect(() => {
    fetchInitialData();
  }, []);

  const renderMealPlan = ({ item }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() =>
        navigation.navigate(RouteName.Recipe_Time, { mealPlan: item })
      }
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri:
            item.banner ||
            item.image ||
            "/placeholder.svg?height=200&width=300",
        }}
        style={styles.mealImage}
      />
      <View style={styles.mealOverlay}>
        <View style={styles.tagContainer}>
          <Text style={styles.mealTitle} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <View style={styles.mealContent}>
          <View style={styles.mealInfo}>
            <Text style={styles.clientText} numberOfLines={1}>
              {item.description || `${item.servings} servings`}
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

  const renderRecommendedRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.recommendedCard}
      activeOpacity={0.8}
      onPress={() => {
        // Pass the recipe ID to the detail screen
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
      <ScrollView showsVerticalScrollIndicator={false}>
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

        <View style={styles.caloriesCard}>
          <View style={styles.caloriesRow}>
            <ProgressCircle percentage={65} />
            <View style={styles.caloriesStats}>
              <View style={styles.statItem}>
                <View style={styles.statHeader}>
                  <View style={styles.statIcon}>
                    <Text style={styles.emojiIcon}>🍽️</Text>
                  </View>
                  <Text style={styles.statLabel}>
                    {t("Nutrition.eaten_label")}
                  </Text>
                </View>
                <Text style={styles.statValue}>1190</Text>
                <View style={{ borderWidth: 0.3, borderColor: COLORS.gray }} />
                <Text style={styles.statUnit}>{t("Nutrition.kcal_unit")}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statHeader}>
                  <View style={styles.statIcon}>
                    <Text style={styles.emojiIcon}>🔥</Text>
                  </View>
                  <Text style={styles.statLabel}>
                    {t("Nutrition.burn_label")}
                  </Text>
                </View>
                <Text style={styles.statValue}>2650</Text>
                <Text style={styles.statUnit}>{t("Nutrition.kcal_unit")}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statBox}>
            <Text style={styles.progressStatLabel}>
              {t("Nutrition.avg_calories_label")}
            </Text>
            <View style={styles.progressStatRow}>
              <SmallProgressCircle percentage={30} color="#FEC635" />
              <Text style={styles.progressStatValue}>0</Text>
              <Ionicons name="trending-up" size={wp(4)} color="#FEC635" />
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.progressStatLabel}>
              {t("Nutrition.avg_protein_label")}
            </Text>
            <View style={styles.progressStatRow}>
              <SmallProgressCircle percentage={0} color="#FEC635" />
              <Text style={styles.progressStatValue}>
                0{t("Nutrition.grams_unit")}
              </Text>
              <Ionicons name="trending-up" size={wp(4)} color="#FEC635" />
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.progressStatLabel}>
              {t("Nutrition.completion_label")}
            </Text>
            <View style={styles.progressStatRow}>
              <SmallProgressCircle percentage={0} color="#FEC635" />
              <Text style={styles.progressStatValue}>
                0{t("Nutrition.percent_unit")}
              </Text>
              <Ionicons name="trending-up" size={wp(4)} color="#FEC635" />
            </View>
          </View>
        </View>

        {/* Meal Plans Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("Nutrition.active_meal_plan_title")}
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>{t("Nutrition.view_all")}</Text>
            </TouchableOpacity>
          </View>
          {mealPlans.length > 0 ? (
            <FlatList
              data={mealPlans}
              renderItem={renderMealPlan}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mealList}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No meal plans available</Text>
            </View>
          )}
        </View>

        {/* Recent Logs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("Nutrition.recent_logs_title")}
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>{t("Nutrition.see_all")}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.noLogsContainer}>
            <View style={styles.noLogsIcon}>
              <Ionicons name="document-outline" size={wp(12)} color="#333" />
            </View>
            <Text style={styles.noLogsText}>{t("Nutrition.no_logs_text")}</Text>
          </View>
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
  statIcon: {
    marginRight: wp(1),
  },
  emojiIcon: {
    fontSize: wp(4),
  },
  statLabel: {
    color: "#888",
    fontSize: wp(2.5),
    fontFamily: fonts.regular,
  },
  statValue: {
    color: "#FFF",
    fontSize: wp(4),
    fontFamily: fonts.medium,
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
    fontSize: wp(4.7),
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
  mealCard: {
    width: wp(60),
    height: hp(25),
    borderRadius: wp(4),
    marginRight: wp(3),
    overflow: "hidden",
    backgroundColor: "rgba(45, 45, 47, 1)",
  },
  mealImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  mealOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    height: hp(10),
    padding: wp(3),
    justifyContent: "space-between",
  },
  tagContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealTitle: {
    color: "#FFF",
    fontSize: wp(3.4),
    fontFamily: fonts.medium,
    marginBottom: hp(0.5),
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
  },
  noDataText: {
    color: "#888",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
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
});
