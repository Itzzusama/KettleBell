"use client";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Modal from "react-native-modal";
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from "react-native-responsive-screen";
import Swiper from "react-native-swiper";
import fonts from "../../../assets/fonts";
import { Images } from "../../../assets/images";
import CustomButton from "../../../components/CustomButton";
import RouteName from "../../../navigation/RouteName";
import { GetApiRequest, PutApiRequest } from "../../../services/api";
import { COLORS } from "../../../utils/COLORS";
import { useToast } from "../../../utils/Toast/toastContext";
import { modalDays, uploadAndGetUrl } from "../../../utils/constant";

const { width } = Dimensions.get("window");

export default function ClientWorkoutPlan() {
  const [switches, setSwitches] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  const [dailyWorkouts, setDailyWorkouts] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [loading, setLoading] = useState(false);

  const [workoutDescription, setWorkoutDescription] = useState("");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute();
  const item = route.params?.item;
  const toast = useToast();

  const getDailyWorkout = async () => {
    try {
      const response = await GetApiRequest(
        `api/workout-plans/${item.id}/daily-workouts`
      );
      const workouts = response.data.data || response.data;
      setDailyWorkouts(workouts);
      const newSwitches = {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      };
      workouts.forEach((workout) => {
        const dayKey = workout.dayOfWeek.toLowerCase();
        newSwitches[dayKey] = workout.isActive;
      });
      setSwitches(newSwitches);
    } catch (error) {
      console.error("Error fetching daily workouts:", error);
    }
  };

  useEffect(() => {
    if (item?.id) {
      getDailyWorkout();
    }
  }, [item?.id]);

  const toggleSwitch = async (day) => {
    const dayKey = day.toLowerCase();
    const workout = dailyWorkouts.find((w) => w.dayOfWeek.toLowerCase() === dayKey);

    if (workout && workout.isActive) {
      // If workout is active, toggle to inactive via PUT request
      try {
        const deactivatePayload = {
          dayOfWeek: day,
          isActive: false,
        };
        await PutApiRequest(
          `api/workout-plans/${item.id}/daily-workouts/${modalDays[day]}`,
          deactivatePayload
        );
        toast.showToast({
          type: "success",
          message: "Workout deactivated successfully",
          duration: 4000,
        });

        const updatedResponse = await GetApiRequest(
          `api/workout-plans/${item.id}/daily-workouts`
        );
        const workouts = updatedResponse.data.data || updatedResponse.data;
        setDailyWorkouts(workouts);
        const newSwitches = { ...switches };
        workouts.forEach((w) => {
          const key = w.dayOfWeek.toLowerCase();
          newSwitches[key] = w.isActive;
        });
        setSwitches(newSwitches);
      } catch (error) {
        console.error("Error deactivating workout:", error);
        toast.showToast({
          type: "error",
          message: "Failed to deactivate workout",
          duration: 4000,
        });
      }
      return;
    }

    setSelectedDay(day);
    if (workout && !workout.isActive) {
      setSelectedWorkoutId(workout._id);
      setWorkoutName(workout.name || "");
      setWorkoutDescription(workout.description || "");
      setSelectedImage(workout.image || "");
    } else {
      setSelectedWorkoutId(null);
      setWorkoutName("");
      setWorkoutDescription("");
      setSelectedImage("");
    }
    setModalVisible(true);
  };

  const handleEditPress = (dayKey, dayName, workout) => {
    setSelectedDay(dayKey);
    setSelectedWorkoutId(workout?._id || null);
    setWorkoutName(workout?.name || "");
    setWorkoutDescription(workout?.description || "");
    setSelectedImage(workout?.image || "");
    setModalVisible(true);
  };

  const pickImage = async () => {
    // Launch image picker - SINGLE IMAGE ONLY
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
    }
  };

  const handleSaveWorkout = async () => {

    if (!workoutName.trim()) {
      toast.showToast({
        type: "error",
        message: "Please enter an exercise name",
        duration: 4000,
      });
      return;
    }
    setLoading(true);
    try {
      let imageUrl = selectedImage;

      if (!selectedImage.startsWith("http")) {
        imageUrl = await uploadAndGetUrl(
          { path: selectedImage, uri: selectedImage },
          "workout",
          "workouts"
        );
      }

      const updatePayload = {
        dayOfWeek: modalDays[selectedDay],
        name: workoutName,
        description: workoutDescription,
        image: imageUrl,
        isActive: true,
      };
      // Update existing workout
      const response = await PutApiRequest(
        `api/workout-plans/${item.id}/daily-workouts/${modalDays[selectedDay]}`,
        updatePayload
      );
      console.log("Workout updated successfully:", response.data);
      toast.showToast({
        type: "success",
        message: "Workout updated successfully",
        duration: 4000,
      });

      const updatedResponse = await GetApiRequest(
        `api/workout-plans/${item.id}/daily-workouts`
      );
      const workouts = updatedResponse.data.data || updatedResponse.data;
      setDailyWorkouts(workouts);

      // Update switches state
      const newSwitches = { ...switches };
      workouts.forEach((workout) => {
        const dayKey = workout.dayOfWeek.toLowerCase();
        newSwitches[dayKey] = workout.isActive;
      });
      setSwitches(newSwitches);

      setModalVisible(false);
      setWorkoutName("");
      setWorkoutDescription("");
      setSelectedWorkoutId(null);
      setSelectedImage("");
    } catch (error) {
      console.error("Error processing workout:", error);
      toast.showToast({
        type: "error",
        message: selectedWorkoutId ? "Failed to update workout" : "Failed to create workout",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const days = [
    { day: t("ClientWorkoutPlan.Monday"), key: "monday" },
    { day: t("ClientWorkoutPlan.Tuesday"), key: "tuesday" },
    { day: t("ClientWorkoutPlan.Wednesday"), key: "wednesday" },
    { day: t("ClientWorkoutPlan.Thursday"), key: "thursday" },
    { day: t("ClientWorkoutPlan.Friday"), key: "friday" },
    { day: t("ClientWorkoutPlan.Saturday"), key: "saturday" },
    { day: t("ClientWorkoutPlan.Sunday"), key: "sunday" },
  ];

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("ClientWorkoutPlan.title")}</Text>
          <View style={styles.headerRight} />
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.title}>No workout plan data available.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.backgroundColor}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {item?.name || t("ClientWorkoutPlan.title")}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Swiper */}
        <View style={styles.imageContainer}>
          <Swiper
            style={styles.swiper}
            showsButtons={false}
            dotStyle={styles.dot}
            activeDotStyle={styles.activeDot}
            paginationStyle={styles.pagination}
          >
            {(item?.images || []).map((uri, index) => (
              <View key={index} style={styles.slide}>
                <Image
                  source={{ uri }}
                  style={styles.heroImage}
                  onError={(e) =>
                    console.log("Hero Image Error:", e.nativeEvent.error)
                  }
                />
              </View>
            ))}
          </Swiper>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{item?.name || "Workout Plan"}</Text>
          <Text style={styles.description}>
            {item?.description || "No description available."}
          </Text>
          <View
            style={{
              borderWidth: 0.3,
              borderColor: COLORS.darkGray,
              marginBottom: heightPercentageToDP(1),
            }}
          />
          <View style={styles.exerciseCount}>
            <Text style={styles.exerciseIcon}>🏋️</Text>
            <Text style={styles.exerciseText}>{`${item?.numberOfWeeks || 0
              } weeks`}</Text>
          </View>
          <View
            style={{
              borderWidth: 0.3,
              borderColor: COLORS.darkGray,
              marginBottom: heightPercentageToDP(3),
            }}
          />

          {/* Weekly Schedule */}
          <Text style={styles.scheduleTitle}>
            {t("ClientWorkoutPlan.Schedule")}
          </Text>

          {days.map(({ day, key }) => {
            const workout = dailyWorkouts.find(
              (w) => w.dayOfWeek.toLowerCase() === key
            );
            return (
              <View
                key={day}
                style={
                  switches[key]
                    ? styles.activeScheduleItem
                    : styles.scheduleItem
                }
              >
                <View style={styles.scheduleLeft}>
                  <View
                    style={
                      switches[key] ? styles.activeIcon : styles.scheduleIcon
                    }
                  >
                    <Image
                      source={Images.dumble}
                      onError={(e) =>
                        console.log("Dumble Image Error:", e.nativeEvent.error)
                      }
                    />
                  </View>
                  <View>
                    <Text
                      style={
                        switches[key]
                          ? styles.activeScheduleDay
                          : styles.scheduleDay
                      }
                    >
                      {switches[key] && workout?.name ? workout.name : day}
                    </Text>
                    {switches[key] && workout?.description && (
                      <Text style={styles.activeScheduleDesc}>
                        {workout.description}
                      </Text>
                    )}
                    {switches[key] && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: COLORS.white,
                            ieltRadius: 7,
                            paddingHorizontal: 7,
                            paddingVertical: 5,
                          }}
                          onPress={() => handleEditPress(key, day, workout)}
                        >
                          <Ionicons
                            name="pencil"
                            size={14}
                            color={COLORS.primaryColor}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: COLORS.white,
                            borderRadius: 7,
                            paddingHorizontal: 7,
                            paddingVertical: 5,
                          }}
                          onPress={() =>
                            navigation.navigate(RouteName.Day_Details, {
                              workoutId: item.id,
                              day,
                            })
                          }
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              fontFamily: fonts.regular,
                              color: COLORS.primaryColor,
                              fontSize: 9,
                            }}
                          >
                            {t("ClientWorkoutPlan.ExerciseButton")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {switches[key] && (
                      <View style={styles.mondayTag}>
                        <Text style={styles.mondayTagText}>{day}</Text>
                        <Switch
                          trackColor={{ false: "black", true: "black" }}
                          thumbColor={switches[key] ? "#fff" : "#f4f3f4"}
                          ios_backgroundColor="#3e3e3e"
                          onValueChange={() => toggleSwitch(key)}
                          value={switches[key]}
                          style={styles.switch}
                        />
                      </View>
                    )}
                  </View>
                </View>
                {switches[key] && (
                  <Image
                    source={
                      workout?.image ? { uri: workout.image } : Images.women
                    }
                    style={styles.scheduleImage}
                    onError={(e) =>
                      console.log(
                        `Schedule Image Error for ${day}:`,
                        e.nativeEvent.error
                      )
                    }
                  />
                )}
                {!switches[key] && (
                  <Switch
                    trackColor={{ false: "#3e3e3e", true: "#ffa500" }}
                    thumbColor={switches[key] ? "#fff" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => toggleSwitch(key)}
                    value={switches[key]}
                    style={styles.switch}
                  />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={true}
        backdropOpacity={0.9}
      >
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', width: '100%' }}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedWorkoutId
                  ? `Edit Workout - ${selectedDay}`
                  : `Add Workout - ${selectedDay}`}
              </Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name "
                placeholderTextColor={COLORS.gray2}
                value={workoutName}
                onChangeText={setWorkoutName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Enter workout description"
                placeholderTextColor={COLORS.gray2}
                value={workoutDescription}
                onChangeText={setWorkoutDescription}
                multiline
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Image</Text>
              <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <View style={styles.uploadIcon}>
                      <Ionicons name="cloud-upload-outline" size={25} color="#666" />
                    </View>
                    <Text style={styles.uploadText}>
                      <Text style={styles.uploadLink}>Click to upload Image</Text>
                      <Text style={styles.uploadHint}> (SVG, PNG, JPG, GIF)</Text>
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <CustomButton
              title={selectedWorkoutId ? "Update Workout" : "Create Workout"}
              onPress={handleSaveWorkout}
              loading={loading}
              disabled={loading}
            />
          </View>
        </KeyboardAwareScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: heightPercentageToDP(6),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: widthPercentageToDP(5),
    paddingBottom: heightPercentageToDP(2),
    backgroundColor: COLORS.backgroundColor,
  },
  backButton: {
    width: widthPercentageToDP(10),
    height: widthPercentageToDP(10),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: heightPercentageToDP(2.3),
    color: COLORS.white,
    fontFamily: fonts.medium,
  },
  headerRight: {
    width: widthPercentageToDP(10),
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    marginBottom: heightPercentageToDP(2),
  },
  swiper: {
    height: heightPercentageToDP(25),
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: widthPercentageToDP(5),
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 16,
  },
  pagination: {
    position: "absolute",
    bottom: -heightPercentageToDP(3),
  },
  dot: {
    width: widthPercentageToDP(2),
    height: widthPercentageToDP(2),
    borderRadius: widthPercentageToDP(1),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: widthPercentageToDP(1),
  },
  activeDot: {
    backgroundColor: COLORS.primaryColor,
    width: widthPercentageToDP(6),
  },
  content: {
    padding: widthPercentageToDP(5),
  },
  title: {
    fontSize: heightPercentageToDP(2.3),
    color: "white",
    fontFamily: fonts.medium,
  },
  description: {
    fontSize: heightPercentageToDP(1.5),
    color: COLORS.gray2,
    lineHeight: heightPercentageToDP(2.8),
    marginBottom: heightPercentageToDP(2.5),
    fontFamily: fonts.regular,
  },
  exerciseCount: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: heightPercentageToDP(1),
  },
  exerciseIcon: {
    fontSize: heightPercentageToDP(2),
    marginRight: widthPercentageToDP(2),
    fontFamily: fonts.medium,
  },
  exerciseText: {
    fontSize: heightPercentageToDP(1.6),
    color: "white",
    fontFamily: fonts.medium,
  },
  scheduleTitle: {
    fontSize: heightPercentageToDP(2),
    fontFamily: fonts.medium,
    color: "white",
    marginBottom: heightPercentageToDP(2.5),
  },
  activeScheduleItem: {
    backgroundColor: COLORS.primaryColor,
    borderRadius: 12,
    padding: widthPercentageToDP(4),
    marginBottom: heightPercentageToDP(1.5),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scheduleItem: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: widthPercentageToDP(4),
    marginBottom: heightPercentageToDP(1.5),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scheduleLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  activeIcon: {
    width: widthPercentageToDP(10),
    height: widthPercentageToDP(10),
    borderRadius: widthPercentageToDP(5),
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    marginRight: widthPercentageToDP(3),
  },
  scheduleIcon: {
    width: widthPercentageToDP(10),
    height: widthPercentageToDP(10),
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: widthPercentageToDP(3),
    borderWidth: 0.3,
    borderRadius: 30,
  },
  activeScheduleDay: {
    fontSize: heightPercentageToDP(1.7),
    marginBottom: heightPercentageToDP(0.5),
    fontFamily: fonts.semiBold,
  },
  scheduleDay: {
    fontSize: heightPercentageToDP(1.7),
    color: "white",
    fontFamily: fonts.semiBold,
  },
  activeScheduleDesc: {
    fontSize: heightPercentageToDP(1.3),
    color: "#333",
    lineHeight: heightPercentageToDP(2),
    fontFamily: fonts.regular,
  },
  mondayTag: {
    flexDirection: "row",
    alignItems: "center",
  },
  mondayTagText: {
    fontSize: heightPercentageToDP(1.5),
    color: "#000",
    fontFamily: fonts.medium,
    marginRight: widthPercentageToDP(1.5),
  },
  scheduleImage: {
    width: widthPercentageToDP(15),
    height: widthPercentageToDP(15),
    borderRadius: 8,
    marginLeft: widthPercentageToDP(3),
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: widthPercentageToDP(5),
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: heightPercentageToDP(2),
  },
  modalTitle: {
    fontSize: heightPercentageToDP(2.3),
    color: COLORS.white,
    fontFamily: fonts.medium,
    flex: 1,
    textTransform: 'capitalize'
  },
  closeButton: {},
  inputContainer: {
    marginBottom: heightPercentageToDP(2),
  },
  inputLabel: {
    fontSize: heightPercentageToDP(1.8),
    color: COLORS.white,
    fontFamily: fonts.medium,
    marginBottom: heightPercentageToDP(1),
  },
  input: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 8,
    padding: widthPercentageToDP(3),
    color: COLORS.white,
    fontFamily: fonts.regular,
    fontSize: heightPercentageToDP(1.8),
    borderWidth: 1,
    borderColor: COLORS.gray3,
  },
  disabledInput: {
    backgroundColor: COLORS.gray3,
    color: COLORS.gray2,
  },
  descriptionInput: {
    height: heightPercentageToDP(15),
    textAlignVertical: "top",
  },
  uploadArea: {
    height: heightPercentageToDP(20),
    borderWidth: 2,
    borderColor: "#444",
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(34, 34, 37)",
    overflow: "hidden",
  },
  placeholderContainer: {
    alignItems: "center",
    paddingHorizontal: heightPercentageToDP(2),
  },
  uploadIcon: {
    padding: heightPercentageToDP(1.2),
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: heightPercentageToDP(2),
  },
  uploadText: {
    textAlign: "center",
    marginBottom: heightPercentageToDP(1),
  },
  uploadLink: {
    color: COLORS.primaryColor,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  uploadHint: {
    color: "#999",
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});