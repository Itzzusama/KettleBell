import React from "react";
import { View, Text, StyleSheet } from "react-native";
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
  return (
    <View style={{ marginHorizontal: wp(5), marginBottom: hp(3) }}>
      <View style={styles.highlightContainer}>
        <AnimatedCard delay={100} width={"50%"}>
          <View style={[styles.highlightCard, { marginRight: wp(1) }]}>
            <Ionicons
              name="barbell-outline"
              size={wp(7)}
              color={COLORS.white}
            />
            <Text style={styles.highlightTitle}>Workouts</Text>
            <Text style={styles.highlightValue}>
              {stats.completedWorkouts ?? 0}/{stats.totalWorkouts ?? 0}
            </Text>
          </View>
        </AnimatedCard>

        <AnimatedCard delay={200} width={"50%"}>
          <View style={[styles.highlightCard, { marginLeft: wp(1) }]}>
            <Ionicons name="time-outline" size={wp(7)} color={COLORS.white} />
            <Text style={styles.highlightTitle}>Duration (min)</Text>
            <Text style={styles.highlightValue}>
              {stats.totalDuration ?? 0}
            </Text>
          </View>
        </AnimatedCard>
      </View>

      <AnimatedCard delay={300} width={"100%"}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Feather name="percent" size={wp(4.5)} color="#FFD700" />
            <Text style={styles.summaryLabel}>Completion Rate</Text>
            <Text style={styles.summaryValue}>
              {stats.completionRate ?? 0}%
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Feather name="sunrise" size={wp(4.5)} color="#FFD700" />
            <Text style={styles.summaryLabel}>Morning Workouts</Text>
            <Text style={styles.summaryValue}>
              {stats.timeSlotDistribution?.morning ?? 0}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Feather name="sun" size={wp(4.5)} color="#FFD700" />
            <Text style={styles.summaryLabel}>Afternoon Workouts</Text>
            <Text style={styles.summaryValue}>
              {stats.timeSlotDistribution?.afternoon ?? 0}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Feather name="moon" size={wp(4.5)} color="#FFD700" />
            <Text style={styles.summaryLabel}>Night Workouts</Text>
            <Text style={styles.summaryValue}>
              {stats.timeSlotDistribution?.night ?? 0}
            </Text>
          </View>
        </View>
      </AnimatedCard>
    </View>
  );
};

const styles = StyleSheet.create({
  highlightContainer: {
    flexDirection: "row",

    width: "100%",
  },
  highlightCard: {
    flex: 1, // ensures 50% width each
    backgroundColor: COLORS.primaryColor,
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  highlightTitle: {
    color: COLORS.white,
    fontSize: wp(3.9),
    fontFamily: fonts.medium,
    marginTop: hp(1),
    marginBottom: hp(0.5),
  },
  highlightValue: {
    color: "#FFF",
    fontSize: wp(5),
    fontFamily: fonts.semiBold,
  },
  summaryCard: {
    marginTop: hp(1.2),
    backgroundColor: "#2A2A2D",
    borderRadius: wp(3),
    padding: wp(5),
    paddingVertical: wp(3),
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
    justifyContent: "space-between",
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
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray,
    marginVertical: hp(1),
    opacity: 0.2,
  },
});

export default StatsSection;
