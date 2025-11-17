import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  Switch,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";

import { COLORS } from "../../utils/COLORS";
import fonts from "../../assets/fonts";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { useSelector } from "react-redux";
import HealthNote from "../../components/HealthNote";

const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary (Little or no exercise)", factor: 1.2 },
  { key: "light", label: "Light (Exercise 1-3 times/week)", factor: 1.375 },
  {
    key: "moderate",
    label: "Moderate (Exercise 3-5 times/week)",
    factor: 1.55,
  },
  { key: "active", label: "Active (Exercise 6-7 times/week)", factor: 1.725 },
  {
    key: "veryActive",
    label: "Very Active (Hard exercise daily)",
    factor: 1.9,
  },
];

// Helper to map possible profile values to our keys
const normalizeActivity = (value) => {
  if (!value) return null;
  const v = String(value).toLowerCase().replace(/\s+/g, "");

  const aliases = {
    veryactive: "veryActive",
    active: "active",
    moderate: "moderate",
    light: "light",
    sedentary: "sedentary",
  };

  return aliases[v] || null;
};

export default function BMRCalculatorScreen() {
  const { userData } = useSelector((state) => state.users);
  const navigation = useNavigation();
  const route = useRoute();

  const clientInfo = route.params?.clientInfo || userData;

  const [sex, setSex] = useState("male");
  const [unit, setUnit] = useState("metric");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState(""); // cm or in
  const [weight, setWeight] = useState(""); // kg or lb

  const [includeTDEE, setIncludeTDEE] = useState(false);
  const [activity, setActivity] = useState("sedentary");
  const [showActivity, setShowActivity] = useState(false);

  const [result, setResult] = useState(null);

  // Prefill values from clientInfo
  useEffect(() => {
    if (!clientInfo) return;

    const basic = clientInfo?.basicInfo || {};
    if (basic?.gender) {
      const g = String(basic.gender).toLowerCase();
      setSex(g === "female" ? "female" : "male");
    }
    if (basic?.age != null) setAge(String(basic.age));
    if (basic?.height != null) setHeight(String(basic.height));
    if (basic?.weight != null) setWeight(String(basic.weight));

    const profAct = normalizeActivity(
      clientInfo?.fitnessBackground?.activityLevel
    );
    if (profAct) {
      setActivity(profAct);
    }
  }, [clientInfo]);

  const activityFactor = useMemo(() => {
    return ACTIVITY_LEVELS.find((a) => a.key === activity)?.factor ?? 1.2;
  }, [activity]);

  const validate = () => {
    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);

    if (
      Number.isNaN(ageNum) ||
      Number.isNaN(heightNum) ||
      Number.isNaN(weightNum)
    ) {
      Alert.alert("Invalid input", "Please enter valid numeric values.");
      return false;
    }
    if (ageNum < 10 || ageNum > 100) {
      Alert.alert("Invalid age", "Age should be between 10 and 100.");
      return false;
    }
    if (unit === "metric") {
      if (heightNum < 100 || heightNum > 230) {
        Alert.alert(
          "Invalid height",
          "Height (cm) should be between 100 and 230."
        );
        return false;
      }
      if (weightNum < 30 || weightNum > 250) {
        Alert.alert(
          "Invalid weight",
          "Weight (kg) should be between 30 and 250."
        );
        return false;
      }
    } else {
      if (heightNum < 40 || heightNum > 90) {
        Alert.alert(
          "Invalid height",
          "Height (in) should be between 40 and 90."
        );
        return false;
      }
      if (weightNum < 66 || weightNum > 550) {
        Alert.alert(
          "Invalid weight",
          "Weight (lb) should be between 66 and 550."
        );
        return false;
      }
    }
    return true;
  };

  const toMetric = ({ w, h }) => {
    return { kg: w * 0.45359237, cm: h * 2.54 };
  };

  const calculate = () => {
    if (!validate()) return;

    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);

    let cm = heightNum;
    let kg = weightNum;
    if (unit === "imperial") {
      const conv = toMetric({ w: weightNum, h: heightNum });
      kg = conv.kg;
      cm = conv.cm;
    }

    const bmr =
      sex === "male"
        ? 10 * kg + 6.25 * cm - 5 * ageNum + 5
        : 10 * kg + 6.25 * cm - 5 * ageNum - 161;

    const next = { bmr: Math.round(bmr) };

    if (includeTDEE) {
      const tdee = bmr * activityFactor;
      next.tdee = Math.round(tdee);
      next.deficit15 = Math.round(tdee * 0.85);
      next.surplus10 = Math.round(tdee * 1.1);
    }

    setResult(next);
  };

  const reset = () => {
    setAge("");
    setHeight("");
    setWeight("");
    setResult(null);
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
        <Text style={styles.headerTitle}>BMR Calculator</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: hp(4) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gender selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gender</Text>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabPill, sex === "male" && styles.activePill]}
              onPress={() => setSex("male")}
            >
              <Ionicons name="male" size={wp(4.5)} color="#FFF" />
              <Text style={styles.pillText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabPill, sex === "female" && styles.activePill]}
              onPress={() => setSex("female")}
            >
              <Ionicons name="female" size={wp(4.5)} color="#FFF" />
              <Text style={styles.pillText}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Units */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Units</Text>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabPill, unit === "metric" && styles.activePill]}
              onPress={() => setUnit("metric")}
            >
              <Ionicons
                name="speedometer-outline"
                size={wp(4.5)}
                color="#FFF"
              />
              <Text style={styles.pillText}>Metric (kg / cm)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabPill, unit === "imperial" && styles.activePill]}
              onPress={() => setUnit("imperial")}
            >
              <Ionicons name="flag-outline" size={wp(4.5)} color="#FFF" />
              <Text style={styles.pillText}>Imperial (lb / in)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Details</Text>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Age</Text>
            <CustomInput
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="e.g., 28"
            />

            <Text style={[styles.inputLabel, { marginTop: hp(1.5) }]}>
              Height ({unit === "metric" ? "cm" : "in"})
            </Text>
            <CustomInput
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder={unit === "metric" ? "e.g., 175" : "e.g., 69"}
            />

            <Text style={[styles.inputLabel, { marginTop: hp(1.5) }]}>
              Weight ({unit === "metric" ? "kg" : "lb"})
            </Text>
            <CustomInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder={unit === "metric" ? "e.g., 70" : "e.g., 154"}
            />
          </View>
        </View>

        {/* Activity */}
        <View style={styles.section}>
          <View style={styles.includeRow}>
            <Text style={styles.sectionTitle}>Include Activity (TDEE)</Text>
            <Switch
              value={includeTDEE}
              onValueChange={(v) => {
                setIncludeTDEE(v);
                if (!v) setShowActivity(false);
              }}
              thumbColor={
                includeTDEE ? COLORS.primaryColor || "#FEC635" : "#888"
              }
              trackColor={{ false: "#3A3A3A", true: "#5A5A5A" }}
            />
          </View>

          {includeTDEE && (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.dropdownBtn,
                  showActivity && styles.dropdownActive,
                ]}
                onPress={() => setShowActivity((s) => !s)}
              >
                <Text style={styles.dropdownText}>
                  {ACTIVITY_LEVELS.find((a) => a.key === activity)?.label ??
                    "Select activity"}
                </Text>
                <Ionicons
                  name={showActivity ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#FFF"
                />
              </TouchableOpacity>

              {showActivity && (
                <View style={styles.dropdownBody}>
                  {ACTIVITY_LEVELS.map((a) => (
                    <TouchableOpacity
                      key={a.key}
                      style={[
                        styles.dropdownItem,
                        activity === a.key && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setActivity(a.key);
                        setShowActivity(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          activity === a.key && styles.dropdownItemTextActive,
                        ]}
                      >
                        {a.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.actionsRow}>
          <CustomButton
            title="Calculate"
            onPress={calculate}
            style={styles.primaryBtn}
          />
        </View>
        <View style={styles.actionsRow}>
          <CustomButton
            title="Reset"
            onPress={reset}
            backgroundColor={COLORS.gray3}
            borderColor={COLORS.gray3}
          />
        </View>

        {/* Results */}
        {result && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Results</Text>
            <View style={styles.card}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>BMR</Text>
                <Text style={styles.resultValue}>{result.bmr} kcal/day</Text>
              </View>

              {includeTDEE && result.tdee != null && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>TDEE</Text>
                    <Text style={styles.resultValue}>
                      {result.tdee} kcal/day
                    </Text>
                  </View>

                  <Text style={[styles.subHeading, { marginTop: hp(1.5) }]}>
                    Quick Targets
                  </Text>
                  <View style={styles.targetRow}>
                    <View style={styles.targetPill}>
                      <Ionicons
                        name="trending-down-outline"
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.targetText}>
                        Cut (~15%): {result.deficit15} kcal
                      </Text>
                    </View>
                    <View style={styles.targetPill}>
                      <Ionicons
                        name="trending-up-outline"
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.targetText}>
                        Bulk (~10%): {result.surplus10} kcal
                      </Text>
                    </View>
                  </View>
                </>
              )}

              <View style={{ marginTop: 12 }}>
                {/* Explanation */}
                <Text style={styles.noteText}>
                  BMR (Basal Metabolic Rate) is your estimated resting energy
                  need. TDEE (Total Daily Energy Expenditure) estimates daily
                  maintenance based on activity.
                </Text>

                {/* How it’s calculated */}
                <Text
                  style={[styles.noteText, { marginTop: 8, fontWeight: "600" }]}
                >
                  How this is calculated
                </Text>
                <Text style={styles.noteText}>
                  This calculator uses the Mifflin–St Jeor equation, a commonly
                  used formula in clinical nutrition.{" "}
                  <Text
                    style={{
                      color: "#FEC635",
                      textDecorationLine: "underline",
                    }}
                    onPress={() =>
                      Linking.openURL(
                        "https://pubmed.ncbi.nlm.nih.gov/2305711/"
                      )
                    }
                  >
                    View Mifflin–St Jeor study
                  </Text>
                </Text>

                <Text
                  style={{
                    color: "#FEC635",
                    textDecorationLine: "underline",
                  }}
                  onPress={() =>
                    Linking.openURL(
                      "https://my.clevelandclinic.org/health/body/basal-metabolic-rate-bmr"
                    )
                  }
                >
                  Learn more about BMR
                </Text>

                {/* Disclaimer */}
                <Text
                  style={[
                    styles.noteText,
                    { marginTop: 12, fontStyle: "italic", lineHeight: 20 },
                  ]}
                >
                  Disclaimer: This tool is for informational use only and does
                  not provide medical advice. Consult a healthcare professional
                  before making changes to diet or exercise.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ======================= STYLES ======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F21",
    paddingTop: hp(6),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingTop: Platform.OS === "ios" ? hp(1) : hp(2),
  },
  backButton: { padding: wp(2) },
  headerTitle: {
    color: "#FFF",
    fontSize: hp(2.3),
    fontFamily: fonts.medium,
  },
  placeholder: { width: wp(10) },

  section: {
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: wp(4.7),
    marginBottom: hp(1.2),
    fontFamily: fonts.medium,
  },

  tabRow: {
    flexDirection: "row",
    gap: wp(2),
  },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1.2),
    backgroundColor: COLORS.gray3,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(3),
  },
  activePill: {
    backgroundColor: COLORS.primaryColor,
  },
  pillText: {
    color: "#FFF",
    fontSize: 11,
    fontFamily: fonts.medium,
  },

  card: {
    backgroundColor: COLORS.darkGray2 ?? "#2B2B2D",
    padding: wp(4),
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: COLORS.gray3 ?? "#3A3A3A",
  },
  inputLabel: {
    color: "#BFBFBF",
    fontSize: wp(3.2),
    fontFamily: fonts.regular,
    marginBottom: hp(0.6),
  },

  includeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(1),
  },

  dropdownBtn: {
    backgroundColor: "#1D1D20",
    borderWidth: 1,
    borderColor: COLORS.gray3 ?? "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.6),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownActive: {
    borderColor: COLORS.primaryColor,
  },
  dropdownText: {
    color: "#FFF",
    fontSize: wp(3.3),
    fontFamily: fonts.regular,
    paddingRight: wp(2),
    flex: 1,
  },
  dropdownBody: {
    marginTop: hp(0.8),
    backgroundColor: "#1D1D20",
    borderWidth: 1,
    borderColor: COLORS.gray3 ?? "#3A3A3A",
    borderRadius: 8,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3 ?? "#3A3A3A",
  },
  dropdownItemActive: {
    backgroundColor: (COLORS.primaryColor || "#FEC635") + "22",
  },
  dropdownItemText: {
    color: "#FFF",
    fontSize: wp(3.2),
    fontFamily: fonts.regular,
  },
  dropdownItemTextActive: {
    color: COLORS.primaryColor || "#FEC635",
    fontFamily: fonts.medium,
  },

  actionsRow: {
    paddingHorizontal: wp(4),
    flexDirection: "row",
    gap: wp(2),
    marginBottom: hp(2),
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryColor,
  },

  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(1),
  },
  resultLabel: {
    color: "#BFBFBF",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
  },
  resultValue: {
    color: "#FFF",
    fontSize: wp(4.2),
    fontFamily: fonts.semiBold ?? fonts.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray3 ?? "#3A3A3A",
    marginVertical: hp(1),
    opacity: 0.6,
  },
  subHeading: {
    color: "#FFF",
    fontSize: wp(3.7),
    fontFamily: fonts.medium,
  },
  targetRow: {
    flexDirection: "row",
    gap: wp(2),
    marginTop: hp(1),
    flexWrap: "wrap",
  },
  targetPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1),
    backgroundColor: COLORS.backgroundColor,
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
  },
  targetText: {
    color: "#FFF",
    fontSize: wp(3.1),
    fontFamily: fonts.medium,
  },
  noteText: {
    marginTop: hp(1.5),
    color: "#AFAFAF",
    fontSize: wp(3.1),
    lineHeight: hp(2.6),
    fontFamily: fonts.regular,
  },
});
