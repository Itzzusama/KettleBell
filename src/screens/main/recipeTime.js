"use client";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Platform,
  Pressable,
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
import fonts from "../../assets/fonts";
import RouteName from "../../navigation/RouteName";
import { GetApiRequest } from "../../services/api";
import { COLORS } from "../../utils/COLORS";

export default function MealScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { mealPlan } = route.params || {};
  console.log("previous  Meal Plan:===========>", mealPlan);
  const [mealPlanData, setMealPlanData] = useState(null);
  const [loading, setLoading] = useState(false);

  const getMealPlan = async () => {
    try {
      setLoading(true);
      const response = await GetApiRequest(
        `api/meal-plans/${mealPlan._id}/daily-meals`
      );
      console.log("latest Meal Plan by ID:===========>", response.data);
      setMealPlanData(response.data);
    } catch (error) {
      console.error("Error fetching meal plan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mealPlan) {
      getMealPlan();
    }
  }, [mealPlan]);

  // Week days mapping
  const weekDaysMapping = [
    { short: "Sun", full: "Sunday", dayOfWeek: 0 },
    { short: "Mon", full: "Monday", dayOfWeek: 1 },
    { short: "Tue", full: "Tuesday", dayOfWeek: 2 },
    { short: "Wed", full: "Wednesday", dayOfWeek: 3 },
    { short: "Thu", full: "Thursday", dayOfWeek: 4 },
    { short: "Fri", full: "Friday", dayOfWeek: 5 },
    { short: "Sat", full: "Saturday", dayOfWeek: 6 },
  ];

  const mealTimes = ["All", "Breakfast", "Lunch", "Dinner"];
  const [selectedDay, setSelectedDay] = useState(1); // Default to Monday (dayOfWeek: 1)
  const [selectedMealTime, setSelectedMealTime] = useState("All");

  // Get meals for selected day and meal time
  const getFilteredMeals = () => {
    if (!mealPlanData?.weekSchedule) return [];

    // Find the selected day's data
    const selectedDayData = mealPlanData.weekSchedule.find(
      (day) => day.dayOfWeek === selectedDay
    );

    if (!selectedDayData?.meals) return [];

    let allMeals = [];

    // Extract meals from the meals object
    const mealTypes = ["breakfast", "lunch", "dinner"];

    mealTypes.forEach((mealType) => {
      const meal = selectedDayData.meals[mealType];
      if (meal && meal !== null) {
        allMeals.push({
          ...meal,
          id: meal._id,
          mealType: meal.mealType || mealType,
          image: meal.images && meal.images.length > 0 ? meal.images[0] : null,
        });
      }
    });

    // Filter by meal time if not "All"
    if (selectedMealTime !== "All") {
      allMeals = allMeals.filter(
        (meal) => meal.mealType.toLowerCase() === selectedMealTime.toLowerCase()
      );
    }

    return allMeals;
  };

  const renderMealItem = (meal) => {
    // Only render meals that have images
    if (!meal.image) return null;

    return (
      <Pressable
        key={meal.id}
        style={({ pressed }) => [styles.mealItem, pressed && { opacity: 0.8 }]}
        onPress={() =>
          navigation.navigate(RouteName.Meal_Detail, {
            meal,
            mealId: mealPlan._id,
          })
        }
      >
        <Image source={{ uri: meal.image }} style={styles.mealItemImage} />
        <View style={styles.mealItemContent}>
          <Text style={styles.mealItemTitle}>{meal.name}</Text>
          <Text style={styles.mealItemDescription}>{meal.description}</Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.mealItemTime}>
              {t("MealScreen.time_label")}
              {meal.time} min
            </Text>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() =>
                navigation.navigate(RouteName.Meal_Detail, {
                  meal,
                  mealId: mealPlan._id,
                })
              }
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontSize: wp(1.5),
                  fontWeight: "bold",
                }}
              >
                Start
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  };

  const filteredMeals = getFilteredMeals();

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
        <Text style={styles.headerTitle}>{t("MealScreen.header_title")}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Image and Text */}
        <View style={styles.mainImageContainer}>
          <Image
            source={{
              uri:
                mealPlan?.banner ||
                "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=400&fit=crop&crop=center",
            }}
            style={styles.mainImage}
          />
          <View style={styles.textContainer}>
            <Text style={styles.mainTitle}>{mealPlan?.name}</Text>
            <Text style={styles.mainDescription}>{mealPlan?.description}</Text>
          </View>
        </View>

        {/* Week Days Section */}
        <View style={styles.weekDaysContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.weekDaysScroll}
          >
            {weekDaysMapping.map((day) => (
              <TouchableOpacity
                key={day.dayOfWeek}
                style={[
                  styles.dayButton,
                  selectedDay === day.dayOfWeek && styles.selectedDayButton,
                ]}
                onPress={() => setSelectedDay(day.dayOfWeek)}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDay === day.dayOfWeek && styles.selectedDayText,
                  ]}
                >
                  {day.short}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Meals Plan Section */}
        <View style={styles.mealsPlanSection}>
          <Text style={styles.mealsPlanTitle}>
            {t("MealScreen.meals_plan_title")} -{" "}
            {weekDaysMapping.find((d) => d.dayOfWeek === selectedDay)?.full}
          </Text>

          {/* Meal Time Tabs */}
          <View style={styles.mealTimeTabs}>
            {mealTimes.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.mealTimeTab,
                  selectedMealTime === time && styles.selectedMealTimeTab,
                ]}
                onPress={() => setSelectedMealTime(time)}
              >
                <Text
                  style={[
                    styles.mealTimeText,
                    selectedMealTime === time && styles.selectedMealTimeText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Meal Items */}
          <View style={styles.mealsList}>
            {filteredMeals.filter((meal) => meal.image).map(renderMealItem)}
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
    paddingTop: Platform.OS === "android" ? hp(4) : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.white,
    fontSize: wp(4),
    fontFamily: fonts.medium,
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
    color: COLORS.white,
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
  mainImageContainer: {
    width: "100%",
    marginBottom: hp(3),
    paddingHorizontal: wp(4),
  },
  mainImage: {
    width: "100%",
    height: hp(25),
    resizeMode: "cover",
    borderRadius: wp(4),
  },
  textContainer: {
    marginTop: hp(1.5),
    paddingHorizontal: wp(2),
  },
  mainTitle: {
    color: COLORS.white,
    fontSize: wp(6),
    fontFamily: fonts.medium,
    marginBottom: hp(0.5),
  },
  mainDescription: {
    color: COLORS.gray2,
    fontSize: wp(3.3),
    fontFamily: fonts.regular,
    opacity: 0.9,
    lineHeight: wp(5),
  },
  weekDaysContainer: {
    paddingHorizontal: wp(4),
    marginBottom: hp(3),
  },
  weekDaysScroll: {
    flexDirection: "row",
  },
  dayButton: {
    backgroundColor: COLORS.backgroundColor,
    paddingVertical: hp(1),
    paddingHorizontal: wp(5),
    borderRadius: wp(6),
    marginRight: wp(2),
    minWidth: wp(13),

    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.3,
    borderColor: COLORS.gray2,
    position: "relative",
  },
  selectedDayButton: {
    backgroundColor: COLORS.primaryColor,
  },
  dayWithMeals: {
    borderColor: COLORS.primaryColor,
    borderWidth: 1,
  },
  dayText: {
    color: COLORS.gray,
    fontSize: wp(3),
    fontFamily: fonts.medium,
  },
  selectedDayText: {
    color: COLORS.white,
  },
  mealIndicator: {
    position: "absolute",
    top: hp(0.5),
    right: wp(1),
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: COLORS.primaryColor,
  },
  mealsPlanSection: {
    paddingHorizontal: wp(4),
  },
  mealsPlanTitle: {
    color: COLORS.white,
    fontSize: wp(5),
    fontFamily: fonts.medium,
    marginBottom: hp(2),
  },
  mealTimeTabs: {
    flexDirection: "row",
    marginBottom: hp(2),
    flexWrap: "wrap",
  },
  mealTimeTab: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(4),
    borderRadius: wp(5),
    marginRight: wp(2),
    marginBottom: hp(1),
    backgroundColor: COLORS.backgroundColor,
    borderWidth: 0.3,
    borderColor: COLORS.gray3,
  },
  selectedMealTimeTab: {
    backgroundColor: COLORS.primaryColor,
  },
  mealTimeText: {
    color: COLORS.gray3,
    fontSize: wp(3),
    fontFamily: fonts.medium,
  },
  selectedMealTimeText: {
    color: COLORS.white,
    fontFamily: fonts.medium,
  },
  mealsList: {
    marginTop: hp(1),
  },
  mealItem: {
    flexDirection: "row",
    backgroundColor: "rgba(45, 45, 47, 1)",
    borderRadius: wp(3),
    marginBottom: hp(2),
    overflow: "hidden",
    alignItems: "center",
    padding: wp(3),
  },
  mealItemImage: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(2),
    marginRight: wp(3),
  },
  mealItemContent: {
    flex: 1,
    paddingVertical: hp(0.5),
  },
  mealItemTitle: {
    color: COLORS.white,
    fontSize: wp(4),
    fontFamily: fonts.medium,
  },
  mealItemDescription: {
    color: COLORS.gray2,
    fontSize: wp(3),
    fontFamily: fonts.regular,
    marginBottom: hp(0.5),
    lineHeight: wp(4.5),
  },
  mealItemTime: {
    color: COLORS.primaryColor,
    fontSize: wp(3),
    fontFamily: fonts.regular,
    flex: 1,
  },
  mealItemIngredients: {
    color: COLORS.gray2,
    fontSize: wp(2.5),
    fontFamily: fonts.regular,
    marginTop: hp(0.3),
    fontStyle: "italic",
  },
  startButton: {
    backgroundColor: COLORS.primaryColor,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: wp(3),
    fontFamily: fonts.medium,
  },
  noMealsContainer: {
    padding: wp(4),
    alignItems: "center",
  },
  noMealsText: {
    color: COLORS.gray2,
    fontSize: wp(3.5),
    fontFamily: fonts.medium,
    textAlign: "center",
    marginBottom: hp(0.5),
  },
  noMealsSubText: {
    color: COLORS.gray2,
    fontSize: wp(3),
    fontFamily: fonts.regular,
    textAlign: "center",
    opacity: 0.7,
  },
  startBtn: {
    backgroundColor: COLORS.primaryColor,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
  },
});
