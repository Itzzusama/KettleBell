"use client"

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import fonts from "../../../assets/fonts";
import CustomButton from "../../../components/CustomButton";
import ProgressBar from "../../../components/progressBar";
import RouteName from "../../../navigation/RouteName/index";
import { baseUrl } from "../../../services/api";
import { previousSection, setCurrentSection, setSetupComplete } from "../../../store/slices/progressSlice";
import { COLORS } from "../../../utils/COLORS";
import { useToast } from "../../../utils/Toast/toastContext";

export default function AllSet() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.progress);
  const toast = useToast();
  const [loading, setLoading] = useState(false)
  const insets = useSafeAreaInsets();
  // console.log("userData====", userData);

  useEffect(() => {
    dispatch(setCurrentSection(8));
  }, [dispatch]);

  const handleStartJourney = async () => {
    setLoading(true)
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const payload = {
        name: userData.name || "",
        basicInfo: {
          gender: userData.basicInfo?.gender || "",
          age: parseInt(userData.basicInfo?.age) || 0,
          height: parseInt(userData.basicInfo?.height) || 0,
          weight: parseInt(userData.basicInfo?.weight) || 0,
        },
        bodyMeasurements: {
          chest: parseInt(userData.bodyMeasurements?.chest) || 0,
          waist: parseInt(userData.bodyMeasurements?.waist) || 0,
          hips: parseInt(userData.bodyMeasurements?.hips) || 0,
          thighs: parseInt(userData.bodyMeasurements?.thighs) || 0,
          arms: parseInt(userData.bodyMeasurements?.arms) || 0,
        },
        healthInfo: {
          medicalConditions: userData.healthInfo?.medicalConditions || [],
          injuriesOrLimitations: userData.healthInfo?.injuriesOrLimitations || [],
        },
        fitnessBackground: {
          activityLevel: userData.fitnessBackground?.activityLevel || "",
          exerciseFrequency: parseInt(userData.fitnessBackground?.exerciseFrequency) || 0,
          exerciseHistory: userData.fitnessBackground?.exerciseHistory || "",
        },
        fitnessGoals: {
          primaryGoal: userData.fitnessGoals?.primaryGoal || "",
          specificGoals: userData.fitnessGoals?.specificGoals || [],
        },
        nutrition: {
          dietaryRestrictions: userData.nutrition?.dietaryRestrictions || [],
          mealPreferences: userData.nutrition?.mealPreferences || "",
        },
      };

      console.log("API Payload====", JSON.stringify(payload, null, 2));

      const response = await axios.put(`${baseUrl}api/auth/update-details`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("response.data==================>>>>>>", response.data);
      toast.showToast({
        type: 'success',
        message: response.data.message,
        duration: 4000,
      });
      dispatch(setSetupComplete(true));
      navigation.navigate(RouteName.MainStack);
    } catch (error) {
      console.error('Failed to update user details:', error.response?.data?.message || error.message);
      toast.showToast({
        type: 'error',
        message: error.response?.data?.message || 'An error occurred. Please try again.',
        duration: 4000,
      });
    } finally {
      setLoading(false)
    }
  };

  const handleBack = () => {
    dispatch(previousSection());
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={wp(6)} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark" size={wp(5)} color={COLORS.primaryColor} />
        </View>
        <Text style={styles.title}>{t("AllSet.title")}</Text>
        <ProgressBar />
      </View>

      <View style={styles.content}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={wp(12)} color={COLORS.primaryColor} />
        </View>

        <Text style={styles.successTitle}>{t("AllSet.successTitle")}</Text>

        <Text style={styles.description}>{t("AllSet.description")}</Text>

        <Text style={styles.subDescription}>{t("AllSet.subDescription")}</Text>

        <View style={styles.buttonContainer}>
          <CustomButton title={t("AllSet.button")} onPress={handleStartJourney} loading={loading} disabled={loading} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  headerContainer: {
    backgroundColor: "#181819",
    borderBottomLeftRadius: hp(4),
    borderBottomRightRadius: hp(4),
    paddingHorizontal: wp(5),
  },
  header: {
    paddingTop: hp(6),
    paddingBottom: hp(2),
  },
  backButton: {
    width: wp(10),
    height: wp(10),
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    borderWidth: 2,
    borderColor: COLORS.primaryColor,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: hp(1),
  },
  title: {
    fontSize: wp(6),
    fontFamily: fonts.bold,
    color: "white",
    paddingBottom: hp(2),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingVertical: hp(4),
    alignItems: "center",
    justifyContent: "center",
  },
  successCircle: {
    width: wp(35),
    height: wp(35),
    borderRadius: wp(17.5),
    backgroundColor: "#3a3a3a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(4),
  },
  successTitle: {
    fontSize: wp(5),
    color: "white",
    marginBottom: hp(2),
    textAlign: "center",
    fontFamily: fonts.bold,
  },
  description: {
    fontSize: wp(3.4),
    color: "#cccccc",
    textAlign: "center",
    lineHeight: wp(5.5),
    marginBottom: hp(2),
    paddingHorizontal: wp(2),
    fontFamily: fonts.regular,
  },
  subDescription: {
    fontSize: wp(3),
    color: "#cccccc",
    textAlign: "center",
    lineHeight: wp(5),
    marginBottom: hp(4),
    paddingHorizontal: wp(2),
    fontFamily: fonts.regular,
  },
  buttonContainer: {
    width: "100%",
    position: "absolute",
    bottom: hp(4),
    paddingHorizontal: wp(2),
  },
});