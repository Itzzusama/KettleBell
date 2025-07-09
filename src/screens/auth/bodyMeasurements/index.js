import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
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
const BodyMeasurementsSchema = Yup.object().shape({
  chest: Yup.number()
    .min(10, "Chest must be at least 10 cm")
    .required("Chest measurement is required")
    .typeError("Chest must be a number"),
  waist: Yup.number()
    .min(10, "Waist must be at least 10 cm")
    .required("Waist measurement is required")
    .typeError("Waist must be a number"),
  hips: Yup.number()
    .min(10, "Hips must be at least 10 cm")
    .required("Hips measurement is required")
    .typeError("Hips must be a number"),
  thighs: Yup.number()
    .min(10, "Thighs must be at least 10 cm")
    .required("Thighs measurement is required")
    .typeError("Thighs must be a number"),
  arms: Yup.number()
    .min(10, "Arms must be at least 10 cm")
    .required("Arms measurement is required")
    .typeError("Arms must be a number"),
});

export default function BodyMeasurements() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.progress);
  const insets = useSafeAreaInsets();
  const toast = useToast();

  useEffect(() => {
    dispatch(setCurrentSection(2));
  }, [dispatch]);

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
        <View style={styles.userIcon}>
          <Ionicons name="pulse" size={wp(6)} color={COLORS.primaryColor} />
        </View>
        <Text style={styles.title}>{t("BodyMeasurements.title")}</Text>
        <ProgressBar />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>
            {t("BodyMeasurements.sectionTitle")}
          </Text>
          <Text style={styles.subtitle}>{t("BodyMeasurements.subtitle")}</Text>
          <Formik
            initialValues={{
              chest: userData.bodyMeasurements?.chest?.toString() || "",
              waist: userData.bodyMeasurements?.waist?.toString() || "",
              hips: userData.bodyMeasurements?.hips?.toString() || "",
              thighs: userData.bodyMeasurements?.thighs?.toString() || "",
              arms: userData.bodyMeasurements?.arms?.toString() || "",
            }}
            validationSchema={BodyMeasurementsSchema}
            onSubmit={(values) => {
              dispatch(
                updateUserData({
                  bodyMeasurements: {
                    chest: parseInt(values.chest),
                    waist: parseInt(values.waist),
                    hips: parseInt(values.hips),
                    thighs: parseInt(values.thighs),
                    arms: parseInt(values.arms),
                  },
                })
              );
              dispatch(nextSection());
              navigation.navigate(RouteName.Health_Information);
            }}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => {
              // Show toast for validation errors
              useEffect(() => {
                if (touched.chest && errors.chest) {
                  toast.showToast({
                    type: "error",
                    message: errors.chest,
                    duration: 4000,
                  });
                }
                if (touched.waist && errors.waist) {
                  toast.showToast({
                    type: "error",
                    message: errors.waist,
                    duration: 4000,
                  });
                }
                if (touched.hips && errors.hips) {
                  toast.showToast({
                    type: "error",
                    message: errors.hips,
                    duration: 4000,
                  });
                }
                if (touched.thighs && errors.thighs) {
                  toast.showToast({
                    type: "error",
                    message: errors.thighs,
                    duration: 4000,
                  });
                }
                if (touched.arms && errors.arms) {
                  toast.showToast({
                    type: "error",
                    message: errors.arms,
                    duration: 4000,
                  });
                }
              }, [errors, touched]);

              return (
                <>
                  <Text style={styles.label}>Chest (cm)</Text>
                  <CustomInput
                    value={values.chest}
                    onChangeText={handleChange("chest")}
                    keyboardType="numeric"
                    placeholder="30"
                    error={touched.chest && errors.chest}
                  />
                  <Text style={styles.label}>Waist (cm)</Text>
                  <CustomInput
                    value={values.waist}
                    onChangeText={handleChange("waist")}
                    keyboardType="numeric"
                    placeholder="80"
                    error={touched.waist && errors.waist}
                  />
                  <Text style={styles.label}>Hips (cm)</Text>
                  <CustomInput
                    value={values.hips}
                    onChangeText={handleChange("hips")}
                    keyboardType="numeric"
                    placeholder="95"
                    error={touched.hips && errors.hips}
                  />
                  <View style={styles.rowContainer}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Thighs (cm)</Text>
                      <CustomInput
                        value={values.thighs}
                        onChangeText={handleChange("thighs")}
                        keyboardType="numeric"
                        placeholder="95"
                        style={styles.input}
                        error={touched.thighs && errors.thighs}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Arms (cm)</Text>
                      <CustomInput
                        value={values.arms}
                        onChangeText={handleChange("arms")}
                        keyboardType="numeric"
                        placeholder="95"
                        style={styles.input}
                        error={touched.arms && errors.arms}
                      />
                    </View>
                  </View>
                  <View style={styles.buttonContainer}>
                    <CustomButton
                      title={t("BodyMeasurements.next")}
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
  userIcon: {
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
  sectionTitle: {
    fontSize: wp(5),
    fontFamily: fonts.medium,
    color: "white",
    marginTop: hp(2),
  },
  subtitle: {
    fontSize: wp(3),
    color: "#cccccc",
    marginBottom: hp(2),
    fontFamily: fonts.regular,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  label: {
    fontSize: wp(3.5),
    color: "white",
    marginBottom: hp(1),
    fontFamily: fonts.regular,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: wp(3),
    width: "100%",
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    width: "100%",
  },
  buttonContainer: {
    marginVertical: hp(4),
  },
});