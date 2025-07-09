import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from 'react-redux';
import fonts from "../../../assets/fonts";
import { Images } from "../../../assets/images";
import RouteName from "../../../navigation/RouteName";
import { DeleteApiRequest, GetApiRequest } from "../../../services/api";
import { setMealPlanData } from "../../../store/slices/mealPlanSlice";
import { COLORS } from "../../../utils/COLORS";
import { useToast } from "../../../utils/Toast/toastContext";

export default function MealScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const item = route.params.recipe;

  const [mealPlans, setMealPlans] = useState([]);
  const [selectedDay, setSelectedDay] = useState("Sunday");
  const [selectedMealType, setSelectedMealType] = useState("all");

  const dayCategories = [
    { id: 2, name: "Sunday", active: true },
    { id: 3, name: "Monday", active: false },
    { id: 4, name: "Tuesday", active: false },
    { id: 5, name: "Wednesday", active: false },
    { id: 6, name: "Thursday", active: false },
    { id: 7, name: "Friday", active: false },
    { id: 8, name: "Saturday", active: false },
  ];

  const mealTypeCategories = [
    { id: 1, name: "all", active: true },
    { id: 2, name: "breakfast", active: false },
    { id: 3, name: "lunch", active: false },
    { id: 4, name: "dinner", active: false },
  ];

  const [dayCategoriesState, setDayCategoriesState] = useState(dayCategories);
  const [mealTypeCategoriesState, setMealTypeCategoriesState] = useState(mealTypeCategories);

  const getMealPlan = async () => {
    try {
      const response = await GetApiRequest(`api/meal-plans/${item._id}/daily-meals`);
      if (response && response.data && response.data.weekSchedule) {
        dispatch(setMealPlanData(response.data));
        const processedMeals = response.data.weekSchedule.flatMap((day) =>
          Object.entries(day.meals)
            .filter(([_, meal]) => meal !== null)
            .map(([mealType, meal]) => ({
              id: meal._id,
              title: meal.name,
              description: meal.description,
              time: meal.time,
              image: meal.images && meal.images.length > 0 ? meal.images[0] : null,
              images: meal.images || [],
              day: day.day,
              dayOfWeek: meal.dayOfWeek,
              mealType: meal.mealType.toLowerCase(), // Ensure consistency
              ingredients: meal.ingredients || [],
              instructions: meal.instructions || [],
            }))
        );
        setMealPlans(processedMeals);
      }
    } catch (error) {
      console.log("Error fetching meal plans:", error);
      toast.showToast({
        type: "error",
        message: "Failed to load meal plans",
        duration: 4000,
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      getMealPlan();
    }, [])
  );

  const handleAddMealPlan = () => {
    navigation.navigate(RouteName.Create_New_Recipe, { recipe: item._id });
  };

  const handleEditMeal = (meal) => {
    navigation.navigate(RouteName.Create_New_Recipe, {
      recipe: item._id,
      mealData: {
        _id: meal.id,
        name: meal.title,
        description: meal.description,
        time: meal.time,
        images: meal.images,
        day: meal.day,
        dayOfWeek: meal.dayOfWeek,
        mealType: meal.mealType,
        ingredients: meal.ingredients,
        instructions: meal.instructions,
      },
      editMode: true,
    });
  };

  const handleDeleteMeal = (meal) => {
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await DeleteApiRequest(`api/meal-plans/${item._id}/daily-meals/${meal.dayOfWeek}/${meal.mealType}`);
              toast.showToast({
                type: "success",
                message: "Meal deleted successfully",
                duration: 4000,
              });
              getMealPlan();
            } catch (error) {
              console.log("Error deleting meal:", error);
              toast.showToast({
                type: "error",
                message: "Failed to delete meal",
                duration: 4000,
              });
            }
          },
        },
      ]
    );
  };

  const handleDayCategoryPress = (categoryName) => {
    setDayCategoriesState(
      dayCategoriesState.map((cat) => ({
        ...cat,
        active: cat.name === categoryName,
      }))
    );
    setSelectedDay(categoryName);
    setMealTypeCategoriesState(
      mealTypeCategoriesState.map((cat) => ({
        ...cat,
        active: cat.name === "all",
      }))
    );
    setSelectedMealType("all");
  };

  const handleMealTypeCategoryPress = (categoryName) => {
    setMealTypeCategoriesState(
      mealTypeCategoriesState.map((cat) => ({
        ...cat,
        active: cat.name === categoryName,
      }))
    );
    setSelectedMealType(categoryName);
  };

  const filteredMealPlans = mealPlans.filter((meal) => {
    const matchesDay = selectedDay === "All" || meal.day === selectedDay;
    const matchesMealType = selectedMealType === "all" || meal.mealType.toLowerCase() === selectedMealType.toLowerCase();
    return matchesDay && matchesMealType;
  });

  const renderDayCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryButton, item.active && styles.activeCategoryButton]}
      onPress={() => handleDayCategoryPress(item.name)}
    >
      <Text
        style={[styles.categoryText, item.active && styles.activeCategoryText]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMealTypeCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryButton, item.active && styles.activeCategoryButton]}
      onPress={() => handleMealTypeCategoryPress(item.name)}
    >
      <Text
        style={[styles.categoryText, item.active && styles.activeCategoryText]}
      >
        {item.name.charAt(0).toUpperCase() + item.name.slice(1)} {/* Capitalize for display */}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundColor} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={hp(3)} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("ClientMealDetail.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Image
            source={{ uri: item.banner }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>{item.name}</Text>
            <Text style={styles.heroSubtitle}>{item.description}</Text>
          </View>
        </View>

        {/* Meals Plan Section */}
        <View style={styles.mealsSection}>
          <View style={styles.mealsSectionHeader}>
            <Text style={styles.mealsSectionTitle}>
              Meal Plan
            </Text>
            <TouchableOpacity style={styles.addMealButton} onPress={handleAddMealPlan}>
              <Text style={styles.addMealButtonText}>
                {t("ClientMealDetail.addbtn")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Day Filter */}
          <View style={{ paddingVertical: hp(1) }}>
            <Text style={styles.filterTitle}>Days</Text>
            <FlatList
              data={dayCategoriesState}
              renderItem={renderDayCategory}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          </View>

          {/* Meal Type Filter */}
          <View style={{ paddingVertical: hp(1) }}>
            <Text style={styles.filterTitle}>Meal Types</Text>
            <FlatList
              data={mealTypeCategoriesState}
              renderItem={renderMealTypeCategory}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          </View>

          {/* Meal Plan Cards */}
          <View style={styles.mealCardsContainer}>
            {filteredMealPlans.length > 0 ? (
              filteredMealPlans.map((meal) => (
                <View key={meal.id} style={styles.mealCard}>
                  <Image
                    source={{ uri: meal.image || "https://via.placeholder.com/150" }}
                    style={styles.mealCardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.mealCardContent}>
                    <View style={styles.mealCardHeader}>
                      <Text style={styles.mealCardTitle}>{meal.title}</Text>
                      <View style={styles.mealCardActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEditMeal(meal)}
                        >
                          <Feather name="edit" size={wp(3)} color={COLORS.primaryColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteMeal(meal)}
                        >
                          <Feather name="trash-2" size={wp(3)} color={COLORS.primaryColor} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.mealCardDescription}>{meal.description}</Text>
                    <View style={styles.mealCardFooter}>
                      <Text style={styles.mealCardTime}>
                        {t("ClientMealDetail.time")}: {meal.time}
                      </Text>
                      <TouchableOpacity style={styles.startButton}>
                        <Text style={styles.startButtonText}>
                          {t("ClientMealDetail.start")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noMealsText}>
                <Image source={Images.nofound} style={{ width: wp(20), height: hp(20) }} resizeMode="contain" />
                <Text style={{ color: COLORS.white, fontSize: hp(2), fontFamily: fonts.medium }}>No Meal Found</Text>
              </View>
            )}
          </View>
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
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: wp(8),
  },
  addMealButton: {
    backgroundColor: COLORS.primaryColor,
    borderRadius: wp(2),
    padding: wp(1.5),
    alignItems: "center",
    justifyContent: "center",
  },
  addMealButtonText: {
    color: COLORS.white,
    fontSize: hp(1.4),
    fontFamily: fonts.medium,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    marginHorizontal: wp(4),
    marginBottom: hp(3),
  },
  heroImage: {
    width: "100%",
    height: hp(25),
    borderRadius: wp(3),
  },
  heroTextContainer: {
    paddingVertical: hp(1),
  },
  heroTitle: {
    fontSize: hp(2.5),
    fontFamily: fonts.semiBold,
    color: COLORS.white,
  },
  heroSubtitle: {
    fontSize: hp(1.7),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    lineHeight: hp(2.2),
  },
  mealsSection: {
    paddingHorizontal: wp(4),
  },
  mealsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  mealsSectionTitle: {
    fontSize: hp(2.5),
    fontFamily: fonts.semiBold,
    color: COLORS.white,
  },
  filterTitle: {
    fontSize: hp(1.8),
    fontFamily: fonts.semiBold,
    color: COLORS.white,
    marginBottom: hp(1),
  },
  categoryList: {
    paddingRight: wp(4),
  },
  categoryButton: {
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
  activeCategoryButton: {
    backgroundColor: COLORS.primaryColor,
    borderColor: COLORS.gray3,
  },
  categoryText: {
    color: COLORS.gray3,
    fontSize: hp(1.5),
    fontFamily: fonts.medium,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: wp(4),
  },
  activeCategoryText: {
    color: "#000",
    fontFamily: fonts.medium,
  },
  mealCardsContainer: {
    gap: hp(2),
  },
  mealCard: {
    flexDirection: "row",
    backgroundColor: COLORS.darkGray,
    borderRadius: wp(3),
    padding: hp(1.5),
    alignItems: "center",
  },
  mealCardImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
    marginRight: wp(3),
  },
  mealCardContent: {
    flex: 1,
  },
  mealCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  mealCardTitle: {
    fontSize: hp(2),
    fontFamily: fonts.semiBold,
    color: COLORS.white,
  },
  mealCardActions: {
    flexDirection: "row",
    gap: wp(2),
  },
  actionButton: {
    backgroundColor: COLORS.white,
    borderRadius: wp(5),
    padding: wp(1.5),
  },
  mealCardDescription: {
    fontSize: hp(1.4),
    fontFamily: fonts.regular,
    color: "#ccc",
    lineHeight: hp(1.8),
    marginBottom: hp(1),
  },
  mealCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealCardTime: {
    fontSize: hp(1.4),
    fontFamily: fonts.regular,
    color: "#888",
  },
  startButton: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    borderRadius: wp(2),
  },
  startButtonText: {
    fontSize: hp(1.4),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  noMealsText: {
    backgroundColor: "#2D2D2F",
    padding: hp(2),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp(3),
  },
});
