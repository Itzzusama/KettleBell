import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  Image,
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
import { Images } from "../../assets/images";
import CustomButton from "../../components/CustomButton";
import RouteName from "../../navigation/RouteName";
import { COLORS } from "../../utils/COLORS";

const KettlebellSwing = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const targetMuscles = t("ExerciseDetail.target_muscles", { returnObjects: true });
  const equipment = t("ExerciseDetail.equipment", { returnObjects: true });
  const instructions = t("ExerciseDetail.instructions", { returnObjects: true });

  return (
    <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
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
        <Text style={styles.headerTitle}>{t("ExerciseDetail.header_title")}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: hp(10) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image

            source={{
              uri: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.exerciseTitle}>{t("ExerciseDetail.exercise_title")}</Text>
          <Text style={styles.exerciseDescription}>
            {t("ExerciseDetail.exercise_description")}
          </Text>
          <View
            style={{
              borderWidth: 0.5,
              borderColor: "#333",
              marginVertical: hp(0.2),
            }}
          />

          <View style={{ marginVertical: hp(2) }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: wp(2),
                }}
              >
                <Image source={Images.dumble} style={styles.detailImage} />
                <Text style={styles.detailLabel}>{t("ExerciseDetail.category_label")}</Text>
              </View>
              <Text style={styles.detailValue}>{t("ExerciseDetail.category_value")}</Text>
            </View>
            <View
              style={{
                borderWidth: 0.5,
                borderColor: "#333",
                marginVertical: hp(2),
              }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: wp(2),
                }}
              >
                <Image source={Images.dumble} style={styles.detailImage} />
                <Text style={styles.detailLabel}>{t("ExerciseDetail.category_label")}</Text>
              </View>
              <Text style={styles.detailValue}>{t("ExerciseDetail.category_value")}</Text>
            </View>
          </View>
          <View
            style={{
              borderWidth: 0.5,
              borderColor: "#333",
              marginVertical: hp(0.2),
              marginBottom: hp(2),
            }}
          />

          {/* Target Muscles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("ExerciseDetail.target_muscles_title")}</Text>
            <View style={styles.tagsContainer}>
              {targetMuscles.map((muscle, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{muscle}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Equipment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("ExerciseDetail.equipment_title")}</Text>
            <View style={styles.tagsContainer}>
              {equipment.map((item, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section2}>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>{t("ExerciseDetail.instructions_title")}</Text>
              {instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>{index + 1}.</Text>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title={t("ExerciseDetail.start_button")}
            onPress={() => navigation.navigate(RouteName.Exercise_Start)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default KettlebellSwing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: hp(6),
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  backButton: {
    padding: wp(2),
    marginRight: wp(3),
  },
  headerTitle: {
    color: "#FFF",
    fontSize: hp(2.3),
    flex: 1,
    textAlign: "center",
    marginRight: wp(11),
    fontFamily: fonts.medium,
  },
  imageContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    alignItems: "center",
  },
  mainImage: {
    width: "100%",
    height: hp(25),
    borderRadius: wp(4),
    maxWidth: 600, // Added for responsiveness on larger screens
  },
  infoContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  exerciseTitle: {
    color: "#FFF",
    fontSize: wp(5.2),
    fontFamily: fonts.medium,
  },
  exerciseDescription: {
    color: "#888",
    fontSize: wp(3),
    lineHeight: wp(5),
    marginBottom: hp(3),
    fontFamily: fonts.regular,
  },
  detailsRow: {
    marginBottom: hp(3),
    gap: wp(5),
  },
  detailItem: {
    flex: 1,
  },
  detailIconContainer: {
    marginBottom: hp(1),
  },
  detailLabel: {
    color: COLORS.white,
    fontSize: wp(3),
    marginBottom: hp(0.5),
    fontFamily: fonts.regular,
  },
  detailValue: {
    color: "#FFF",
    fontSize: wp(3.7),
    fontFamily: fonts.medium,
  },
  section: {
    marginBottom: hp(3),
    backgroundColor: "#272729",
    padding: hp(2),
    borderRadius: 10,
  },
  section2: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: wp(4),
    fontFamily: fonts.medium,
    marginBottom: hp(1.5),
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
  },
  tag: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(5),
    borderWidth: 0.5,
    borderColor: "#444",
  },
  tagText: {
    color: "rgba(92, 92, 96, 1)",
    fontSize: wp(3),
    fontFamily: fonts.regular,
  },
  instructionsHeader: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    marginBottom: hp(2),
  },
  instructionsTitle: {
    color: "#FFF",
    fontSize: wp(5),
    fontFamily: fonts.medium,
    paddingBottom: hp(1),
  },
  instructionsContainer: {
    backgroundColor: COLORS.primaryColor,
    borderRadius: wp(3),
    padding: wp(4),
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: hp(1.5),
    alignItems: "flex-start",
  },
  instructionNumber: {
    color: "#FFF",
    fontSize: wp(3.5),
    fontFamily: fonts.medium,
    marginRight: wp(2),
    minWidth: wp(5),
  },
  instructionText: {
    color: "#FFF",
    fontSize: wp(3.2),
    lineHeight: wp(5),
    flex: 1,
    fontFamily: fonts.regular,
  },
  buttonContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: "#1A1A1A",
    alignItems: "center",
  },
});
