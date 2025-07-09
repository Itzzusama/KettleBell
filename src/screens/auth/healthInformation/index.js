import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import fonts from "../../../assets/fonts";
import CustomButton from "../../../components/CustomButton";
import ProgressBar from "../../../components/progressBar";
import RouteName from "../../../navigation/RouteName/index";
import {
  nextSection,
  previousSection,
  setCurrentSection,
  updateUserData,
} from "../../../store/slices/progressSlice";
import { COLORS } from "../../../utils/COLORS";

const AddItemInput = ({ placeholder, onAdd, buttonText }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={t(placeholder)}
          placeholderTextColor="#666"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>{t(buttonText)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HealthInformation() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.progress);

  const [medicalConditions, setMedicalConditions] = useState(
    userData.healthInfo?.medicalConditions || []
  );
  const [injuries, setInjuries] = useState(
    userData.healthInfo?.injuriesOrLimitations || []
  );

  useEffect(() => {
    dispatch(setCurrentSection(3));
  }, [dispatch]);

  const handleNext = () => {
    dispatch(updateUserData({ 
      healthInfo: { 
        medicalConditions, 
        injuriesOrLimitations: injuries 
      }
    }));
    dispatch(nextSection());
    navigation.navigate(RouteName.Fitness_Background);
  };

  const handleBack = () => {
    dispatch(previousSection());
    navigation.goBack();
  };

  const addMedicalCondition = (condition) => {
    setMedicalConditions([...medicalConditions, condition]);
  };

  const addInjury = (injury) => {
    setInjuries([...injuries, injury]);
  };

  const removeMedicalCondition = (index) => {
    setMedicalConditions(medicalConditions.filter((_, i) => i !== index));
  };

  const removeInjury = (index) => {
    setInjuries(injuries.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
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
          <Ionicons name="heart" size={wp(6)} color={COLORS.primaryColor} />
        </View>
        <Text style={styles.title}>{t("HealthInformation.title")}</Text>
        <ProgressBar />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>
            {t("HealthInformation.sectionTitle")}
          </Text>
          <Text style={styles.subtitle}>{t("HealthInformation.subtitle")}</Text>
          <Text style={styles.sectionLabel}>
            {t("HealthInformation.medicalConditions")}
          </Text>

          <AddItemInput
            placeholder="HealthInformation.enterMedicalCondition"
            onAdd={addMedicalCondition}
            buttonText="HealthInformation.add"
          />

          {/* Medical Conditions Tags */}
          <View style={styles.tagsContainer}>
            {medicalConditions.map((condition, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => removeMedicalCondition(index)}
              >
                <Text style={styles.tagText}>{condition}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Injuries Section */}
          <Text style={[styles.sectionLabel, { marginTop: hp(3) }]}>
            {t("HealthInformation.injuries")}
          </Text>

          <AddItemInput
            placeholder="HealthInformation.enterInjury"
            onAdd={addInjury}
            buttonText="HealthInformation.add"
          />

          {/* Injuries Tags */}
          <View style={styles.tagsContainer}>
            {injuries.map((injury, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => removeInjury(index)}
              >
                <Text style={styles.tagText}>{injury}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title={t("HealthInformation.next")}
              onPress={handleNext}
            />
          </View>
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
    paddingVertical: hp(1),
  },
  sectionLabel: {
    fontSize: wp(3.5),
    color: "white",
    marginBottom: hp(1.5),
    fontFamily: fonts.regular,
  },
  inputContainer: {
    marginBottom: hp(2),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.gray3,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.7),
    color: "white",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
  },
  addButton: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: 10,
    paddingVertical:5,
    borderRadius: wp(2),
    marginRight: wp(1),
  },
  addButtonText: {
    color: "white",
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2), 
    marginBottom: hp(2),
  },
  tag: {
    backgroundColor: "#2a2a2a",
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.7),
    borderRadius: wp(5),
    borderWidth: 0.5,
    borderColor: "#333",
  },
  tagText: {
    color: "#cccccc",
    fontSize: wp(2.5),
    fontFamily: fonts.regular,
  },
  buttonContainer: {
    marginVertical: hp(4),
  },
});