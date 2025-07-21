import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
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
import fonts from "../../../../assets/fonts";
import RouteName from "../../../../navigation/RouteName";
import { GetApiRequest } from "../../../../services/api";
import { COLORS } from "../../../../utils/COLORS";

export default function Exercise() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [categoriesState, setCategoriesState] = useState([]);
  const [exercisesState, setExercisesState] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchInitialData = async () => {
    try {
      // Fetch categories and exercises in parallel
      const [categoriesRes, exercisesRes] = await Promise.all([
        GetApiRequest("api/exercise-categories"),
        GetApiRequest("api/exercises"),
      ]);

      // Process categories
      if (categoriesRes?.data?.data) {
        const fetchedCategories = categoriesRes.data.data.map((cat) => ({
          ...cat,
          active: false,
        }));
        setCategoriesState([
          { id: "all", name: "All", active: true },
          ...fetchedCategories,
        ]);
      }

      // Process exercises
      if (exercisesRes?.data?.data) {
        setExercisesState(exercisesRes.data.data);
      } else {
        console.log("No exercises found");
        setExercisesState([]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load data");
      setExercisesState([]);
    }
  };

  const ExerciseList = async (categoryId = "all") => {
    try {
      const endpoint =
        categoryId === "all"
          ? "api/exercises"
          : `api/exercises/category/${categoryId}`;

      const res = await GetApiRequest(endpoint);
      console.log("Exercises response:", res?.data?.data);

      if (res?.data?.data) {
        setExercisesState(res.data.data);
      } else {
        console.log("No exercises found for category:", categoryId);
        setExercisesState([]);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      Alert.alert("Error", "Failed to load exercises");
      setExercisesState([]);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    ExerciseList(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryPress = (categoryId) => {
    setCategoriesState((prev) =>
      prev.map((cat) => ({
        ...cat,
        active: cat.id === categoryId,
      }))
    );
    setSelectedCategory(categoryId);
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        item.active && styles.activeCategoryButton,
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Text
        style={[styles.categoryText, item.active && styles.activeCategoryText]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderExercise = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.exerciseCard,
        index % 2 === 0 ? styles.leftCard : styles.rightCard,
      ]}
      onPress={() =>
        navigation.navigate(RouteName.Exercise_Detail2, {
          exercise: item,
          exercisesState: exercisesState,
        })
      }
    >
      <Image
        source={{
          uri:
            item.images[0] ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9n8KUvSF8IZzTvs6t22w1kA4qpaBCyqqrTg&s",
        }}
        style={styles.exerciseImage}
      />
      <View style={styles.exerciseOverlay}>
        <View style={styles.exerciseContent}>
          <Text style={styles.exerciseTitle}>{item.name}</Text>
          <View style={styles.equipmentDurationRow}>
            <Text style={styles.exerciseEquipment}>{item.difficulty}</Text>
            <View style={styles.durationContainer}>
              <Ionicons name="time-outline" size={wp(3.5)} color="#FEC635" />
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>{t("Exercise.header_title")}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={wp(5)} color="#FFFFFF" />
          <TextInput
            style={styles.searchInput}
            placeholder={t("Exercise.search_placeholder")}
            placeholderTextColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>{t("Exercise.category_label")}</Text>
        <FlatList
          data={categoriesState}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Exercise Grid */}
      <FlatList
        data={exercisesState}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.exerciseGrid}
        columnWrapperStyle={styles.exerciseRow}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F21",
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
    fontFamily: fonts.medium,
  },
  placeholder: {
    width: wp(10),
  },
  searchContainer: {
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    borderWidth: 0.3,
    borderColor: COLORS.gray2,
    height: hp(7),
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: wp(3),
    marginLeft: wp(3),
    fontFamily: fonts.regular,
  },
  categorySection: {
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: wp(4.7),
    marginBottom: hp(1.5),
    fontFamily: fonts.medium,
  },
  exerciseGrid: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(10),
  },
  exerciseRow: {
    justifyContent: "space-between",
  },
  exerciseCard: {
    width: wp(44),
    height: hp(25),
    borderRadius: wp(4),
    marginBottom: hp(2),
    overflow: "hidden",
  },
  leftCard: {
    marginRight: wp(2),
  },
  rightCard: {
    marginLeft: wp(2),
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  exerciseOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    height: hp(10),
    padding: wp(3),
  },
  exerciseContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  exerciseTitle: {
    color: "#FFF",
    fontSize: wp(4),
    fontFamily: fonts.medium,
  },
  equipmentDurationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseEquipment: {
    color: "#CCC",
    fontSize: wp(3),
    fontFamily: fonts.regular,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    color: "#FEC635",
    fontSize: wp(3),
    fontFamily: fonts.medium,
    marginLeft: wp(1),
  },
  categoryList: {
    paddingRight: wp(4),
  },
  categoryButton: {
    paddingHorizontal: wp(5),
    paddingVertical: wp(0.7),
    borderRadius: wp(6),
    backgroundColor: COLORS.backgroundColor,
    marginRight: wp(3),
    borderWidth: 0.5,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    minHeight: wp(8),
  },
  activeCategoryButton: {
    backgroundColor: COLORS.primaryColor,
    borderColor: COLORS.gray3,
  },
  categoryText: {
    color: COLORS.gray3,
    fontSize: 12,
    fontFamily: fonts.medium,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: wp(4),
  },
  activeCategoryText: {
    color: "#000",
    fontFamily: fonts.medium,
  },
});
