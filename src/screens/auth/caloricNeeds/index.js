"use client"

import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useDispatch, useSelector } from "react-redux"
import fonts from "../../../assets/fonts"
import CustomButton from "../../../components/CustomButton"
import ProgressBar from "../../../components/progressBar"
import RouteName from "../../../navigation/RouteName/index"
import { nextSection, previousSection, setCurrentSection } from "../../../store/slices/progressSlice"
import { COLORS } from "../../../utils/COLORS"

export default function CaloricNeeds() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const dispatch = useDispatch() 
  const { currentSection } = useSelector((state) => state.progress)
const insets = useSafeAreaInsets();
  useEffect(() => {
    dispatch(setCurrentSection(7)) // Assuming this is section 7
  }, [dispatch])
 
  const handleNext = () => {
    dispatch(nextSection())
    navigation.navigate(RouteName.All_Set)
  }

  const handleBack = () => {
    dispatch(previousSection())
    navigation.goBack()
  }

  return (
    <View style={[styles.container,{paddingBottom:insets.bottom}]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={wp(6)} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="water" size={wp(5)} color={COLORS.primaryColor} />
        </View>
        <Text style={styles.title}>{t("CaloricNeeds.title")}</Text>
        <ProgressBar />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Caloric Needs Title and Description */}
        <Text style={styles.sectionTitle}>{t("CaloricNeeds.title")}</Text>
        <Text style={styles.description}>{t("CaloricNeeds.description")}</Text>

        {/* BMR Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t("CaloricNeeds.bmrLabel")}</Text>
          <Text style={styles.calorieValue}>{t("CaloricNeeds.caloriesPerDay", { value: 1649 })}</Text>
          <Text style={styles.cardDescription}>{t("CaloricNeeds.bmrDescription")}</Text>
        </View>

        {/* TDEE Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t("CaloricNeeds.tdeeLabel")}</Text>
          <Text style={styles.calorieValue}>{t("CaloricNeeds.caloriesPerDay", { value: 1649 })}</Text>
          <Text style={styles.cardDescription}>{t("CaloricNeeds.tdeeDescription")}</Text>
        </View>

        {/* Target Daily Calories Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t("CaloricNeeds.targetDailyCaloriesLabel")}</Text>
          <Text style={styles.calorieValue}>{t("CaloricNeeds.caloriesPerDay", { value: 2556 })}</Text>
          <Text style={styles.cardDescription}>{t("CaloricNeeds.targetDailyCaloriesDescription")}</Text>
        </View>

        {/* Recommended Macros */}
        <Text style={[styles.sectionTitle, { marginTop: hp(3) }]}>{t("CaloricNeeds.recommendedMacros")}</Text>

        <View style={styles.macrosContainer}>
          {/* Protein */}
          <View style={[styles.macroBox, { backgroundColor: "#463F22" }]}>
            <Text style={styles.macroValue}>{t("CaloricNeeds.grams", { value: 125 })}</Text>
            <Text style={styles.macroLabel}>{t("CaloricNeeds.protein")}</Text>
            <Text style={styles.macroCalories}>{t("CaloricNeeds.calories", { value: 506 })}</Text>
          </View>

          {/* Carbs */}
          <View style={[styles.macroBox, { backgroundColor: "#294141" }]}>
            <Text style={styles.macroValue}>{t("CaloricNeeds.grams", { value: 325 })}</Text>
            <Text style={styles.macroLabel}>{t("CaloricNeeds.carbs")}</Text>
            <Text style={styles.macroCalories}>{t("CaloricNeeds.calories", { value: 1412 })}</Text>
          </View>

          {/* Fat */}
          <View style={[styles.macroBox, { backgroundColor: "#FFD24A" }]}>
            <Text style={styles.macroValue}>{t("CaloricNeeds.grams", { value: 71 })}</Text>
            <Text style={styles.macroLabel}>{t("CaloricNeeds.fat")}</Text>
            <Text style={styles.macroCalories}>{t("CaloricNeeds.calories", { value: 639 })}</Text>
          </View>
        </View>

        {/* Note */}
        <Text style={styles.note}>
          {t("CaloricNeeds.note")}
        </Text>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <CustomButton title={t("CaloricNeeds.next")} onPress={handleNext} />
        </View>
      </ScrollView>
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
    flexGrow: 1,
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    paddingBottom: hp(6),
  },
  sectionTitle: {
   fontSize: wp(5),
          fontFamily: fonts.medium,
          color: "white",
          marginTop: hp(2),
  },
  description: {
    fontSize: wp(3),
            color: "#cccccc",
            marginBottom: hp(2),
            fontFamily: fonts.regular,
  },
  card: {
    backgroundColor: COLORS.backgroundColor,
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
    borderColor:COLORS.gray3,
    borderWidth:0.3
  },
  cardLabel: {
    fontSize: wp(3),
    color: "white",
              fontFamily: fonts.medium,

  },
  calorieValue: {
    fontSize: wp(5),
    color: "white",
              fontFamily: fonts.bold,

  },
  cardDescription: {
    fontSize: wp(3),
    color: "#cccccc",
              fontFamily: fonts.regular,

  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp(1.5),
    marginBottom: hp(2.5),
  },
  macroBox: {
    width: wp(26),
    height: wp(26),
    borderRadius: wp(2),
    padding: wp(3),
    justifyContent: "center",
    alignItems:'center'
  },
  macroValue: {
    fontSize: wp(5),
    color: "white",
              fontFamily: fonts.medium,

  },
  macroLabel: {
    fontSize: wp(3.5),
    color: "white",
              fontFamily: fonts.regular,

  },
  macroCalories: {
    fontSize: wp(3),
    color: "white",
    opacity: 0.8,
                  fontFamily: fonts.regular,

  },
  note: {
    fontSize: wp(3.2),
    color: "#cccccc",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: hp(3),
    paddingHorizontal: wp(2),
  },
  buttonContainer: {
    marginTop: hp(1),
  },
})
