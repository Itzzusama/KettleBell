import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Svg, { Circle } from "react-native-svg";
import fonts from "../../assets/fonts";
import { Images } from "../../assets/images";
import CustomButton from "../../components/CustomButton";
import RouteName from "../../navigation/RouteName";
import { COLORS } from "../../utils/COLORS";

const { width, height } = Dimensions.get("window");

// Responsive scaling function
const scale = (size) => (width / 375) * size;

// Custom ProgressCircle component
const ProgressCircle = ({
  percentage,
  color,
  size = wp(16),
  strokeWidth = wp(2),
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
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90, ${size / 2}, ${size / 2})`}
      />
    </Svg>
  );
};

const KettlebellSwingWorkout = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [statusBarHeight, setStatusBarHeight] = useState(
    StatusBar.currentHeight || 0
  );

  const translatedCards = t("ExerciseStart.exercise_cards", { returnObjects: true });
  const exerciseCards = translatedCards.map((card, index) => ({
    ...card,
    id: index + 1,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=60&fit=crop",
  }));

  // Handle orientation changes
  const [dimensions, setDimensions] = useState({ width, height });
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
      setStatusBarHeight(StatusBar.currentHeight || 0);
    });
    return () => subscription?.remove();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <Image
        source={Images.exerciseStart}
        style={[
          styles.backgroundImage,
          {
            height:
              dimensions.height +
              (Platform.OS === "android" ? statusBarHeight : 0),
          },
        ]}
      />

      {/* Linear Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "#000000"]}
        style={[
          styles.gradientOverlay,
          {
            height:
              dimensions.height +
              (Platform.OS === "android" ? statusBarHeight : 0),
            top: 0,
          },
        ]}
      />

      {/* Full Screen ScrollView */}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <View style={styles.content}>
              {/* Progress Circles */}
              <View style={styles.progressCircles}>
                <View style={styles.progressItem}>
                  <ProgressCircle percentage={70} color="#FEC635" />
                </View>
              </View>

              {/* Exercise Title and Description */}
              <View style={styles.titleSection}>
                <Text style={styles.exerciseTitle}>{t("ExerciseStart.title")}</Text>
                <Text style={styles.exerciseDescription}>
                  {t("ExerciseStart.description")}
                </Text>
              </View>

              {/* Exercise Cards List */}
              <View style={styles.exercisesList}>
                {exerciseCards.map((exercise) => (
                  <View key={exercise.id} style={styles.exerciseCard}>
                    <Image
                      source={{ uri: exercise.image }}
                      style={styles.cardImage}
                    />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{exercise.title}</Text>
                      <Text style={styles.cardDescription}>
                        {exercise.description}
                      </Text>
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardEquipment}>
                          {exercise.equipment}
                        </Text>
                        <View style={styles.cardDuration}>
                          <Ionicons
                            name="time-outline"
                            size={wp(3.5)}
                            color={COLORS.primaryColor}
                          />
                          <Text style={styles.durationText}>
                            {exercise.duration}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.spacer} />
              <CustomButton
                title={t("ExerciseStart.next_button")}
                onPress={() => navigation.navigate(RouteName.Exercise_Complete)}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default KettlebellSwingWorkout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: "100%",
    resizeMode: "cover",
    position: "absolute",
    top: 0,
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  content: {
    paddingHorizontal: scale(15),
    paddingBottom: scale(50),
  },
  progressCircles: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: hp(3),
  },
  progressItem: {
    alignItems: "center",
    marginRight: wp(5),
  },
  titleSection: {
    marginBottom: hp(2),
  },
  exerciseTitle: {
    color: "#FFF",
    fontSize: scale(25),
    lineHeight: scale(32),
    marginBottom: hp(1.5),
    fontFamily: fonts.bold,
  },
  exerciseDescription: {
    color: "rgba(255, 255, 255, 0.96)",
    fontSize: scale(14),
    lineHeight: scale(20),
    fontFamily: fonts.regular,
  },
  exercisesList: {
    gap: hp(1.5),
  },
  exerciseCard: {
    flexDirection: "row",
    backgroundColor: "rgba(24, 24, 24, 1)",
    borderRadius: 7,
    padding: wp(3),
    alignItems: "center",
  },
  cardImage: {
    width: wp(20),
    height: wp(15),
    borderRadius: 7,
    marginRight: wp(3),
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: "#FFF",
    fontSize: wp(4),
    fontFamily: fonts.medium,
    marginBottom: hp(0.5),
  },
  cardDescription: {
    color: "#CCC",
    fontSize: wp(3.2),
    marginBottom: hp(0.5),
    fontFamily: fonts.regular,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(5),
  },
  cardEquipment: {
    color: "#888",
    fontSize: wp(3),
    fontFamily: fonts.regular,
  },
  cardDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1),
  },
  durationText: {
    color: COLORS.primaryColor,
    fontSize: wp(2.8),
    fontFamily: fonts.regular,
  },
  spacer: {
    height: hp(2),
  },
});