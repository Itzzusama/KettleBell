"use client";

import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import fonts from "../../../assets/fonts";
import { Icons } from "../../../assets/icons";
import { COLORS } from "../../../utils/COLORS";
import { GetApiRequest } from "../../../services/api";
import { useEffect, useState } from "react";
import MyWorkoutPlans from "../../../components/Modals/MyWorkoutPlans";
import AssignWorkout from "../../../components/Modals/AssignWorkout";

// Custom Progress Semicircle component
const ProgressCircle = ({
  percentage,
  completedColor = "#FFB800",
  remainingColor = COLORS.gray3,
  size = wp(60),
  strokeWidth = wp(4),
}) => {
  const route = useRoute();
  const radius = (size - strokeWidth) / 2;
  const client = route.params?.client;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const [clientInfo, setClientInfo] = useState([]);

  const getClient = async () => {
    try {
      const response = await GetApiRequest(`api/clients/${client?.id}`);
      setClientInfo(response.data?.data);
    } catch (error) {}
  };
  useEffect(() => {
    getClient();
  }, []);
  return (
    <View style={styles.progressCircleContainer}>
      <Svg width={size} height={size / 2 + strokeWidth}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={remainingColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          transform={`rotate(180, ${size / 2}, ${size / 2})`}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={completedColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(180, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={styles.progressContent}>
        <Text style={styles.emojiIcon}>😊</Text>
        <Text style={styles.progressPercentage}>{percentage}%</Text>
        <Text style={styles.progressLabel}>Consumed</Text>
      </View>
    </View>
  );
};

export default function ProfileDashboard({ route }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const client = route.params?.client;

  const dailyProgress = {
    consumed: 64.87,
    remaining: 300,
    target: 1200,
  };

  const weeklyProgress = {
    calories: 1284,
    burnFat: 29,
    completedExercise: 65,
    uncompletedExercise: 85,
  };

  // const workoutPlans = [
  //   {
  //     id: 1,
  //     title: "Kettlebell Fundamentals",
  //     exercises: 9,
  //     days: 5,
  //     image:
  //       "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  //   },
  // ];

  const recentWorkouts = [
    {
      id: 1,
      title: "Kettlebell Swing",
      description: "Focus on hip hinge & explosive movement",
      duration: "5 min",
      completion: 80,
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 2,
      title: "Kettlebell Press",
      description: "Strengthen upper body with controlled presses",
      duration: "7 min",
      completion: 75,
      image:
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
  ];

  const recentNutrition = [
    // Custom Progress Semicircle component

    {
      id: 1,
      title: "Weight Loss",
      description:
        "A delicious and nutritious bowl packed with protein to fuel workouts",
      time: "9:00 am",
      completion: 90,
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 2,
      title: "Weight Loss",
      description:
        "A delicious and nutritious bowl packed with protein to fuel workouts",
      time: "5:00 am",
      completion: 90,
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
  ];

  const [assignWorkoutModal, setAssignWorkoutModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState([]);

  const [plan, setPlan] = useState("");

  const getClientPlan = async () => {
    try {
      const response = await GetApiRequest(`api/clients/${client?.id}/plans`);
      setWorkoutPlans(response.data?.data?.assignedWorkoutPlans);
    } catch (error) {}
  };

  useEffect(() => {
    getClientPlan();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
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
          <Ionicons name="arrow-back" size={hp(3)} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("ClientProgress.title")}</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons
            name="ellipsis-vertical"
            size={hp(3)}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1618641986557-1ecd230959aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editButton}>
              <MaterialCommunityIcons
                name="message-text-outline"
                size={hp(2)}
                color="white"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{"Madison Smith"}</Text>
          <Text style={styles.profileEmail}>madisons@example.com</Text>
        </View>

        {/* Daily Progress */}
        <View style={styles.sectionContainer2}>
          <Text style={styles.sectionTitle}>{t("ClientProgress.title2")}</Text>
          <View style={styles.dailyProgressContainer}>
            <ProgressCircle percentage={dailyProgress.consumed} />
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{dailyProgress.remaining}</Text>
                <Text style={styles.statLabel}>
                  {t("ClientProgress.Remaining")}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{dailyProgress.target}</Text>
                <Text style={styles.statLabel}>
                  {t("ClientProgress.target")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Progress */}
        <View style={styles.sectionContainer2}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("ClientProgress.weekly_progress_title")}
            </Text>
            <View style={styles.caloriesBadge}>
              <Text style={styles.caloriesText}>
                {t("ClientProgress.exercise")}
              </Text>
            </View>
          </View>
          <View style={styles.weeklyProgressContainer}>
            <View style={styles.caloriesContainer}>
              <Text style={styles.caloriesLabel}>
                {t("ClientProgress.calories")}
              </Text>
              <View style={styles.caloriesRow}>
                <Image source={Icons.flame} style={styles.caloriesIcon} />
                <Text style={styles.caloriesNumber}>
                  {weeklyProgress.calories.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.progressCircles}>
              <View style={styles.progressCircleItem}>
                <Progress.Circle
                  size={wp(18)}
                  progress={weeklyProgress.burnFat / 100}
                  thickness={wp(1.8)}
                  color="#FFB800"
                  unfilledColor={COLORS.gray3}
                  borderWidth={0}
                  showsText={true}
                  textStyle={styles.circleText}
                  formatText={() => `${weeklyProgress.burnFat}%`}
                />
                <Text style={styles.circleLabel}>
                  {t("ClientProgress.burn_fat_label")}
                </Text>
              </View>
              <View style={styles.progressCircleItem}>
                <Progress.Circle
                  size={wp(18)}
                  progress={weeklyProgress.completedExercise / 100}
                  thickness={wp(1.8)}
                  color="#3585FE"
                  unfilledColor={COLORS.gray3}
                  borderWidth={0}
                  showsText={true}
                  textStyle={styles.circleText}
                  formatText={() => `${weeklyProgress.completedExercise}%`}
                />
                <Text style={styles.circleLabel}>
                  {t("ClientProgress.completed_exercise_label")}
                </Text>
              </View>
              <View style={styles.progressCircleItem}>
                <Progress.Circle
                  size={wp(18)}
                  progress={weeklyProgress.uncompletedExercise / 100}
                  thickness={wp(1.8)}
                  color="#7876F5"
                  unfilledColor={COLORS.gray3}
                  borderWidth={0}
                  showsText={true}
                  textStyle={styles.circleText}
                  formatText={() => `${weeklyProgress.uncompletedExercise}%`}
                />
                <Text style={styles.circleLabel}>
                  {t("ClientProgress.uncompleted_exercise_label")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Active Workout Plans */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("ClientProgress.active_workout_plan_title")}
            </Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => setTaskModal(true)}
            >
              <Text style={styles.seeAllText}>{t("Assign Plan")}</Text>
            </TouchableOpacity>
          </View>
          {workoutPlans?.map((plan) => (
            <TouchableOpacity key={plan.id} style={styles.workoutCard}>
              <Image
                source={{ uri: plan?.image }}
                style={styles.workoutCardImage}
              />
              <View style={styles.workoutCardOverlay}>
                <Text style={styles.workoutCardTitle}>
                  {plan?.workoutPlan?.name}
                </Text>
                <View style={styles.workoutCardStats}>
                  <Text style={styles.workoutCardStat}>
                    {plan.exercises} {t("ClientProgress.exercise")}
                  </Text>
                  <Text style={styles.workoutCardStat}>
                    {plan?.workoutPlan?.numberOfWeeks} Weeks
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Workout */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("ClientProgress.recent_workout")}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>
                {t("ClientProgress.seeall")}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentWorkoutScroll}
          >
            {recentWorkouts.map((workout) => (
              <TouchableOpacity key={workout.id} style={styles.recentCard}>
                <Image
                  source={{ uri: workout.image }}
                  style={styles.recentCardImage}
                />
                <View style={styles.recentCardOverlay}>
                  <View style={styles.recentCardContent}>
                    <Text style={styles.recentCardTitle}>{workout.title}</Text>
                    <Text style={styles.recentCardDuration}>
                      {workout.duration}
                    </Text>
                  </View>
                  <View style={styles.recentCardFooter}>
                    <Text style={styles.recentCardDescription}>
                      {workout.description}
                    </Text>
                    <View style={styles.completionBadge}>
                      <Progress.Circle
                        size={wp(10)}
                        progress={workout.completion / 100}
                        thickness={wp(1.2)}
                        color={COLORS.primaryColor}
                        unfilledColor={COLORS.gray3}
                        borderWidth={0}
                        showsText={true}
                        textStyle={styles.completionText}
                        formatText={() => `${workout.completion}%`}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Nutrition */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("ClientProgress.recentNutrition")}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>
                {t("ClientProgress.seeall")}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.nutritionScroll}
          >
            {recentNutrition.map((nutrition) => (
              <TouchableOpacity key={nutrition.id} style={styles.nutritionCard}>
                <Image
                  source={{ uri: nutrition.image }}
                  style={styles.nutritionCardImage}
                />
                <View style={styles.nutritionCardOverlay}>
                  <View style={styles.nutritionCardContent}>
                    <Text style={styles.nutritionCardTime}>
                      Time: {nutrition.time}
                    </Text>
                    <Text style={styles.nutritionCardTitle}>
                      {nutrition.title}
                    </Text>
                    <Text style={styles.nutritionCardDescription}>
                      {nutrition.description}
                    </Text>
                  </View>
                  <View style={styles.nutritionCompletionContainer}>
                    <Progress.Bar
                      progress={nutrition.completion / 100}
                      width={wp(60)}
                      height={hp(0.8)}
                      color={COLORS.primaryColor}
                      unfilledColor={COLORS.gray3}
                      borderWidth={0}
                      borderRadius={hp(0.4)}
                    />
                    <Text style={styles.nutritionCompletionText}>
                      {nutrition.completion}
                      {t("ClientProgress.complete")}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <MyWorkoutPlans
        isVisible={taskModal}
        onDisable={() => setTaskModal(false)}
        plan={plan}
        setPlan={setPlan}
        onPress={() => {
          setTaskModal(false);
          setTimeout(() => {
            setAssignWorkoutModal(true);
          }, 800);
        }}
      />
      <AssignWorkout
        isVisible={assignWorkoutModal}
        onDisable={() => setAssignWorkoutModal(false)}
        plan={plan}
        clientId={client?.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    paddingTop: hp(5),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    fontSize: hp(2.5),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  menuButton: {
    padding: wp(2),
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: hp(4),
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: hp(2.5),
  },
  profileImage: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFB800",
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#888888",
  },
  sectionContainer: {
    marginBottom: hp(4),
    paddingHorizontal: wp(5),
  },
  sectionContainer2: {
    marginBottom: hp(4),
    backgroundColor: "#2A2A2A",
    marginHorizontal: wp(5),
    borderRadius: wp(4),
    padding: hp(2.5),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: COLORS.white,
  },
  caloriesBadge: {
    backgroundColor: "#FFB800",
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.7),
    borderRadius: wp(2),
  },
  caloriesText: {
    fontSize: hp(1.4),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  seeAllButton: {
    backgroundColor: "#FFB800",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(2),
  },
  seeAllText: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  seeAllLink: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: COLORS.white,
  },
  dailyProgressContainer: {
    alignItems: "center",
  },
  progressCircleContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(4),
  },
  progressContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: wp(10),
  },
  emojiIcon: {
    fontSize: hp(3.5),
    marginBottom: hp(1.2),
  },
  progressPercentage: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: COLORS.white,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#888888",
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(60),
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: COLORS.white,
  },
  statLabel: {
    fontSize: hp(1.6),
    fontFamily: fonts.regular,
    color: "#888888",
  },
  weeklyProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  caloriesContainer: {
    alignItems: "flex-start",
  },
  caloriesLabel: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#888888",
  },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  caloriesIcon: {
    width: wp(4),
    height: wp(4),
    resizeMode: "contain",
  },
  caloriesNumber: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: COLORS.white,
  },
  progressCircles: {
    flexDirection: "row",
    gap: wp(3),
  },
  progressCircleItem: {
    alignItems: "center",
  },
  circleText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: COLORS.white,
  },
  circleLabel: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: "#888888",
    textAlign: "center",
    marginTop: hp(0.7),
    maxWidth: wp(18),
  },
  workoutCard: {
    position: "relative",
    borderRadius: wp(4),
    overflow: "hidden",
    height: hp(28),
    width: wp(90),
    alignSelf: "center",
  },
  workoutCardImage: {
    width: "100%",
    height: "100%",
  },
  workoutCardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: hp(2.5),
  },
  workoutCardTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: COLORS.white,
  },
  workoutCardStats: {
    flexDirection: "row",
    gap: wp(5),
    justifyContent: "space-between",
    alignItems: "center",
  },
  workoutCardStat: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: COLORS.white,
  },
  recentWorkoutScroll: {
    flexGrow: 0,
  },
  recentCard: {
    position: "relative",
    borderRadius: wp(4),
    overflow: "hidden",
    height: hp(28),
    width: wp(70),
    marginRight: wp(4),
  },
  recentCardImage: {
    width: "100%",
    height: "100%",
  },
  recentCardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: hp(2),
    flexDirection: "column",
  },
  recentCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },
  recentCardTitle: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  recentCardDescription: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: "#888888",
    marginBottom: hp(0.7),
    maxWidth: wp(40),
  },
  recentCardDuration: {
    fontSize: hp(1.6),
    fontFamily: fonts.medium,
    color: "#FFB800",
  },
  recentCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completionBadge: {
    alignItems: "center",
  },
  completionText: {
    fontSize: hp(1.2),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  nutritionScroll: {
    flexGrow: 0,
  },
  nutritionCard: {
    position: "relative",
    borderRadius: wp(4),
    overflow: "hidden",
    height: hp(28),
    width: wp(70), // Increased width for consistency
    marginRight: wp(4),
  },
  nutritionCardImage: {
    width: "100%",
    height: "100%",
  },
  nutritionCardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: hp(2),
  },
  nutritionCardContent: {
    marginBottom: hp(1.2),
  },
  nutritionCardTime: {
    fontSize: hp(1.4),
    fontFamily: fonts.regular,
    color: COLORS.primaryColor,
  },
  nutritionCardTitle: {
    fontSize: hp(1.8),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  nutritionCardDescription: {
    fontSize: hp(1.3),
    fontFamily: fonts.regular,
    color: "#888888",
    lineHeight: hp(1.6),
  },
  nutritionCompletionContainer: {
    alignItems: "flex-start",
  },
  nutritionCompletionText: {
    fontSize: hp(1.3),
    fontFamily: fonts.medium,
    color: COLORS.white,
    alignSelf: "flex-end",
  },
});
