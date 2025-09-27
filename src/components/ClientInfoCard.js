import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import fonts from "../assets/fonts";
import { COLORS } from "../utils/COLORS";
import { useNavigation } from "@react-navigation/native";
import RouteName from "../navigation/RouteName";

// ✅ Normalize activity levels
const normalizeActivity = (level) => {
  if (!level) return null;
  const lower = level.toLowerCase();
  if (lower.includes("sedentary")) return "sedentary";
  if (lower.includes("light")) return "light";
  if (lower.includes("moderate")) return "moderate";
  if (lower.includes("active") && lower.includes("very")) return "veryActive";
  if (lower.includes("active")) return "active";
  return null;
};

// ✅ Calculate BMR
const calculateBMR = ({ gender, weight, height, age }) => {
  if (!weight || !height || !age || !gender) return 0;
  return gender?.toLowerCase() === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
};

// ✅ TDEE multipliers
const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const AccordionSection = ({
  title,
  icon,
  children,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.sectionHeaderLeft}>
          <Ionicons
            name={icon}
            size={hp(2.2)}
            color={COLORS.primaryColor}
            style={{ marginRight: wp(2) }}
          />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={hp(2.2)}
          color={COLORS.white}
        />
      </TouchableOpacity>
      {expanded && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
};

export default function ClientInfoCard({ clientInfo }) {
  const [parentExpanded, setParentExpanded] = useState(false);
  const navigation = useNavigation();

  const { bmr, tdee } = useMemo(() => {
    const { gender, age, height, weight } = clientInfo?.basicInfo || {};
    const activity = normalizeActivity(
      clientInfo?.fitnessBackground?.activityLevel
    );
    const bmrVal = calculateBMR({ gender, age, height, weight });
    const tdeeVal = activity
      ? Math.round(bmrVal * activityMultipliers[activity])
      : null;
    return { bmr: Math.round(bmrVal), tdee: tdeeVal };
  }, [clientInfo]);

  const handleRecalculate = () => {
    navigation.navigate(RouteName.BMRCalculator, { clientInfo });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.parentHeader}
        onPress={() => setParentExpanded(!parentExpanded)}
        activeOpacity={0.8}
      >
        <Text style={styles.parentTitle}>Profile Overview</Text>
        <Ionicons
          name={parentExpanded ? "chevron-up" : "chevron-down"}
          size={hp(2.5)}
          color={COLORS.white}
        />
      </TouchableOpacity>

      {parentExpanded && (
        <View style={styles.parentBody}>
          <View style={styles.highlightCard}>
            <HighlightItem icon="flame" label="BMR" value={`${bmr} kcal`} />
            <HighlightItem
              icon="flash"
              label="TDEE"
              value={tdee ? `${tdee} kcal` : "N/A"}
            />
          </View>

          {/* 🔄 Recalculate button */}
          <TouchableOpacity
            onPress={handleRecalculate}
            style={styles.recalcButton}
          >
            <Ionicons
              name="refresh"
              size={16}
              color={COLORS.primaryColor}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.recalcText}>Recalculate</Text>
          </TouchableOpacity>

          {/* Sections */}
          <AccordionSection
            title="Basic Info"
            icon="person-outline"
            defaultExpanded
          >
            <InfoRow label="Gender" value={clientInfo?.basicInfo?.gender} />
            <InfoRow label="Age" value={clientInfo?.basicInfo?.age} />
            <InfoRow
              label="Height"
              value={`${clientInfo?.basicInfo?.height || 0} cm`}
            />
            <InfoRow
              label="Weight"
              value={`${clientInfo?.basicInfo?.weight || 0} kg`}
            />
          </AccordionSection>

          <AccordionSection title="Body Measurements" icon="barbell-outline">
            <InfoRow
              label="Chest"
              value={`${clientInfo?.bodyMeasurements?.chest || 0} cm`}
            />
            <InfoRow
              label="Waist"
              value={`${clientInfo?.bodyMeasurements?.waist || 0} cm`}
            />
            <InfoRow
              label="Hips"
              value={`${clientInfo?.bodyMeasurements?.hips || 0} cm`}
            />
            <InfoRow
              label="Thighs"
              value={`${clientInfo?.bodyMeasurements?.thighs || 0} cm`}
            />
            <InfoRow
              label="Arms"
              value={`${clientInfo?.bodyMeasurements?.arms || 0} cm`}
            />
          </AccordionSection>

          <AccordionSection title="Health Info" icon="heart-outline">
            <InfoRow
              label="Conditions"
              value={
                clientInfo?.healthInfo?.medicalConditions?.join(", ") || "None"
              }
            />
            <InfoRow
              label="Injuries"
              value={
                clientInfo?.healthInfo?.injuriesOrLimitations?.join(", ") ||
                "None"
              }
            />
          </AccordionSection>

          <AccordionSection title="Fitness Background" icon="fitness-outline">
            <InfoRow
              label="Activity Level"
              value={clientInfo?.fitnessBackground?.activityLevel}
            />
            <InfoRow
              label="Frequency"
              value={`${
                clientInfo?.fitnessBackground?.exerciseFrequency || 0
              } times/week`}
            />
            <InfoRow
              label="History"
              value={clientInfo?.fitnessBackground?.exerciseHistory || "N/A"}
            />
          </AccordionSection>

          <AccordionSection title="Goals" icon="flag-outline">
            <InfoRow
              label="Primary Goal"
              value={clientInfo?.fitnessGoals?.primaryGoal}
            />
            <InfoRow
              label="Specific Goals"
              value={
                clientInfo?.fitnessGoals?.specificGoals?.join(", ") || "N/A"
              }
            />
          </AccordionSection>

          <AccordionSection title="Nutrition" icon="restaurant-outline">
            <InfoRow
              label="Restrictions"
              value={
                clientInfo?.nutrition?.dietaryRestrictions?.join(", ") || "None"
              }
            />
            <InfoRow
              label="Preferences"
              value={clientInfo?.nutrition?.mealPreferences || "N/A"}
            />
          </AccordionSection>
        </View>
      )}
    </View>
  );
}

