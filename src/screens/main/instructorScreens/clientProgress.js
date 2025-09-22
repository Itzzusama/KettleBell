import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
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
import * as Progress from "react-native-progress";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import fonts from "../../../assets/fonts";
import { COLORS } from "../../../utils/COLORS";
import { GetApiRequest, PutApiRequest } from "../../../services/api";
import { useEffect, useState } from "react";
import MyWorkoutPlans from "../../../components/Modals/MyWorkoutPlans";
import AssignWorkout from "../../../components/Modals/AssignWorkout";
import NoDataFound from "../../../components/NoDataFound";
import RouteName from "../../../navigation/RouteName";
import { LinearGradient } from "expo-linear-gradient";
import ClientInfoCard from "../../../components/ClientInfoCard";
import StatsSection from "../tabs/molecules/StatsSection";

export default function ProfileDashboard({ route }) {
  const navigation = useNavigation();
  const isFocus = useIsFocused();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const client = route.params?.client;
  const [assignWorkoutModal, setAssignWorkoutModal] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [mealLogs, setMealLogs] = useState([]);
  const [workoutLog, setWorkoutLog] = useState([]);
  const [taskModal, setTaskModal] = useState(false);
  const [planType, setPlanType] = useState("");
  const [clientDetail, setClientDetail] = useState({});
  const [plan, setPlan] = useState("");
  const [clientInfo, setClientInfo] = useState({});

  const getClientInfo = async () => {
    try {
      const res = await GetApiRequest(`api/clients/${client?.id}`);
      if (res?.data?.success) {
        console.log(res?.data?.data);
        setClientInfo(res?.data?.data);
      }
    } catch (err) {}
  };

  const getClientPlan = async () => {
    try {
      const response = await GetApiRequest(`api/clients/${client?.id}/plans`);

      setWorkoutPlans(response.data?.data?.workoutPlans);
      setMealPlans(response.data?.data?.mealPlans);
    } catch (error) {}
  };
  const getWorkoutLogs = async () => {
    try {
      const response = await GetApiRequest(
        `api/clients/${client?.id}/workout-logs`
      );

      setWorkoutLog(response.data?.data);
    } catch (error) {}
  };
  const getMealLogs = async () => {
    try {
      const response = await GetApiRequest(
        `api/clients/${client?.id}/meal-logs`
      );

      setMealLogs(response.data?.data);
    } catch (error) {}
  };

  const getAllClientDetail = async () => {
    try {
      const res = await GetApiRequest(
        `api/users/dashboard-stats/${client?.id}`
      );
      if (res?.data?.success) {
        setStats(res?.data?.data);
      }

      setClientDetail(response.data?.data);
    } catch (error) {}
  };

  useEffect(() => {
    getClientInfo();
    getClientPlan();
    getWorkoutLogs();
    getMealLogs();
    getAllClientDetail();
  }, [isFocus, assignWorkoutModal]);

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
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View
              style={{
                padding: 6,
                borderRadius: 99,
                borderWidth: 1,
                borderColor: COLORS.primaryColor,
              }}
            >
              <Image
                source={{
                  uri: client?.image
                    ? client?.image
                    : "https://images.unsplash.com/photo-1618641986557-1ecd230959aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                }}
                style={styles.profileImage}
              />
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(RouteName.InboxScreen, { client })
              }
              style={styles.editButton}
            >
              <MaterialCommunityIcons
                name="message-text-outline"
                size={hp(2)}
                color="white"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>
            {client?.name ? client?.name : "Madison Smith"}
          </Text>
        </View>
        <ClientInfoCard clientInfo={clientInfo} />
        <StatsSection stats={clientDetail} />
        {/* Active Workout Plans */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("Active Workout Plan")}</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => {
                setPlanType("workout");
                setTaskModal(true);
              }}
            >
              <Text style={styles.seeAllText}>{t("Assign Plan")}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={workoutPlans}
            ListEmptyComponent={() => (
              <NoDataFound title={"No Active Workout Plan"} />
            )}
            keyExtractor={(item) => item?._id?.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.workoutCard}>
                <Image
                  source={{ uri: item?.workoutPlan?.images[0] }}
                  style={styles.workoutCardImage}
                />
                <View style={styles.workoutCardOverlay}>
                  <Text style={styles.workoutCardTitle}>
                    {item?.workoutPlan?.name}
                  </Text>
                  <View style={styles.workoutCardStats}>
                    <Text style={styles.workoutCardStat}>
                      {item.exercises} {t("ClientProgress.exercise")}
                    </Text>
                    <Text style={styles.workoutCardStat}>
                      {item?.workoutPlan?.numberOfWeeks} Weeks
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("Active Meal Plan")}</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => {
                setPlanType("meal");
                setTaskModal(true);
              }}
            >
              <Text style={styles.seeAllText}>{t("Assign Plan")}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={mealPlans}
            keyExtractor={(item) => item?._id?.toString()}
            ListEmptyComponent={() => <NoDataFound title={"No Active Plan"} />}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.workoutCard}>
                <Image
                  source={{
                    uri: item?.mealPlan?.images[0] || item?.mealPlan?.banner,
                  }}
                  style={styles.workoutCardImage}
                />
                <View style={styles.workoutCardOverlay}>
                  <Text style={styles.workoutCardTitle}>
                    {item?.mealPlan?.name}
                  </Text>
                  <View style={styles.workoutCardStats}>
                    <Text style={styles.workoutCardStat}>
                      {item.exercises} {t("ClientProgress.exercise")}
                    </Text>
                    <Text style={styles.workoutCardStat}>
                      {item?.mealPlan?.numberOfWeeks} Weeks
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("ClientProgress.recent_workout")}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentWorkoutScroll}
          >
            {workoutLog && workoutLog.length > 0 ? (
              workoutLog?.map((workout) => (
                <TouchableOpacity key={workout._id} style={styles.recentCard}>
                  <Image
                    source={{
                      uri:
                        workout.workoutPlan?.images?.[0] ||
                        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    }}
                    style={styles.recentCardImage}
                  />
                  <View style={styles.recentCardOverlay}>
                    <View style={styles.recentCardContent}>
                      <Text style={styles.recentCardTitle}>
                        {workout.workoutTitle ||
                          workout.workoutPlan?.name ||
                          "Workout"}
                      </Text>
                      <Text style={styles.recentCardDuration}>
                        {workout.timeSlot || ""}
                      </Text>
                    </View>
                    <View style={styles.recentCardFooter}>
                      <Text style={styles.recentCardDescription}>
                        {workout.notes ||
                          workout.workoutPlan?.description ||
                          ""}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <NoDataFound title={"No workout Log"} />
            )}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("ClientProgress.recentNutrition")}
            </Text>
            <TouchableOpacity></TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.nutritionScroll}
          >
            {mealLogs && mealLogs.length > 0 ? (
              mealLogs?.map((meal) => (
                <TouchableOpacity key={meal._id} style={styles.nutritionCard}>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    }}
                    style={styles.nutritionCardImage}
                  />
                  <View style={styles.nutritionCardOverlay}>
                    <View style={styles.nutritionCardContent}>
                      <Text style={styles.nutritionCardTime}>
                        Time: {meal.mealtime || "N/A"}
                      </Text>
                      <Text style={styles.nutritionCardTitle}>
                        {meal.mealDate
                          ? new Date(meal.mealDate).toLocaleDateString()
                          : "N/A"}
                      </Text>
                      <Text style={styles.nutritionCardDescription}>
                        {meal.notes || "No notes available"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <NoDataFound title={"No Meal Log Found"} />
            )}
          </ScrollView>
        </View>
      </ScrollView>

      <MyWorkoutPlans
        isVisible={taskModal}
        onDisable={() => setTaskModal(false)}
        plan={plan}
        setPlan={setPlan}
        type={planType}
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
        type={planType}
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
    marginBottom: hp(1.5),
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
    marginRight: 6,
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
  productivityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productivityItem: {
    alignItems: "center",
    flex: 1,
  },
  productivityNumber: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: COLORS.white,
    marginBottom: hp(0.5),
  },
  productivityLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#888888",
    textAlign: "center",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(2),
  },

  weeklyProgressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(2),
  },

  gradientCard: {
    flex: 1,
    marginHorizontal: wp(1.5),
    borderRadius: wp(5),
    paddingVertical: hp(2.5),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  cardValue: {
    fontSize: wp(6),
    fontFamily: fonts.semiBold,
    color: "#fff",
    marginTop: hp(0.5),
  },

  cardLabel: {
    fontSize: wp(3.2),
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.9)",
    marginTop: hp(0.3),
  },

  circleCard: {
    flex: 1,
    marginHorizontal: wp(1.5),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: hp(2),
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  circleText: {
    fontSize: wp(4),
    fontFamily: fonts.semiBold,
    color: COLORS.primaryColor,
  },

  circleLabel: {
    fontSize: wp(3.2),
    fontFamily: fonts.medium,
    color: "#EEE",
    marginTop: hp(1),
  },
  statusButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.3),
    borderRadius: wp(2),
  },
  statusButtonText: {
    fontSize: hp(1.8),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
});
