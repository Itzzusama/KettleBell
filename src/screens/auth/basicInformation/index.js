import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import fonts from "../../../assets/fonts";
import { Icons } from "../../../assets/icons";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import ProgressBar from "../../../components/progressBar";
import RouteName from "../../../navigation/RouteName/index";
import {
  nextSection,
  previousSection,
  setCurrentSection,
  updateUserData,
} from "../../../store/slices/progressSlice";
import { COLORS } from "../../../utils/COLORS";
import { useToast } from "../../../utils/Toast/toastContext";

// Yup validation schema
const BasicInfoSchema = Yup.object().shape({
  age: Yup.number()
    .min(13, "You must be at least 13 years old")
    .required("Age is required")
    .typeError("Age must be a number"),
  height: Yup.number()
    .min(10, "Height must be at least 10 cm")
    .required("Height is required")
    .typeError("Height must be a number"),
  weight: Yup.number()
    .min(10, "Weight must be at least 10 kg")
    .required("Weight is required")
    .typeError("Weight must be a number"),
});

export default function BasicInformation() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets()
  const dispatch = useDispatch();
  const toast = useToast();
  const { userData } = useSelector((state) => state.progress);
  const [selectedGender, setSelectedGender] = useState(
    userData.basicInfo?.gender || "male"
  );
  const [bmi, setBmi] = useState(userData.basicInfo?.bmi || "");

  const genderOptions = ["male", "female", "other"];

  useEffect(() => {
    dispatch(setCurrentSection(1));
  }, [dispatch]);

  const calculateBmi = (height, weight) => {
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100;
      const weightInKg = parseFloat(weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
      }
    }
    return "";
  };

  const handleBack = () => {
    dispatch(previousSection());
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={wp(6)} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.profileIconContainer}>
          <Image source={Icons.profile} style={styles.profileIcon} />
        </View>
        <Text style={styles.title}>{t("BasicInfo.title")}</Text>
        <ProgressBar />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>{t("BasicInfo.description")}</Text>
          <Formik
            initialValues={{
              age: userData.basicInfo?.age?.toString() || "",
              height: userData.basicInfo?.height?.toString() || "",
              weight: userData.basicInfo?.weight?.toString() || "",
            }}
            validationSchema={BasicInfoSchema}
            onSubmit={(values) => {
              const calculatedBmi = calculateBmi(values.height, values.weight);
              dispatch(
                updateUserData({
                  basicInfo: {
                    gender:
                      selectedGender.charAt(0).toUpperCase() +
                      selectedGender.slice(1),
                    age: parseInt(values.age),
                    height: parseInt(values.height),
                    weight: parseInt(values.weight),
                    bmi: parseFloat(calculatedBmi),
                  },
                })
              );
              dispatch(nextSection());
              navigation.navigate(RouteName.Body_Measurements);
            }}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => {
              // Update BMI when height or weight changes
              useEffect(() => {
                setBmi(calculateBmi(values.height, values.weight));
              }, [values.height, values.weight]);

              // Show toast for validation errors
              useEffect(() => {
                if (touched.age && errors.age) {
                  toast.showToast({
                    type: "error",
                    message: errors.age,
                    duration: 4000,
                  });
                }
                if (touched.height && errors.height) {
                  toast.showToast({
                    type: "error",
                    message: errors.height,
                    duration: 4000,
                  });
                }
                if (touched.weight && errors.weight) {
                  toast.showToast({
                    type: "error",
                    message: errors.weight,
                    duration: 4000,
                  });
                }
              }, [errors, touched]);

              return (
                <>
                  <Text style={styles.label}>{t("BasicInfo.gender")}</Text>
                  <View style={styles.genderContainer}>
                    {genderOptions.map((gender) => (
                      <TouchableOpacity
                        key={gender}
                        style={[
                          styles.genderButton,
                          selectedGender === gender && styles.genderButtonSelected,
                        ]}
                        onPress={() => setSelectedGender(gender)}
                      >
                        <Text
                          style={[
                            styles.genderButtonText,
                            selectedGender === gender &&
                            styles.genderButtonTextSelected,
                          ]}
                        >
                          {t(`BasicInfo.genders.${gender}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.label}>Age</Text>
                  <CustomInput
                    value={values.age}
                    onChangeText={handleChange("age")}
                    keyboardType="numeric"
                    error={touched.age && errors.age}
                  />
                  <Text style={styles.label}>Height (cm)</Text>
                  <CustomInput
                    value={values.height}
                    onChangeText={handleChange("height")}
                    keyboardType="numeric"
                    error={touched.height && errors.height}
                  />
                  <Text style={styles.label}>Weight (kg)</Text>
                  <CustomInput
                    value={values.weight}
                    onChangeText={handleChange("weight")}
                    keyboardType="numeric"
                    error={touched.weight && errors.weight}
                  />
                  <Text style={styles.label}>BMI</Text>
                  <CustomInput
                    value={bmi}
                    editable={false}
                    style={styles.bmiInput}
                    placeholder="Calculated BMI"
                  />
                  <View style={styles.buttonContainer}>
                    <CustomButton
                      title={t("BasicInfo.next")}
                      onPress={handleSubmit}
                    />
                  </View>
                </>
              );
            }}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
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
  profileIconContainer: {
    marginBottom: hp(2),
  },
  profileIcon: {
    width: wp(10),
    height: wp(10),
    resizeMode: "contain",
  },
  title: {
    fontSize: wp(6),
    fontFamily: fonts.bold,
    color: "white",
    paddingBottom: hp(2),
  },
  sectionTitle: {
    fontSize: wp(5),
    fontFamily: fonts.medium,
    color: "white",
    marginBottom: hp(2),
    marginTop: hp(2),
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  label: {
    fontSize: 14,
    color: "white",
    marginBottom: hp(1),
    fontFamily: fonts.regular,
  },
  genderContainer: {
    flexDirection: "row",
    gap: wp(3),
    marginBottom: hp(2),
  },
  genderButton: {
    flex: 1,
    placeholder: "Select Gender",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: "#4a4a4a",
    backgroundColor: "transparent",
  },
  genderButtonSelected: {
    backgroundColor: COLORS.primaryColor,
    borderColor: COLORS.gray,
  },
  genderButtonText: {
    color: "#cccccc",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
    textAlign: "center",
  },
  genderButtonTextSelected: {
    color: "white",
  },
  bmiInput: {
    backgroundColor: "#333333",
  },
  buttonContainer: {
    marginVertical: hp(4),
  },
});