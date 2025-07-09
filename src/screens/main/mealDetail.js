import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  Image,
  Platform,
  SafeAreaView,
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
import fonts from "../../assets/fonts";
import CustomButton from "../../components/CustomButton";
import { COLORS } from "../../utils/COLORS";

export default function MealDetail() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { meal } = useRoute().params || {};
  console.log("meal:===========>", meal);

  const recipeData = {
    title: meal.name,
    description: meal.description,
    image: meal.image,
    ingredients: meal.ingredients,
    instructions: meal.instructions,
  };

  // Updated renderIngredient to handle string-based ingredients
  const renderIngredient = (item, index) => (
    <View key={index} style={styles.ingredientItem}>
      <View style={styles.bulletPoint} />
      <Text style={styles.ingredientText}>
        {typeof item === "string" ? item : item.name}
      </Text>
    </View>
  );

  const renderInstruction = (instruction, index) => (
    <View
      key={index}
      style={[
        styles.instructionItem,
        index < recipeData.instructions.length - 1 && styles.instructionBorder,
      ]}
    >
      <Text style={styles.instructionText}>
        {index + 1}. {instruction}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={wp(6)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{meal.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Recipe Image */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageScrollContainer}
          >
            {meal.images && meal.images.length > 0 ? (
              meal.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.recipeImage}
                />
              ))
            ) : (
              <Image
                source={{ uri: recipeData.image }}
                style={styles.recipeImage}
              />
            )}
          </ScrollView>
        </View>

        {/* Recipe Info */}
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{recipeData.title}</Text>
          <Text style={styles.recipeDescription}>{recipeData.description}</Text>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="time-outline"
                  size={wp(5)}
                  color={COLORS.primaryColor}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{meal.mealType}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="time-outline"
                  size={wp(5)}
                  color={COLORS.primaryColor}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{meal.time}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="people-outline"
                  size={wp(5)}
                  color={COLORS.primaryColor}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{meal.dayOfWeek} Week</Text>
              </View>
            </View>
            <View style={styles.divider} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientsList}>
              {meal.ingredients && meal.ingredients.length > 0 ? (
                meal.ingredients.map(renderIngredient)
              ) : (
                <Text style={styles.noIngredientsText}>
                  No ingredients listed
                </Text>
              )}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>
                {t("MealDetail.instructions_title")}
              </Text>
              {meal.instructions.map(renderInstruction)}
            </View>
          </View>

          <CustomButton title={t("MealDetail.start_button")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: hp(6),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingTop: Platform.OS === "ios" ? hp(1) : hp(2),
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    color: "#FFF",
    fontSize: hp(2.3),
    textAlign: "center",
    flex: 1,
    fontFamily: fonts.medium,
  },
  placeholder: {
    width: wp(10),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(5),
  },
  imageContainer: {
    width: "100%",
    height: hp(30),
  },
  imageScrollContainer: {
    paddingHorizontal: wp(2),
  },
  recipeImage: {
    width: wp(90),
    height: "100%",
    borderRadius: 15,
    marginRight: wp(2),
  },
  recipeInfo: {
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
  },
  recipeTitle: {
    color: "#FFF",
    fontSize: wp(6),
    fontFamily: fonts.medium,
  },
  recipeDescription: {
    color: COLORS.gray2,
    fontSize: wp(3.2),
    lineHeight: wp(5),
    marginBottom: hp(3),
    fontFamily: fonts.regular,
  },
  divider: {
    borderWidth: 0.3,
    borderColor: COLORS.darkGray,
  },
  infoSection: {
    marginBottom: hp(3),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp(1),
  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: wp(2),
  },
  infoLabel: {
    color: "#FFF",
    fontSize: wp(3),
    fontFamily: fonts.regular,
  },
  section: {
    marginBottom: hp(3),
    fontFamily: fonts.regular,
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: wp(5),
    marginBottom: hp(1.3),
    fontFamily: fonts.medium,
  },
  ingredientsList: {
    marginLeft: wp(2),
    marginTop: hp(1),
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
    paddingHorizontal: wp(1),
  },
  bulletPoint: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
    backgroundColor: COLORS.primaryColor,
    marginRight: wp(3),
  },
  ingredientText: {
    color: "#CCC",
    fontSize: wp(3.5),
    flex: 1,
    fontFamily: fonts.medium,
  },
  noIngredientsText: {
    color: COLORS.gray2,
    fontStyle: "italic",
    marginLeft: wp(4),
    marginTop: hp(1),
  },
  instructionsContainer: {
    backgroundColor: COLORS.primaryColor,
    borderRadius: wp(3),
    padding: wp(4),
  },
  instructionsTitle: {
    color: COLORS.white,
    fontSize: wp(4.5),
    paddingBottom: hp(2),
    fontFamily: fonts.medium,
  },
  instructionItem: {
    marginBottom: hp(1.5),
  },
  instructionBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#E1A104",
    paddingBottom: hp(1.5),
  },
  instructionText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    lineHeight: wp(5),
    fontFamily: fonts.regular,
  },
});