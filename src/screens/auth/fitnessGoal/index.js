import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import fonts from "../../../assets/fonts";
import { Icons } from "../../../assets/icons";
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
// Reusable AddItemInput component
const AddItemInput = ({ placeholder, onAdd, buttonText }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const insets = useSafeAreaInsets();
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
          <Text style={styles.addButtonText}>+ {t(buttonText)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function FitnessGoal() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userData, currentSection } = useSelector((state) => state.progress);

  const primaryGoalOptions = [
    { label: "Weight Loss", value: "weightLoss" },
    { label: "Weight Gain", value: "weightGain" },
    
  ];

  // Initialize state from Redux
  const [open, setOpen] = useState(false);
  const [selectedPrimaryGoal, setSelectedPrimaryGoal] = useState(
    userData.fitnessGoals?.primaryGoal?.toLowerCase() || "weightLoss"
  );
  const [specificGoals, setSpecificGoals] = useState(userData.fitnessGoals?.specificGoals || []);
const insets = useSafeAreaInsets();
  useEffect(() => {
    dispatch(setCurrentSection(5));
  }, [dispatch]);

  const handleNext = () => {
    dispatch(
      updateUserData({
        fitnessGoals: {
          primaryGoal: selectedPrimaryGoal.charAt(0).toUpperCase() + selectedPrimaryGoal.slice(1).replace(/([A-Z])/g, ' $1').trim(),
          specificGoals,
        },
      })
    );
    dispatch(nextSection());
    navigation.navigate(RouteName.Nutrition);
  };

  const handleBack = () => {
    dispatch(previousSection());
    navigation.goBack();
  };

  const addSpecificGoal = (goal) => {
    setSpecificGoals([...specificGoals, goal]);
  };

  const removeSpecificGoal = (index) => {
    setSpecificGoals(specificGoals.filter((_, i) => i !== index));
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
          <Image source={Icons.arrow} />
        </View>
        <Text style={styles.title}>{t("FitnessGoal.title")}</Text>
        <ProgressBar />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Main Title */}
          <Text style={styles.mainTitle}>{t("FitnessGoal.mainTitle")}</Text>
          <Text style={styles.subtitle}>{t("FitnessGoal.subtitle")}</Text>

          {/* Primary Goal Dropdown */}
          <Text style={styles.sectionLabel}>{t("FitnessGoal.primaryGoal")}</Text>
          <View style={styles.dropdownContainer}>
            <DropDownPicker
              open={open}
              value={selectedPrimaryGoal}
              items={primaryGoalOptions}
              setOpen={setOpen}
              setValue={setSelectedPrimaryGoal}
              style={styles.dropdownButton}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownMenu}
              placeholder="Select Primary Goal"
              placeholderStyle={styles.dropdownPlaceholder}
              zIndex={1000}
              zIndexInverse={2000}
              ArrowDownIconComponent={() => (
                <Ionicons name="chevron-down" size={wp(5)} color="white" />
              )}
              ArrowUpIconComponent={() => (
                <Ionicons name="chevron-up" size={wp(5)} color="white" />
              )}
            />
          </View>

          {/* Specific Goals Section */}
          <Text style={[styles.sectionLabel, { marginTop: hp(3) }]}>
            {t("FitnessGoal.specificGoals")}
          </Text>

          <AddItemInput
            placeholder="FitnessGoal.addGoalPlaceholder"
            onAdd={addSpecificGoal}
            buttonText="FitnessGoal.add"
          />

          {/* Specific Goals Tags */}
          <View style={styles.tagsContainer}>
            {specificGoals.map((goal, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => removeSpecificGoal(index)}
              >
                <Text style={styles.tagText}>{goal}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton title={t("FitnessGoal.next")} onPress={handleNext} />
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
  content: {
    flexGrow: 1,
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
  },
  mainTitle: {
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
  sectionLabel: {
    fontSize: wp(3.5),
    color: "white",
    marginBottom: hp(1.5),
    fontFamily: fonts.regular,
  },
  dropdownContainer: {
    marginBottom: hp(2),
    zIndex: 1000, // Ensure dropdown is above other elements
  },
  dropdownButton: {
    backgroundColor: COLORS.backgroundColor,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.7),
    borderWidth: 1,
    borderColor: COLORS.gray3,
    minHeight: hp(5.5),
  },
  dropdownText: {
    color: "white",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
  },
  dropdownPlaceholder: {
    color: "#666",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
  },
  dropdownMenu: {
    backgroundColor: "#2a2a2a",
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.gray3,
    paddingVertical: hp(1),
    maxHeight: hp(40),
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
    minHeight: hp(5.5),
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
    paddingHorizontal: wp(3),
    paddingVertical: 5,
    borderRadius: wp(2),
    marginRight: wp(1),
  },
  addButtonText: {
    color: "white",
    fontSize: wp(3),
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