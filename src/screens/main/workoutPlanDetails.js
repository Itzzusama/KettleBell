import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  LayoutAnimation,
  LayoutChangeEvent,
  UIManager,
  Platform,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import fonts from "../../assets/fonts";
import { Images } from "../../assets/images";
import RouteName from "../../navigation/RouteName";
import { GetApiRequest } from "../../services/api";
import { COLORS } from "../../utils/COLORS";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const WorkoutPlanDetails = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [expandedDays, setExpandedDays] = useState({});
  const [workoutDay, setWorkoutDay] = useState([]);
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { workoutId } = route.params;
  const [profile, setProfile] = useState({});
  // Animation refs
  const rotateAnims = useRef([]).current;
  const fadeAnims = useRef([]).current;

  useEffect(() => {
    // Initialize animation values for each workout day
    workoutDay.forEach((_, index) => {
      rotateAnims[index] = new Animated.Value(0);
      fadeAnims[index] = new Animated.Value(0);
    });
  }, [workoutDay]);
  const Profile = async () => {
    try {
      const res = await GetApiRequest("api/auth/me");
      setProfile(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };
  const toggleDay = (dayIndex) => {
    const config = {
      duration: 500,
      update: {
        duration: 500,
        property: LayoutAnimation.Properties.opacity,
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        duration: 500,
        property: LayoutAnimation.Properties.opacity,
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    };

    LayoutAnimation.configureNext(config);

    const isExpanding = !expandedDays[dayIndex];

    // Animate rotation
    Animated.timing(rotateAnims[dayIndex], {
      toValue: isExpanding ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animate content
    Animated.timing(fadeAnims[dayIndex], {
      toValue: isExpanding ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setExpandedDays((prev) => ({
      ...prev,
      [dayIndex]: isExpanding,
    }));
  };

  const fetchWorkoutPlan = async () => {
    if (!workoutId) {
      setError("No workout ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [workoutRes, daysRes] = await Promise.all([
        GetApiRequest(`api/workout-plans/${workoutId}`),
        GetApiRequest(`api/workout-plans/${workoutId}/daily-workouts`),
      ]);

      if (daysRes?.data?.data) {
        setWorkoutDay(daysRes.data.data);
      } else {
        setWorkoutDay([]);
      }

      if (workoutRes?.data?.data) {
        setWorkout(workoutRes.data.data);
      } else {
        setError("No workout data found");
      }
    } catch (error) {
      setError(error.message || "Failed to load workout plan");
      Alert.alert("Error", "Failed to load workout plan details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutPlan();
    Profile();
  }, [workoutId]);

  const handleExercisePress = (detail, id) => {
    navigation.navigate(RouteName.Exercise_Detail, {
      detail: detail,
      workoutId: workoutId,
      clientId: profile?._id,
      catName: workout?.category?.name,
    });
  };
  const renderDayCard = (day, index) => {
    const spin =
      rotateAnims[index]?.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }) || "0deg";

    return (
      <View
        key={index}
        style={[
          styles.dayContainer,
          expandedDays[index] && styles.expandedContainer,
        ]}
      >
        <TouchableOpacity
          style={styles.dayHeader}
          onPress={() => toggleDay(index)}
          activeOpacity={0.8}
        >
          <View style={styles.dayContent}>
            <View style={styles.dayLeftContent}>
              <View style={styles.dayLeftInner}>
                <View style={styles.dumbleContainer}>
                  <Image source={Images.dumble} style={styles.dumbleImage} />
                </View>
                <View>
                  <Text style={styles.dayTitle}>{day.name || "N/A"}</Text>
                  <Text style={styles.dayDescription}>
                    {day.description || "N/A"}
                  </Text>
                  <View style={styles.dayMeta}>
                    <View style={styles.metaItem}>
                      <Image
                        source={Images.dumble}
                        style={styles.dumbleImage2}
                      />
                      <Text style={styles.metaText}>
                        Exercises:{" "}
                        {day.exercisesCount || day.exercises?.length || 0}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.dayRightContent}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons
                  name="chevron-down"
                  size={wp(4)}
                  color={COLORS.white}
                />
              </Animated.View>
              <Image
                source={day.image ? { uri: day.image } : Images.women}
                style={styles.exercisePreview}
                resizeMode="contain"
              />
            </View>
          </View>
        </TouchableOpacity>

        {expandedDays[index] && (
          <Animated.View
            style={[
              styles.exerciseList,
              {
                opacity: fadeAnims[index],
                transform: [
                  {
                    translateY: fadeAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.exerciseListTitle}>
              {day.exercises?.length || 0} Exercises
            </Text>
            {day.exercises?.map((exercise, exerciseIndex) => (
              <TouchableOpacity
                key={exerciseIndex}
                style={styles.exerciseItem}
                onPress={() => handleExercisePress(exercise, day?._id)}
                activeOpacity={0.7}
              >
                <Image
                  source={{
                    uri:
                      exercise.image ||
                      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=80&fit=crop",
                  }}
                  style={styles.exerciseImage}
                />
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseFocus}>{exercise.focus}</Text>
                  <View style={styles.exerciseMeta}>
                    <Text style={styles.exerciseEquipment} numberOfLines={2}>
                      {exercise.equipment}
                    </Text>
                    <View style={styles.exerciseDuration}>
                      <Ionicons
                        name="time"
                        size={wp(3)}
                        color={COLORS.primaryColor}
                      />
                      <Text style={styles.exerciseDurationText}>
                        {exercise.duration}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>
    );
  };

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
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={wp(6)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("WorkoutPlanDetails.header_title")}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesScrollView}
          >
            {(workout?.images?.length > 0
              ? workout.images
              : [
                  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
                ]
            ).map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.heroOverlay}>
          <Text style={styles.workoutTitle}>{workout?.name || "N/A"}</Text>
          <Text style={styles.workoutDescription}>
            {workout?.description || "N/A"}
          </Text>
        </View>

        {/* Workout Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons
              name="calendar"
              size={wp(4.5)}
              color={COLORS.primaryColor}
            />
            <Text style={styles.infoText}>
              Started:{" "}
              {workout?.createdAt
                ? new Date(workout.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="fitness"
              size={wp(4.5)}
              color={COLORS.primaryColor}
            />
            <Text style={styles.infoText}>
              {workout?.exercisesCount || "N/A"} Exercises
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={wp(4.5)} color={COLORS.primaryColor} />
            <Text style={styles.infoText}>
              {workout?.numberOfWeeks || "N/A"} Weeks
            </Text>
          </View>
        </View>

        {/* Workout Schedule */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>
            {t("WorkoutPlanDetails.schedule_title")}
          </Text>
          {workoutDay.map((day, index) => renderDayCard(day, index))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutPlanDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: hp(6),
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: hp(4),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    width: wp(8),
  },
  heroSection: {
    width: "100%",
    height: hp(30),
  },
  imagesScrollView: {
    width: "100%",
    height: "100%",
    marginTop: hp(2),
  },
  heroImage: {
    width: wp(92),
    height: hp(25),
    borderRadius: wp(3),
    resizeMode: "cover",
    marginHorizontal: wp(3),
  },
  heroOverlay: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.black1,
    marginBottom: hp(1),
  },
  workoutTitle: {
    color: "#FFF",
    fontSize: wp(5.2),
    fontFamily: fonts.medium,
  },
  workoutDescription: {
    color: "#FFF",
    fontSize: wp(3.2),
    lineHeight: wp(5.5),
    opacity: 0.9,
    fontFamily: fonts.regular,
  },
  infoSection: {
    paddingHorizontal: wp(4),
    marginBottom: hp(2.5),
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.2),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.black1,
    paddingBottom: hp(1),
  },
  infoText: {
    color: "#FFF",
    fontSize: wp(3.4),
    marginLeft: wp(2.5),
    fontFamily: fonts.regular,
  },
  scheduleSection: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: wp(4),
    fontFamily: fonts.semiBold,
    marginBottom: hp(1.5),
  },
  dayContainer: {
    backgroundColor: "rgba(43, 43, 45, 1)",
    borderRadius: 7,
    marginBottom: hp(1.5),
    borderWidth: 0.5,
    overflow: "hidden",
  },
  dayHeader: {
    padding: wp(3.5),
  },
  dayContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  dayLeftContent: {
    flex: 1,
    paddingRight: wp(2),
  },
  dayLeftInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: wp(2.5),
  },
  dumbleContainer: {
    backgroundColor: COLORS.white,
    borderRadius: wp(10),
    padding: wp(1),
  },
  dumbleImage: {
    width: wp(5),
    height: wp(5),
  },
  dumbleImage2: {
    width: wp(3),
    height: wp(3),
  },
  dayRightContent: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: hp(10),
  },
  dayTitle: {
    color: "#FFF",
    fontSize: wp(3),
    fontFamily: fonts.semiBold,
    marginBottom: hp(0.6),
  },
  dayDescription: {
    color: "#B0B0B0",
    fontSize: wp(2.3),
    marginBottom: hp(1),
    fontFamily: fonts.regular,
  },
  dayMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    color: "#FFF",
    fontSize: wp(2.5),
    marginLeft: wp(1.2),
    fontFamily: fonts.regular,
  },
  exercisePreview: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(3.5),
    marginTop: hp(1),
  },
  exerciseList: {
    paddingHorizontal: wp(3.5),
    paddingBottom: wp(3.5),
    borderTopWidth: 0.5,
    borderTopColor: "#3A3A3A",
    backgroundColor: "rgba(43, 43, 45, 1)",
  },
  exerciseListTitle: {
    color: "#FFF",
    fontSize: wp(2.7),
    fontFamily: fonts.medium,
    marginBottom: hp(1.2),
    marginTop: hp(1.2),
  },
  exerciseItem: {
    flexDirection: "row",
    marginBottom: hp(1.5),
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
    padding: wp(2.5),
    borderRadius: 7,
  },
  exerciseImage: {
    width: wp(17),
    height: wp(18),
    borderRadius: wp(1),
    marginRight: wp(2.5),
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    color: "#FFF",
    fontSize: wp(3.2),
    fontFamily: fonts.medium,
    marginBottom: hp(0.4),
  },
  exerciseFocus: {
    color: "#B0B0B0",
    fontSize: wp(2.7),
    marginBottom: hp(0.6),
    lineHeight: wp(4.5),
    fontFamily: fonts.regular,
  },
  exerciseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  exerciseEquipment: {
    color: "#FFF",
    fontSize: wp(2.5),
    width: wp(40),
    fontFamily: fonts.regular,
  },
  exerciseDuration: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(0.3),
    borderRadius: wp(1.5),
  },
  exerciseDurationText: {
    color: COLORS.white,
    fontSize: wp(2.5),
    marginLeft: wp(1),
    fontFamily: fonts.regular,
  },
  noExercisesText: {
    color: "#B0B0B0",
    fontSize: wp(3),
    textAlign: "center",
    fontFamily: fonts.regular,
    paddingVertical: hp(2),
  },
  expandedContainer: {
    backgroundColor: COLORS.darkGray2,
  },
  dayContainer: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 7,
    marginBottom: hp(1.5),
    borderWidth: 0.5,
    overflow: "hidden",
    borderColor: COLORS.gray3,
  },
  exerciseList: {
    paddingHorizontal: wp(3.5),
    paddingBottom: wp(3.5),
    borderTopWidth: 0.5,
    borderTopColor: COLORS.gray3,
  },
});
