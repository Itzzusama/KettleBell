"use client"

import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
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
} from "react-native"
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useDispatch, useSelector } from "react-redux"
import fonts from "../../../assets/fonts"
import { Icons } from "../../../assets/icons"
import CustomButton from "../../../components/CustomButton"
import ProgressBar from "../../../components/progressBar"
import RouteName from "../../../navigation/RouteName/index"
import {
  nextSection,
  previousSection,
  setCurrentSection,
  updateUserData,
} from "../../../store/slices/progressSlice"
import { COLORS } from "../../../utils/COLORS"

const AddItemInput = ({ placeholder, onAdd, buttonText }) => {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState("")
  const insets = useSafeAreaInsets();
  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim())
      setInputValue("")
    }
  }

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
  )
}

export default function NutritionPreferences() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { userData, currentSection } = useSelector((state) => state.progress)
  const insets = useSafeAreaInsets();
  const [dietaryRestrictions, setDietaryRestrictions] = useState(
    userData.nutrition?.dietaryRestrictions || []
  )
  const [mealPreferences, setMealPreferences] = useState(
    userData.nutrition?.mealPreferences ? [userData.nutrition.mealPreferences] : []
  )

  useEffect(() => {
    dispatch(setCurrentSection(6))
  }, [dispatch])

  const handleNext = () => {
    dispatch(
      updateUserData({
        nutrition: {
          dietaryRestrictions,
          mealPreferences: mealPreferences[0] || "",
        }
      })
    )
    dispatch(nextSection())
    navigation.navigate(RouteName.Caloric_Needs)
  }

  const handleBack = () => {
    dispatch(previousSection())
    navigation.goBack()
  }

  const addDietaryRestriction = (restriction) => {
    setDietaryRestrictions([...dietaryRestrictions, restriction])
  }

  const addMealPreference = (preference) => {
    setMealPreferences([...mealPreferences, preference]) // Store only one meal preference as a string
  }

  const removeDietaryRestriction = (index) => {
    setDietaryRestrictions(dietaryRestrictions.filter((_, i) => i !== index))
  }

  const removeMealPreference = (index) => {
    setMealPreferences([])
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerColor} />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={wp(6)} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.nutritionIcon}>
          <Image source={Icons.mask} />
        </View>
        <Text style={styles.title}>{t("Nutrition.title")}</Text>
        <ProgressBar />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.mainTitle}>{t("Nutrition.mainTitle")}</Text>

          <Text style={styles.sectionLabel}>
            {t("Nutrition.dietaryRestriction")}
          </Text>

          <AddItemInput
            placeholder="Nutrition.enterDietaryRestriction"
            onAdd={addDietaryRestriction}
            buttonText="Nutrition.add"
          />

          <View style={styles.tagsContainer}>
            {dietaryRestrictions.map((restriction, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => removeDietaryRestriction(index)}
              >
                <Text style={styles.tagText}>{restriction}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Meal Preferences Section */}
          <Text style={[styles.sectionLabel, { marginTop: hp(4) }]}>
            {t("Nutrition.mealPreferences")}
          </Text>

          <AddItemInput
            placeholder="Nutrition.enterMealPreference"
            onAdd={addMealPreference}
            buttonText="Nutrition.add"
          />

          {/* Meal Preference Tags */}
          <View style={styles.tagsContainer}>
            {mealPreferences.map((preference, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => removeMealPreference(index)}
              >
                <Text style={styles.tagText}>{preference}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton title={t("Nutrition.next")} onPress={handleNext} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
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
  nutritionIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
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
    marginBottom: hp(2),
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
    marginVertical: hp(6),
  },
})