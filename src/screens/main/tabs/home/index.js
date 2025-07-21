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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Svg, { Circle, G } from "react-native-svg";
import { useSelector } from "react-redux";
import fonts from "../../../../assets/fonts";
import { Icons } from "../../../../assets/icons";
import { Images } from "../../../../assets/images";
import RouteName from "../../../../navigation/RouteName";
import { GetApiRequest } from "../../../../services/api";
import { COLORS } from "../../../../utils/COLORS";

const { width } = Dimensions.get("window");

const ProgressCircle = ({
  percentage,
  color,
  size = wp(15),
  strokeWidth = wp(1.5),
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.white}
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
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[styles.percentageContainer, { width: size, height: size }]}>
        <Text style={[styles.percentageText, { fontSize: size * 0.25 }]}>
          {percentage}%
        </Text>
      </View>
    </View>
  );
};

const Home = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { userData } = useSelector((state) => state.progress);
  const profileImageUri = userData.profilePicture;
  const userName = userData.name;
  const [workdata, setWorkoutPlans] = useState([]);
  const [exercisesState, setExercisesState] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchInitialData();
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [exercisesRes, workoutRes] = await Promise.all([
        GetApiRequest("api/exercises"),
        GetApiRequest("api/workout-plans"),
      ]);

      console.log("Workout plans response:", workoutRes?.data);
      // console.log("Exercises response:", exercisesRes?.data);

      if (exercisesRes?.data?.data) {
        setExercisesState(exercisesRes.data.data);
      } else {
        console.log("No exercises found");
        setExercisesState([]);
      }

      if (workoutRes?.data) {
        setWorkoutPlans(workoutRes.data);
      } else {
        console.log("No workout plans found");
        setWorkoutPlans([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load data");
      setExercisesState([]);
      setWorkoutPlans([]);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

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
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="chatbubble-outline" size={wp(6)} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="notifications-outline"
                size={wp(6)}
                color="#FFF"
              />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton}>
              <Image
                source={{ uri: profileImageUri }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={wp(5)} color="#FFFFFF" />
            <TextInput
              style={styles.searchInput}
              placeholder={t("Exercise.search_placeholder")}
              placeholderTextColor="#FFFFFF"
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            marginBottom: hp(3),
            gap: wp(2),
            marginHorizontal: wp(5),
            justifyContent: "space-between",
          }}
        >
          {[
            { title: "Active Plans", value: "03" },
            { title: "Total Exercise", value: "03" },
            { title: "Completed Exercise", value: "03" },
          ].map((item, index) => (
            <View
              key={index}
              style={[
                styles.statCard,
                {
                  backgroundColor: COLORS.primaryColor,
                  padding: wp(4),
                  borderRadius: wp(4),
                  gap: hp(2),
                  width: width < 400 ? "48%" : "30%",
                  marginBottom: wp(2),
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: wp(4),
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.medium,
                    fontSize: 9,
                    color: "#5D5D5D",
                    width:
                      item.title === "Completed Exercise" ? wp(15) : undefined,
                  }}
                >
                  {item.title}
                </Text>
                <View
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: 100,
                    padding: 2,
                  }}
                >
                  <Image
                    source={Icons.dumble}
                    style={{
                      width: wp(3),
                      height: wp(3),
                      resizeMode: "contain",
                    }}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: hp(1),
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.medium,
                    fontSize: 20,
                    color: "white",
                  }}
                >
                  {item.value}
                </Text>
                <Ionicons name="arrow-up" size={wp(4)} color="#FFF" />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.weeklyProgressContainer}>
          <View style={styles.sectionHeader}>
            <Text
              style={{
                fontSize: 12,
                fontFamily: fonts.semiBold,
                color: "#FFF",
              }}
            >
              {t("Home.weekly_progress_title")}
            </Text>
            <LinearGradient
              colors={["#FFBB02", "#FFBB02"]}
              style={styles.seeAllButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.seeAllText}>{t("Home.exercise_button")}</Text>
            </LinearGradient>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.caloriesSection}>
              <Text style={styles.caloriesLabel}>
                {t("Home.calories_label")}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Image
                  source={Icons.flame}
                  style={{ resizeMode: "contain", width: hp(2), height: hp(2) }}
                />
                <Text style={styles.caloriesValue}>1,294</Text>
              </View>
            </View>

            <View style={styles.progressCircles}>
              <View style={styles.progressItem}>
                <ProgressCircle percentage={29} color="#FEC635" />
                <Text style={styles.progressLabel}>
                  {t("Home.burn_fat_label")}
                </Text>
              </View>

              <View style={styles.progressItem}>
                <ProgressCircle percentage={65} color="#3585FE" />
                <Text style={styles.progressLabel}>
                  {t("Home.completed_exercise_label")}
                </Text>
              </View>

              <View style={styles.progressItem}>
                <ProgressCircle percentage={85} color="#7876F5" />
                <Text style={styles.progressLabel}>
                  {t("Home.uncompleted_exercise_label")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("Home.active_workout_plan_title")}
            </Text>
            <TouchableOpacity
            // onPress={() => navigation.navigate(RouteName.WorkoutPlans)}
            >
              <Text style={styles.seeAllLink}>{t("Home.see_all_link")}</Text>
            </TouchableOpacity>
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
            {workdata?.data && workdata.data.length > 0 ? (
              workdata.data.map((workout, index) => (
                <TouchableOpacity
                  key={workout.id}
                  onPress={() =>
                    navigation.navigate(RouteName.WorkoutPlans_Details, {
                      workoutId: workout.id,
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
                        workout.images?.[0] ||
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
                        {workout.name}
                      </Text>
                      <View style={styles.workoutMeta}>
                        <Text style={styles.workoutDetails} numberOfLines={1}>
                          {workout.exercisesCount}{" "}
                          {workout.exercisesCount === 1
                            ? "exercise"
                            : "exercises"}
                        </Text>
                        <Text style={styles.workoutDuration}>
                          {workout.numberOfWeeks}{" "}
                          {workout.numberOfWeeks === 1 ? "week" : "weeks"}
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

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("Home.recommended_exercise_title")}
            </Text>
            <TouchableOpacity
            // onPress={() => navigation.navigate(RouteName.Exercises)}
            >
              <Text style={styles.seeAllLink}>{t("Home.see_all_link")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalScrollContainer}>
            <FlatList
              data={exercisesState}
              renderItem={renderExercise}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalExerciseList}
              ListEmptyComponent={
                <Text style={styles.noWorkoutsText}>No exercises found</Text>
              }
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: hp(6),
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: hp(2),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2),
  },
  img: {
    width: hp(4),
    height: hp(4),
    resizeMode: "contain",
  },
  welcomeText: {
    color: "#FFF",
    fontSize: wp(4),
    fontFamily: fonts.medium,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: wp(2),
    marginRight: wp(2),
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: wp(1.5),
    right: wp(1.5),
    width: wp(2),
    height: wp(2),
    borderRadius: wp(5),
    backgroundColor: "#4CAF50",
  },
  profileButton: {
    marginLeft: wp(2),
  },
  profileImage: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
  },
  searchContainer: {
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
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
  },
  statCard: {
    flex: 1,
    padding: wp(4),
    borderRadius: wp(4),
    position: "relative",
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
  sectionTitle: {
    color: "#FFF",
    fontSize: wp(4.5),
    fontFamily: fonts.medium,
  },
  seeAllButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(1),
  },
  seeAllText: {
    color: "#FFF",
    fontSize: wp(3),
    fontFamily: fonts.regular,
  },
  seeAllLink: {
    color: "#FFF",
    fontSize: wp(3.5),
    fontFamily: fonts.medium,
    marginRight: wp(2.3),
  },
  progressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  caloriesSection: {
    flex: 1,
  },
  caloriesLabel: {
    color: "#888",
    fontSize: wp(3),
    marginBottom: hp(0.5),
    fontFamily: fonts.regular,
  },
  caloriesValue: {
    color: "#FFF",
    fontSize: 17,
    fontFamily: fonts.semiBold,
  },
  progressCircles: {
    flexDirection: "row",
    gap: wp(4),
  },
  progressItem: {
    alignItems: "center",
  },
  percentageContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  progressLabel: {
    color: "#888",
    fontSize: wp(2.1),
    textAlign: "center",
    marginTop: hp(1),
    maxWidth: wp(15),
    fontFamily: fonts.regular,
  },
  sectionContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(3),
  },
  workoutCardScrollable: {
    width: wp(85),
    marginRight: wp(3),
  },
  scrollViewContent: {
    // paddingHorizontal: wp(5),
    paddingVertical: hp(1),
  },
  emptyScrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(4),
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
  },
  workoutCard: {
    borderRadius: wp(4),
    overflow: "hidden",
    marginBottom: hp(2),
    position: "relative",
    height: hp(25),
  },
  workoutImage: {
    width: "100%",
    height: "100%",
  },
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
  workoutInfo: {
    // alignItems: 'flex-start',
  },
  workoutTitle: {
    color: "#FFF",
    fontSize: wp(5),
    fontFamily: fonts.medium,
  },
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
  workoutDuration: {
    color: "#FFF",
    fontSize: wp(3.5),
  },
  horizontalScrollContainer: {
    marginBottom: hp(3),
  },
  horizontalExerciseList: {
    // paddingHorizontal: wp(4),
    paddingBottom: wp(2),
  },
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
  exerciseInfo: {
    // alignItems: 'flex-start',
  },
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
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Home;
