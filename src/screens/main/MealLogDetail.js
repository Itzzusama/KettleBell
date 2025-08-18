import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
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

const MealLogDetail = () => {
  const route = useRoute();
  const { log } = route.params;
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={wp(6)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Details</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20, marginHorizontal: 15 }}
      >
        {/* Header */}

        {/* Daily Meal */}
        <View style={styles.card}>
          <Text style={styles.title}>{log.dailyMeal?.name}</Text>
          <Text style={styles.description}>{log.dailyMeal?.description}</Text>
        </View>

        {/* Meal Plan */}
        <View style={styles.card}>
          <Text style={styles.title}>{log.mealPlan?.name}</Text>
          <Text style={styles.description}>{log.mealPlan?.description}</Text>
        </View>

        {/* Meta Info */}
        <View style={styles.cardRow}>
          <View style={styles.metaCard}>
            <Ionicons name="fast-food" size={22} color={COLORS.primaryColor} />
            <Text style={styles.metaText}>
              {log.mealtime?.toUpperCase() || "N/A"}
            </Text>
          </View>
          <View style={styles.metaCard}>
            <Ionicons name="calendar" size={22} color={COLORS.primaryColor} />
            <Text style={styles.metaText}>
              {new Date(log.mealDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {log.notes ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.description}>{log.notes}</Text>
          </View>
        ) : null}

        {/* Nutrition */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nutrition</Text>
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionText}>
              Calories: {log.nutrition?.calories ?? 0} kcal
            </Text>
            <Text style={styles.nutritionText}>
              Protein: {log.nutrition?.protein ?? 0} g
            </Text>
          </View>
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionText}>
              Carbs: {log.nutrition?.carbs ?? 0} g
            </Text>
            <Text style={styles.nutritionText}>
              Fat: {log.nutrition?.fat ?? 0} g
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MealLogDetail;

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
    marginBottom: 15,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
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
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nutritionText: {
    color: COLORS.white,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  metaText: {
    marginLeft: 8,
    color: COLORS.white,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
});
