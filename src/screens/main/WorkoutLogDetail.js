import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS } from "../../utils/COLORS";
import fonts from "../../assets/fonts";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const WorkoutLogDetail = () => {
  const route = useRoute();
  const { log } = route.params;
  console.log(log);
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={wp(6)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Details</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView>
        {/* Workout Info */}
        <View style={styles.card}>
          <Text style={styles.title}>{log.workoutTitle}</Text>
          <Text style={styles.subtitle}>{log.workoutPlan?.name}</Text>
          <Text style={styles.description}>{log.workoutPlan?.description}</Text>
        </View>

        {/* Meta Info */}
        <View style={styles.cardRow}>
          <View style={styles.metaCard}>
            <Ionicons name="calendar" size={22} color={COLORS.primaryColor} />
            <Text style={styles.metaText}>
              {new Date(log.workoutDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaCard}>
            <Ionicons name="time" size={22} color={COLORS.primaryColor} />
            <Text style={styles.metaText}>{log.timeSlotFormatted}</Text>
          </View>
        </View>

        {/* Status */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status</Text>
          <Text style={styles.description}>{log.status?.toUpperCase()}</Text>
        </View>

        {log.notes ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.description}>{log.notes}</Text>
          </View>
        ) : null}

        {/* Exercise Logs */}
        {log.exerciseLogs?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <FlatList
              data={log.exerciseLogs}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.exerciseItem}>
                  <Ionicons
                    name="barbell"
                    size={20}
                    color={COLORS.primaryColor}
                  />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.exerciseTitle}>
                      {item.exercise?.name || "Exercise"}
                    </Text>
                    <Text style={styles.description}>
                      Duration: {item.exerciseDuration} mins
                    </Text>
                    {/* Exercise-specific notes */}
                    {item.notes ? (
                      <Text style={styles.description}>
                        Notes: {item.notes}
                      </Text>
                    ) : null}
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutLogDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: hp(5),
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
    color: "#FFF",
    fontSize: hp(2.3),
    fontFamily: fonts.medium,
  },
  placeholder: {
    width: wp(10),
  },
  card: {
    backgroundColor: COLORS.darkGray,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    marginHorizontal: 15,
  },
  metaCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.darkGray,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    color: COLORS.white,
    fontFamily: fonts.medium,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray2,
    fontFamily: fonts.regular,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray2,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: fonts.medium,
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    color: COLORS.white,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  exerciseTitle: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
});
