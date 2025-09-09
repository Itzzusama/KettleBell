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

const { width } = Dimensions.get("window");

const Home = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { userData } = useSelector((state) => state.users);
  const clientId = userData?._id;
  const profileImageUri = userData?.avatar;
  const userName = userData?.name || "User";
  const [stats, setStats] = useState({});
  const [workdata, setWorkoutPlans] = useState([]);
  const [exercisesState, setExercisesState] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const { unseenNoti } = useSelector((state) => state?.authConfigs);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStats();
      await fetchInitialData();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };
  const fetchStats = async () => {
    try {
      const res = await GetApiRequest(`api/users/dashboard-stats`);
      if (res?.data?.success) {
        setStats(res?.data?.data?.workoutStats);
      }
    } catch (err) {}
  };
  const fetchInitialData = async () => {
    try {
      if (!clientId) return;

      const [exercisesRes, workoutRes, productivityRes] = await Promise.all([
        GetApiRequest("api/exercises"),
        GetApiRequest(`api/clients/${clientId}/plans`),
        GetApiRequest(
          `api/client-productivity/${clientId}/productivity?period=7`
        ),
      ]);

      setExercisesState(exercisesRes?.data?.data || []);
      setWorkoutPlans(workoutRes?.data?.data?.workoutPlans || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load data");
      setExercisesState([]);
      setWorkoutPlans([]);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchStats();
      fetchInitialData();
    }
  }, [clientId]);

  const renderExercise = ({ item }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() =>
        navigation.navigate(RouteName.Exercise_Detail2, {
          exercise: item,
          exercisesState: exercisesState,
        })
      }
    >
      <Image
        source={{
          uri:
            item.images?.[0] ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9n8KUvSF8IZzTvs6t22w1kA4qpaBCyqqrTg&s",
        }}
        style={styles.exerciseImage}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.exerciseOverlay}
      >
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseTitle}>{item.name || "N/A"}</Text>
          <View style={styles.exerciseMeta}>
            <Text style={styles.exerciseDetails}>
              {item.difficulty || "N/A"}
            </Text>
            <View style={styles.durationContainer}>
              <Ionicons name="time-outline" size={wp(3.5)} color="#FEC635" />
              <Text style={styles.exerciseDuration}>
                {item.duration || "N/A"} weeks
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

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
            <Ionicons name="notifications-outline" size={wp(6)} color="#FFF" />
            {unseenNoti > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={{ uri: profileImageUri }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
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

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("Home.active_workout_plan_title")}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollViewContent,
              (!workdata?.data || workdata.data.length === 0) &&
                styles.emptyScrollViewContent,
            ]}
          >
            {workdata?.length > 0 ? (
              workdata.map((workout, index) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={workout.id}
                  onPress={() =>
                    navigation.navigate(RouteName.WorkoutPlans_Details, {
                      workoutId: workout?.workoutPlan?._id,
                    })
                  }
                  style={[
                    styles.workoutCard,
                    styles.workoutCardScrollable,
                    index > 0 && { marginLeft: wp(3) },
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        workout?.workoutPlan?.images?.[0] ||
                        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop",
                    }}
                    style={styles.workoutImage}
                    resizeMode="cover"
                    defaultSource={require("../../../../assets/images/onboarding1.png")}
                    onError={({ nativeEvent: { error } }) => {
                      console.log("Image load error:", error);
                    }}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    style={styles.workoutOverlay}
                  >
                    <View style={styles.workoutInfo}>
                      <Text
                        style={styles.workoutTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {workout?.workoutPlan?.name}
                      </Text>
                      <View style={styles.workoutMeta}>
                        <Text style={styles.workoutDuration}>
                          {workout?.workoutPlan?.numberOfWeeks}{" "}
                          {workout?.workoutPlan?.numberOfWeeks === 1
                            ? "week"
                            : "weeks"}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noWorkoutsContainer}>
                <Text style={styles.noWorkoutsText}>No workouts found</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Recommended Exercises */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("Home.recommended_exercise_title")}
            </Text>
            {/* <TouchableOpacity>
              <Text style={styles.seeAllText}>{t("Home.see_all_link")}</Text>
            </TouchableOpacity> */}
          </View>

          <View style={styles.horizontalScrollContainer}>
            <FlatList
              data={exercisesState}
              renderItem={renderExercise}
              keyExtractor={(item) => item.id?.toString() || String(item._id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalExerciseList}
              ListEmptyComponent={
                <View style={styles.noWorkoutsContainer}>
                  <Text style={styles.noWorkoutsText}>No exercises found</Text>
                </View>
              }
            />
          </View>
        </View>
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
  iconButton: { padding: wp(2), marginRight: wp(2), position: "relative" },
  notificationDot: {
    position: "absolute",
    top: wp(1.5),
    right: wp(1.5),
    width: wp(2),
    height: wp(2),
    borderRadius: wp(5),
    backgroundColor: "#4CAF50",
  },
  profileButton: { marginLeft: wp(2) },
  profileImage: { width: wp(10), height: wp(10), borderRadius: wp(5) },

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
    marginBottom: hp(2),
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
  sectionTitle: { color: "#FFF", fontSize: wp(4.5), fontFamily: fonts.medium },

  workoutCardScrollable: { width: wp(85), marginRight: wp(3) },
  scrollViewContent: { paddingVertical: hp(1) },
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
    marginBottom: hp(2),
    position: "relative",
    height: hp(25),
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
});

export default Home;
