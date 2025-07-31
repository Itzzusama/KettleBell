import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { COLORS } from "../../utils/COLORS";
import fonts from "../../assets/fonts";
import { useNavigation } from "@react-navigation/native";
import { GetApiRequest } from "../../services/api";

const LogScreen = () => {
  const [activeTab, setActiveTab] = useState("workout");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const fetchLogs = async () => {
    setLoading(true);
    const endpoint =
      activeTab === "workout"
        ? "api/workout-logs?page=1&limit=10"
        : "api/meal-logs?page=1&limit=10";

    try {
      const response = await GetApiRequest(endpoint);
      const results = response?.data?.data || [];
      setLogs(results);
    } catch (error) {
      console.error("Error fetching logs:", error.message || error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const renderLogItem = ({ item }) => {
    if (activeTab === "meal") {
      return (
        <View style={styles.logCard}>
          <View style={styles.logHeader}>
            <Text style={styles.logTitle}>
              {item.mealPlan?.name || "Meal Plan"}
            </Text>
            <Text style={styles.logDate}>
              {new Date(item.mealDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.tagRow}>
            <Text style={styles.pillTag}>
              🍽️ {item.mealtime?.toUpperCase()}
            </Text>
            <Text style={styles.pillTag}>🗓️ {item.dailyMeal?.name}</Text>
          </View>

          {item.notes ? (
            <Text style={styles.logNote}>🗒️ {item.notes}</Text>
          ) : null}
        </View>
      );
    }

    return (
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <Text style={styles.logTitle}>
            {item.workoutPlan?.name || "Workout Plan"}
          </Text>
          <Text style={styles.logDate}>
            {new Date(item.workoutDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.tagRow}>
          <Text style={styles.pillTag}>⏰ {item.timeSlot?.toUpperCase()}</Text>
          <Text style={styles.pillTag}>📋 {item.status?.toUpperCase()}</Text>
        </View>

        {item.workoutTitle && (
          <Text style={styles.logDescription}>💪 {item.workoutTitle}</Text>
        )}

        {item.notes ? (
          <Text style={styles.logNote}>🗒️ {item.notes}</Text>
        ) : null}

        {item.caloriesBurned > 0 && (
          <Text style={styles.logDescription}>
            🔥 Calories Burned: {item.caloriesBurned}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={wp(6)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === "workout" ? "Workout Logs" : "Meal Logs"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "workout" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("workout")}
        >
          <Ionicons name="barbell" size={wp(4.5)} color={COLORS.white} />
          <Text style={styles.tabText}>Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "meal" && styles.activeTab]}
          onPress={() => setActiveTab("meal")}
        >
          <Ionicons name="fast-food" size={wp(4.5)} color={COLORS.white} />
          <Text style={styles.tabText}>Meals</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primaryColor} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          renderItem={renderLogItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No logs found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default LogScreen;

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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: hp(2),
    paddingHorizontal: wp(3),
    gap: wp(2),
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray3,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(3),
    flex: 1,
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: COLORS.primaryColor,
  },
  tabText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    marginLeft: wp(1.5),
    fontFamily: fonts.medium,
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
  },
  logCard: {
    backgroundColor: COLORS.darkGray,
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(1),
  },
  logTitle: {
    color: COLORS.white,
    fontSize: wp(4),
    fontFamily: fonts.medium,
  },
  logDate: {
    color: COLORS.gray2,
    fontSize: wp(3),
    fontFamily: fonts.regular,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
    marginBottom: hp(0.5),
  },
  pillTag: {
    backgroundColor: COLORS.gray3,
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
    fontSize: wp(3),
    color: COLORS.white,
    fontFamily: fonts.medium,
  },
  logDescription: {
    color: COLORS.white,
    fontSize: wp(3.2),
    fontFamily: fonts.regular,
    marginTop: hp(0.5),
  },
  logNote: {
    marginTop: hp(0.8),
    color: COLORS.gray2,
    fontSize: wp(3),
    fontFamily: fonts.regular,
    lineHeight: hp(2.5),
  },
  emptyText: {
    color: COLORS.gray2,
    textAlign: "center",
    marginTop: hp(5),
    fontFamily: fonts.regular,
    fontSize: wp(3.5),
  },
});
