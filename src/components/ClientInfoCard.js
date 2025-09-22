import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import fonts from "../assets/fonts";
import { COLORS } from "../utils/COLORS";

const AccordionSection = ({ title, children, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
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

  return (
    <View style={styles.container}>
      {/* Parent Accordion */}
      <TouchableOpacity
        style={styles.parentHeader}
        onPress={() => setParentExpanded(!parentExpanded)}
        activeOpacity={0.8}
      >
        <Text style={styles.parentTitle}>Client Details</Text>
        <Ionicons
          name={parentExpanded ? "chevron-up" : "chevron-down"}
          size={hp(2.5)}
          color={COLORS.white}
        />
      </TouchableOpacity>

      {parentExpanded && (
        <View style={styles.parentBody}>
          <AccordionSection title="Basic Info" defaultExpanded>
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

          <AccordionSection title="Body Measurements">
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

          <AccordionSection title="Health Info">
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

          <AccordionSection title="Fitness Background">
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
              value={`${
                clientInfo?.fitnessBackground?.exerciseHistory || 0
              } years`}
            />
          </AccordionSection>

          <AccordionSection title="Goals">
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

          <AccordionSection title="Nutrition">
            <InfoRow
              label="Restrictions"
              value={
                clientInfo?.nutrition?.dietaryRestrictions?.join(", ") || "None"
              }
            />
            <InfoRow
              label="Preferences"
              value={clientInfo?.nutrition?.mealPreferences}
            />
          </AccordionSection>
        </View>
      )}
    </View>
  );
}

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
    padding: hp(2.5),
    paddingVertical: hp(1.5),
  },
  parentTitle: {
    fontSize: wp(4),
    fontFamily: fonts.semiBold,

    color: COLORS.white,
  },
  parentBody: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  section: {
    marginBottom: hp(1.5),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
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
