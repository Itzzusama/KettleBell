import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { COLORS } from "../../../../utils/COLORS";
import fonts from "../../../../assets/fonts";
import * as Progress from "react-native-progress";

const AnimatedCard = ({ delay = 0, children, width }) => {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 15 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 15 }));
  }, [delay, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    width: width,
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
};

const StatsSection = ({ stats }) => {
  const [viewMode, setViewMode] = useState("weekly"); // weekly | monthly

  const planCounts = stats?.planCounts || {};
  const summary = stats?.summary || {};

  const weekly = summary?.weeklyUserEngagement || {};
  const monthly = summary?.monthlyUserEngagement || {};
  const engagement = viewMode === "weekly" ? weekly : monthly;

  const safeValue = (val) => (typeof val === "number" ? val : 0);

  return (
    <View style={{ marginHorizontal: wp(5), marginBottom: hp(3) }}>
      <Text style={styles.sectionTitle}>Active Plans</Text>
      <View style={styles.highlightContainer}>
        <AnimatedCard delay={400} width={"33.3%"}>
          <View style={[styles.highlightCard, { marginRight: wp(1) }]}>
            <View>
              <Ionicons
                name="fast-food-outline"
                size={wp(5)}
                color={COLORS.white}
              />
              <Text style={styles.highlightTitle}>Meal</Text>
            </View>

            <Text style={styles.highlightValue}>
              {safeValue(planCounts?.totalAssignedMealPlans)}
            </Text>
          </View>
        </AnimatedCard>

        <AnimatedCard delay={500} width={"33.3%"}>
          <View style={styles.highlightCard}>
            <View>
              <Ionicons
                name="barbell-outline"
                size={wp(5)}
                color={COLORS.white}
              />
              <Text style={styles.highlightTitle}>Workout</Text>
            </View>

            <Text style={styles.highlightValue}>
              {safeValue(planCounts?.totalAssignedWorkoutPlans)}
            </Text>
          </View>
        </AnimatedCard>

        <AnimatedCard delay={600} width={"33.3%"}>
          <View style={[styles.highlightCard, { marginLeft: wp(1) }]}>
            <View>
              <Ionicons name="list-outline" size={wp(5)} color={COLORS.white} />
              <Text style={styles.highlightTitle}>Total</Text>
            </View>

            <Text style={styles.highlightValue}>
              {safeValue(planCounts?.totalAssignedPlans)}
            </Text>
          </View>
        </AnimatedCard>
      </View>

      <AnimatedCard delay={700} width={"100%"}>
        <View style={styles.summaryCard}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === "weekly" && styles.toggleActive,
              ]}
              onPress={() => setViewMode("weekly")}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === "weekly" && styles.toggleTextActive,
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === "monthly" && styles.toggleActive,
              ]}
              onPress={() => setViewMode("monthly")}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === "monthly" && styles.toggleTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.summaryRow}>
            <Feather name="percent" size={wp(4.5)} color="#FFD700" />
            <Text style={styles.summaryLabel}>Overall Progress</Text>
            <Progress.Bar
              progress={(engagement?.overallProgressPercentage ?? 0) / 100}
              width={wp(30)}
              height={hp(0.8)}
              color={COLORS.primaryColor}
              unfilledColor="#444"
              borderWidth={0}
              borderRadius={hp(0.4)}
            />
            <Text style={styles.summaryValue}>
              {engagement?.overallProgressPercentage ?? 0}%
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Feather name="fast-forward" size={wp(4.5)} color="#FFD700" />
            <Text style={styles.summaryLabel}>Meal Logs Added</Text>
            <Text style={styles.summaryValue}>
              {safeValue(engagement?.mealLogsAdded)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Feather name="activity" size={wp(4.5)} color="#FFD700" />
            <Text style={styles.summaryLabel}>Workout Logs Added</Text>
            <Text style={styles.summaryValue}>
              {safeValue(engagement?.workoutLogsAdded)}
            </Text>
          </View>
        </View>
      </AnimatedCard>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: wp(4),
    fontFamily: fonts.semiBold,
    color: COLORS.white,
    marginBottom: hp(1),
    marginTop: hp(0.1),
  },
  highlightContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: hp(2),
  },
  highlightCard: {
    flex: 1,
    backgroundColor: COLORS.primaryColor,
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(3),
    borderRadius: wp(3),
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    flexDirection: "row",
  },
  highlightTitle: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontFamily: fonts.medium,
    marginTop: hp(1),
    marginBottom: hp(0.5),
    textAlign: "center",
  },
  highlightValue: {
    color: "#FFF",
    fontSize: wp(5),
    fontFamily: fonts.semiBold,
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: hp(2),
  },
  toggleButton: {
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(6),
    borderRadius: wp(2),
    marginHorizontal: wp(2),
    backgroundColor: "#2A2A2D",
    borderColor: COLORS.gray,
    borderWidth: 0.78,
  },
  toggleActive: {
    backgroundColor: COLORS.primaryColor,
  },
  toggleText: {
    fontSize: wp(3.5),
    fontFamily: fonts.medium,
    color: "#AAA",
    marginTop: 2,
  },
  toggleTextActive: {
    color: "#FFF",
  },
  summaryCard: {
    padding: wp(5),
    paddingVertical: wp(3),
    borderRadius: wp(3),
    backgroundColor: "#2A2A2D",
    borderWidth: 0.5,
    borderColor: "#444",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp(0.8),
  },
  summaryLabel: {
    flex: 1,
    color: "#DDD",
    fontSize: wp(3.5),
    fontFamily: fonts.medium,
    marginLeft: wp(2),
  },
  summaryValue: {
    color: "#FFF",
    fontSize: wp(4),
    fontFamily: fonts.semiBold,
    marginLeft: wp(2),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray,
    marginVertical: hp(1),
    opacity: 0.2,
  },
});

export default StatsSection;
