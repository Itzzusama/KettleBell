import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import CustomModal from "./CustomModal";
import { COLORS } from "../utils/COLORS";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CustomInput from "./CustomInput";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomButton from "./CustomButton";
import Fonts from "../assets/fonts";
import { Ionicons } from "@expo/vector-icons";
import { PostApiRequest } from "../services/api";
import { useNavigation } from "@react-navigation/native";

const TIME_SLOTS = [
  { label: "Morning", value: "morning" },
  { label: "Afternoon", value: "afternoon" },
  { label: "Night", value: "night" },
];

const AddToLogsModal = ({
  isVisible,
  onDisable,
  clientId,
  exerciseId,
  workoutId,
}) => {
  const navigation = useNavigation();
  const [workoutDate, setWorkoutDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState("");
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setWorkoutDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    const formattedDate = workoutDate.toISOString().split("T")[0]; // This will give YYYY-MM-DD format
    const payLoad = {
      clientId: clientId,
      exerciseId: exerciseId,
      workoutId: workoutId,
      workoutDate: formattedDate,
      timeSlot: timeSlot.toLowerCase(),
      duration: duration,
      notes: notes,
    };

    try {
      setIsLoading(true);
      const res = await PostApiRequest(
        "api/workout-logs/create-session",
        payLoad
      );
      if (res?.data?.success) {
        onDisable();
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeSlotSelect = (value) => {
    setTimeSlot(value);
    setShowTimeSlots(false);
  };

  return (
    <CustomModal
      isVisible={isVisible}
      onDisable={onDisable}
      backdropOpacity={0.7}
    >
      <View style={styles.modalContent}>
        <Pressable onPress={onDisable} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={COLORS.white} />
        </Pressable>
        <Text style={styles.title}>Add Workout Log</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Workout Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Workout Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {workoutDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={workoutDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Time Slot */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Time Slot</Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
                showTimeSlots && styles.activeDropdown,
              ]}
              onPress={() => setShowTimeSlots(!showTimeSlots)}
            >
              <Text style={styles.dateText}>
                {timeSlot
                  ? TIME_SLOTS.find((slot) => slot.value === timeSlot)?.label
                  : "Select Time Slot"}
              </Text>
              <Ionicons
                name={showTimeSlots ? "chevron-up" : "chevron-down"}
                size={20}
                color={COLORS.white}
                style={styles.dropdownIcon}
              />
            </TouchableOpacity>
            {showTimeSlots && (
              <View style={styles.dropdownContainer}>
                {TIME_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot.value}
                    style={[
                      styles.dropdownItem,
                      timeSlot === slot.value && styles.selectedItem,
                    ]}
                    onPress={() => handleTimeSlotSelect(slot.value)}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        timeSlot === slot.value && styles.selectedText,
                      ]}
                    >
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Duration */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <CustomInput
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g., 45"
              keyboardType="numeric"
            />
          </View>

          {/* Notes */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Notes</Text>
            <CustomInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about your workout"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.notesInput}
              height={100}
            />
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Save Log"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </View>
    </CustomModal>
  );
};

export default AddToLogsModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 20,
    padding: 24,
    width: wp(90),
    maxWidth: 400,
    maxHeight: hp(80),
    alignSelf: "center",
  },
  title: {
    fontSize: hp(2.4),
    color: COLORS.white,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    marginBottom: hp(2),
    textAlign: "center",
    marginTop: hp(2),
  },
  inputContainer: {
    marginBottom: hp(1),
  },
  label: {
    fontSize: hp(1.8),
    color: COLORS.white,
    fontFamily: Fonts.POPPINS_MEDIUM,
    marginBottom: hp(1),
  },
  dateButton: {
    backgroundColor: "#1D1D20",
    padding: hp(1.5),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray3,
    marginBottom: hp(1),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeDropdown: {
    borderColor: COLORS.primary,
  },
  dateText: {
    color: COLORS.white,
    fontSize: hp(1.8),
    fontFamily: Fonts.POPPINS_REGULAR,
  },
  dropdownIcon: {
    position: "absolute",
    right: 12,
  },
  dropdownContainer: {
    backgroundColor: "#1D1D20",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray3,
    marginTop: -hp(0.5),
    overflow: "hidden",
    zIndex: 1000,
  },
  dropdownItem: {
    padding: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  selectedItem: {
    backgroundColor: COLORS.primary + "20",
  },
  dropdownText: {
    color: COLORS.white,
    fontSize: hp(1.1),
    fontFamily: Fonts.POPPINS_REGULAR,
  },
  selectedText: {
    color: COLORS.primaryColor,
    fontFamily: Fonts.POPPINS_MEDIUM,
  },
  notesInput: {
    height: hp(12),
    paddingTop: 10,
  },
  buttonContainer: {
    marginTop: hp(0.2),
    gap: hp(1),
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  closeButton: {
    position: "absolute",
    top: hp(2),
    right: wp(4),
    zIndex: 1,
    padding: 8,
  },
});
