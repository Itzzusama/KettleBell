import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
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

import { useSelector } from "react-redux";

import fonts from "../../../../assets/fonts";
import { Icons } from "../../../../assets/icons";
import { Images } from "../../../../assets/images";
import RouteName from "../../../../navigation/RouteName";
import { GetApiRequest } from "../../../../services/api";
import { COLORS } from "../../../../utils/COLORS";
import { coachInfo } from "../../../../utils/coachInfo";
import StatsSection from "../molecules/StatsSection";
import MealPlanCard from "../../../../components/MealPlanCard";
import HealthNote from "../../../../components/HealthNote";

const { width } = Dimensions.get("window");

const Home = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { userData } = useSelector((state) => state.users);
  const clientId = userData?._id;
  const profileImageUri = userData?.avatar;
  const [loading, setLoading] = useState(true);
  const userName = userData?.name || "User";
  const [stats, setStats] = useState({});
  const [workdata, setWorkoutPlans] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { unseenNoti } = useSelector((state) => state?.authConfigs);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStats();
      await fetchInitialData();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };
  const fetchStats = async () => {
    try {
      const res = await GetApiRequest(`api/users/dashboard-stats/${clientId}`);
      if (res?.data?.success) {
        // console.log(res?.data);
        setStats(res?.data?.data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const fetchInitialData = async () => {
    try {
      if (!clientId) return;

      const [workoutRes] = await Promise.all([
        GetApiRequest(`api/clients/${clientId}/plans`),
      ]);

      setWorkoutPlans(workoutRes?.data?.data?.workoutPlans || []);
      setMealPlans(workoutRes?.data?.data?.mealPlans);
    } catch (error) {
      setWorkoutPlans([]);
      setMealPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchStats();
      fetchInitialData();
    }
  }, [clientId]);

  return (
    <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image source={Images.SplashImage} style={styles.img} />
          </View>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 9,
                fontFamily: fonts.regular,
                color: "#5D5D5D",
              }}
            >
              Welcome!
            </Text>
            <Text style={styles.welcomeText}>{userName}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate("InboxScreen", { client: coachInfo() })
            }
          >
            <Ionicons name="chatbubble-outline" size={wp(6)} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate(RouteName.Notifications)}
            style={styles.iconButton}
          >
            <Ionicons
              name="notifications-outline"
              size={wp(6.5)}
              color="#FFF"
            />
            {unseenNoti > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
          <View style={styles.profileButton}>
            <Image
              source={{ uri: profileImageUri }}
              style={styles.profileImage}
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: hp(10) }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primaryColor]}
            tintColor={COLORS.primaryColor}
          />
        }
      >
        <StatsSection stats={stats} />
        {!loading && workdata?.length === 0 && mealPlans?.length === 0 ? (
          <View style={styles.noDataCard}>
            <Ionicons
              name="sparkles-outline"
              size={wp(12)}
              color={COLORS.primaryColor}
            />
            <Text style={styles.noDataTitle}>No Plans Yet 🎯</Text>
            <Text style={styles.noDataText}>
              Your coach hasn’t assigned you any workout or meal plans yet.
              Please check back later.
            </Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate("InboxScreen", { client: coachInfo() })
              }
            >
              <Text style={styles.actionButtonText}>Message Coach</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.sectionContainer}>
              {workdata?.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      {t("Home.active_workout_plan_title")}
                    </Text>
                  </View>

                  <FlatList
                    data={workdata}
                    keyExtractor={(item) => item.id?.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: wp(3) }}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                          navigation.navigate(RouteName.WorkoutPlans_Details, {
                            workoutId: item?.workoutPlan?._id,
                          })
                        }
                        style={[
                          styles.workoutCard,
                          styles.workoutCardScrollable,
                          index === 0 && { marginLeft: wp(0.5) },
                        ]}
                      >
                        <Image
                          source={{
                            uri:
                              item?.workoutPlan?.thumbnail ||
                              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop",
                          }}
                          style={styles.workoutImage}
                          resizeMode="cover"
                          defaultSource={require("../../../../assets/images/onboarding1.png")}
                        />

                        <LinearGradient
                          colors={["transparent", "rgba(0,0,0,0.8)"]}
                          style={styles.workoutOverlay}
                        >
                          <View style={styles.workoutInfo}>
                            <Text style={styles.workoutTitle} numberOfLines={1}>
                              {item?.workoutPlan?.name}
                            </Text>
                            <View style={styles.workoutMeta}>
                              <Text style={styles.workoutDuration}>
                                {item?.workoutPlan?.numberOfWeeks}{" "}
                                {item?.workoutPlan?.numberOfWeeks === 1
                                  ? "week"
                                  : "weeks"}
                              </Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  />
                </>
              )}
            </View>

            <View style={styles.sectionContainer}>
              {mealPlans?.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      {t("Nutrition.active_meal_plan_title")}
                    </Text>
                  </View>
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
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/* ======================= STYLES ======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: hp(6),
  },
  scrollView: { flex: 1, backgroundColor: COLORS.backgroundColor },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: hp(2),
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logoContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2),
  },
  img: { width: hp(4), height: hp(4), resizeMode: "contain" },
  welcomeText: { color: "#FFF", fontSize: wp(4), fontFamily: fonts.medium },
  headerRight: { flexDirection: "row", alignItems: "center" },
  iconButton: { padding: wp(2), marginRight: wp(0.5), position: "relative" },
  notificationDot: {
    position: "absolute",
    top: wp(1.5),
    right: 9,
    width: wp(2),
    height: wp(2),
    borderRadius: wp(5),
    backgroundColor: "#4CAF50",
  },
  profileButton: { marginLeft: wp(2) },
  profileImage: { width: wp(8), height: wp(8), borderRadius: wp(5) },

  searchContainer: { paddingHorizontal: wp(4), marginBottom: hp(2) },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    borderWidth: 0.3,
    borderColor: COLORS.gray2,
    height: hp(7),
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: wp(3),
    marginLeft: wp(3),
    fontFamily: fonts.regular,
    top: 3,
  },

  statCard: {
    backgroundColor: COLORS.primaryColor,
    padding: wp(3),
    borderRadius: wp(3),
    marginBottom: hp(2),
  },
  statTitle: {
    color: "#EEE",
    fontSize: wp(3),
    fontFamily: fonts.regular,
    marginBottom: hp(0.5),
  },
  statValue: {
    color: "#FFF",
    fontSize: wp(4.5),
    fontFamily: fonts.semiBold,
  },

  weeklyProgressContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(3),
    backgroundColor: "#2D2D2F",
    borderRadius: wp(5),
    paddingVertical: wp(5),
    marginHorizontal: wp(4),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },
  seeAllButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(1),
  },
  seeAllText: { color: "#FFF", fontSize: wp(3), fontFamily: fonts.regular },

  progressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  caloriesSection: { flex: 1 },
  caloriesLabel: {
    color: "#888",
    fontSize: wp(3),
    marginBottom: hp(0.5),
    fontFamily: fonts.regular,
  },
  caloriesValue: { color: "#FFF", fontSize: 17, fontFamily: fonts.semiBold },

  progressCircles: { flexDirection: "row", gap: wp(4) },
  progressItem: { alignItems: "center" },
  percentageContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: { color: "#FFF", fontWeight: "bold" },
  progressLabel: {
    color: "#888",
    fontSize: wp(2.1),
    textAlign: "center",
    marginTop: hp(1),
    maxWidth: wp(18),
    fontFamily: fonts.regular,
  },

  /* Chips (for streak) */
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1.2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: wp(3),
  },
  chipNeutral: { backgroundColor: "#FFD66B" },
  chipText: {
    color: "#0B0B0C",
    fontSize: wp(3.2),
    fontFamily: fonts.semiBold || fonts.medium,
  },

  sectionContainer: { paddingHorizontal: wp(5) },
  sectionTitle: { color: "#FFF", fontSize: wp(4), fontFamily: fonts.medium },

  workoutCardScrollable: { width: 220, marginRight: wp(3) },
  scrollViewContent: { paddingVertical: hp(1), marginBottom: 10 },
  emptyScrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noWorkoutsContainer: {
    width: width - wp(10),
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(5),
  },
  noWorkoutsText: {
    color: COLORS.white,
    fontSize: wp(4),
    fontFamily: fonts.medium,
    textAlign: "center",
    opacity: 0.7,
    alignSelf: "center",
  },

  workoutCard: {
    borderRadius: wp(4),
    overflow: "hidden",

    position: "relative",
    height: 220,
    marginBottom: 20,
  },
  workoutImage: { width: "100%", height: "100%" },
  workoutOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  workoutInfo: {},
  workoutTitle: { color: "#FFF", fontSize: wp(5), fontFamily: fonts.medium },
  workoutMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  workoutDetails: {
    color: "#FFF",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
  },
  workoutDuration: { color: "#FFF", fontSize: wp(3.5) },

  horizontalScrollContainer: { marginBottom: hp(3) },
  horizontalExerciseList: { paddingBottom: wp(2) },
  exerciseCard: {
    width: wp(60),
    height: hp(22),
    borderRadius: wp(4),
    overflow: "hidden",
    marginRight: wp(3),
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  exerciseOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    justifyContent: "flex-end",
    paddingHorizontal: wp(3),
    paddingBottom: hp(1.5),
  },
  exerciseInfo: {},
  exerciseTitle: {
    color: "#FFF",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
  },
  exerciseMeta: {
    flexDirection: "row",
    gap: wp(2),
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseDetails: {
    color: "#FFF",
    fontSize: wp(3),
    fontFamily: fonts.regular,
  },
  exerciseDuration: {
    color: "#FFF",
    fontSize: wp(3),
    fontFamily: fonts.regular,
  },
  durationContainer: { flexDirection: "row", alignItems: "center" },
  noDataCard: {
    backgroundColor: "rgba(45, 45, 47, 0.9)",
    borderRadius: wp(5),
    paddingVertical: hp(2),
    paddingHorizontal: wp(6),
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    marginHorizontal: wp(5),
    marginBottom: 50,
  },
  noDataTitle: {
    fontSize: wp(5),
    fontFamily: fonts.semiBold,
    color: "#FFF",
    marginTop: hp(2),
    marginBottom: hp(0.3),
  },
  noDataText: {
    fontSize: wp(3.2),
    color: "#ddd",
    textAlign: "center",
    marginBottom: hp(0.5),
    fontFamily: fonts.regular,
  },
  noDataSubText: {
    fontSize: wp(3.2),
    color: "#aaa",
    textAlign: "center",
    marginBottom: hp(2),
    fontFamily: fonts.regular,
  },
  actionButton: {
    backgroundColor: COLORS.primaryColor,
    paddingVertical: hp(1),
    paddingHorizontal: wp(5),
    borderRadius: wp(3),
    marginTop: hp(1.5),
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: wp(3.5),
    fontFamily: fonts.medium,
  },
  mealList: {
    paddingRight: wp(4),
    marginBottom: 60,
  },
});

export default Home;