const HighlightItem = ({ icon, label, value }) => (
  <View style={styles.highlightItem}>
    <Ionicons name={icon} size={20} color={COLORS.primaryColor} />
    <Text style={styles.highlightValue}>{value}</Text>
    <Text style={styles.highlightLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value || "N/A"}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: wp(3),
    backgroundColor: "#2A2A2D",
    borderWidth: 0.5,
    borderColor: "#444",
    marginHorizontal: wp(5),
    marginBottom: hp(1.5),
  },
  parentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: hp(2),
    paddingVertical: hp(1),
  },
  parentTitle: {
    fontSize: wp(4),
    fontFamily: fonts.regular,
    color: COLORS.white,
    opacity: 0.8,
  },
  parentBody: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(0.3),
  },
  highlightCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1E1E20",
    borderRadius: wp(2),
    padding: hp(1.5),
    marginBottom: hp(2),
  },
  highlightItem: {
    alignItems: "center",
    flex: 1,
  },
  highlightValue: {
    fontSize: wp(3.5),
    fontFamily: fonts.bold,
    color: COLORS.white,
    marginTop: 4,
  },
  highlightLabel: {
    fontSize: wp(2.5),
    fontFamily: fonts.regular,
    color: "#888",
  },
  recalcButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginBottom: hp(2),
  },
  recalcText: {
    fontSize: wp(3),
    fontFamily: fonts.medium,
    color: COLORS.primaryColor,
  },
  section: {
    marginBottom: hp(1.5),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  sectionBody: {
    marginTop: hp(0.5),
    paddingLeft: wp(1),
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(0.8),
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#888",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: COLORS.white,
  },
});
