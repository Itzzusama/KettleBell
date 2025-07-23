import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";

import CustomButton from "../CustomButton";
import CustomModal from "../CustomModal";
import CustomText from "../CustomText";
import CustomInput from "../CustomInput";

import { COLORS } from "../../utils/COLORS";
import fonts from "../../assets/fonts";
import { GetApiRequest, PostApiRequest } from "../../services/api";
import ImageFast from "../ImageFast";
import { useToast } from "../../utils/Toast/toastContext";
import moment from "moment/moment";

const AssignWorkout = ({
  isVisible,
  onDisable,
  onPress,
  plan,
  clientId,
  type,
}) => {
  const [myPlans, setMyPlans] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const toast = useToast();

  

  const handleAssignPlan = async () => {
    if (!plan) {
      toast.showToast({
        type: "error",
        message: "Please select a workout plan",
        duration: 3000,
      });
      return;
    }

    if (!startDate) {
      toast.showToast({
        type: "error",
        message: "Please select a start date",
        duration: 3000,
      });
      return;
    }

    try {

      const formattedDate = moment(startDate).toISOString();
      setAssignLoading(true);

      const payload = {
        workoutPlanId: plan,
        startDate: formattedDate,
        notes: notes.trim() || "",
      };

      const payload1 = {
        mealPlanId: plan,
        startDate: formattedDate,
        notes: notes.trim() || "",
      };

      // Use correct payload based on type
      const finalPayload = type === "meal" ? payload1 : payload;

      // Use correct endpoint based on type
      const api =
        type === "meal"
          ? `api/clients/${clientId}/assign-meal`
          : `api/clients/${clientId}/assign-workout`;

      const response = await PostApiRequest(api, finalPayload);

      if (response.data?.success) {
        toast.showToast({
          type: "success",
          message:
            type === "meal"
              ? "Meal plan assigned successfully!"
              : "Workout plan assigned successfully!",
          duration: 3000,
        });

        onDisable();
        setStartDate("");
        setNotes("");
        if (onPress) onPress();
      } else {
        toast.showToast({
          type: "error",
          message: response.data?.message || "Failed to assign plan",
          duration: 3000,
        });
      }
    } catch (error) {
      console.log("Error assigning plan:", error);
      toast.showToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "An error occurred while assigning the plan",
        duration: 3000,
      });
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <CustomModal
      backdropOpacity={0.8}
      isVisible={isVisible}
      onDisable={onDisable}
    >
      <ScrollView contentContainerStyle={styles.mainContainer}>
        <CustomText
          label="Assign Workout Plans"
          fontFamily={fonts.bold}
          fontSize={18}
          color={COLORS.red}
          marginBottom={25}
        />
        <View style={styles.border}>
          {/* Workout Plan Selection */}
          <View style={styles.inputContainer}>
            <CustomText
              label="Selected Workout Plan"
              fontFamily={fonts.medium}
              fontSize={14}
              color={COLORS.black}
              marginBottom={8}
            />
            <TextInput
              style={styles.dropdownInput}
              placeholder="Select a workout plan"
              value={plan}
              editable={false}
              placeholderTextColor={COLORS.gray2}
            />
          </View>

          {/* Start Date */}
          <View style={styles.inputContainer}>
            <CustomText
              label="Start Date"
              fontFamily={fonts.medium}
              fontSize={14}
              color={COLORS.black}
              marginBottom={8}
            />
            <CustomInput
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
              keyboardType="default"
              marginBottom={0}
            />
          </View>

          {/* Notes */}
          <View style={styles.inputContainer}>
            <CustomText
              label="Notes"
              fontFamily={fonts.medium}
              fontSize={14}
              color={COLORS.black}
              marginBottom={8}
            />
            <CustomInput
              placeholder="Add any notes for the client..."
              value={notes}
              onChangeText={setNotes}
              multiline={true}
              height={80}
              marginBottom={0}
            />
          </View>
        </View>
        <View style={styles.row}>
          <CustomButton
            title="Cancel"
            backgroundColor="transparent"
            color={COLORS.red}
            borderColor={COLORS.red}
            borderWidth={1}
            width="48%"
            onPress={onDisable}
          />
          <CustomButton
            title="Assign Plan"
            width="48%"
            backgroundColor={COLORS.red}
            onPress={handleAssignPlan}
            loading={assignLoading}
            disabled={assignLoading}
          />
        </View>
      </ScrollView>
    </CustomModal>
  );
};

export default AssignWorkout;

const styles = StyleSheet.create({
  mainContainer: {
    padding: 25,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    alignItems: "center",
    paddingTop: 35,
    // maxHeight: "80%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 5,
  },
  border: {
    borderTopWidth: 0.3,
    borderTopColor: COLORS.gray,
    paddingTop: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  dropdownInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: COLORS.black,
  },
  dropdownButton: {
    padding: 12,
  },
  planOptions: {
    marginTop: 8,
    maxHeight: 120,
  },
  planOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: COLORS.white,
  },
  selectedPlanOption: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },
  image: {
    height: "80%",
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 6,
  },
});
