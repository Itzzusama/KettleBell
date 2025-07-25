"use client";

import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Image,
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
import fonts from "../../../../assets/fonts";
import { Images } from "../../../../assets/images";
import ClientReportChart from "../../../../components/chart";
import RouteName from "../../../../navigation/RouteName";
import { GetApiRequest, PostApiRequest } from "../../../../services/api";
import { COLORS } from "../../../../utils/COLORS";
import { useDispatch, useSelector } from "react-redux";
import { Icons } from "../../../../assets/icons";
import LogoutModal from "../../../../components/LogoutModal";
import { setToken } from "../../../../store/slices/AuthConfig";
import { clearUserData, setUserData } from "../../../../store/slices/usersSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InstructorHome() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [exercise, setExercise] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const userData = useSelector((state) => state.users);
console.log("use====", userData?.location);

  const { t } = useTranslation();

  const getMyPlans = async () => {
    try {
      setIsLoading(true);
      const res = await GetApiRequest("api/exercises/my-exercises");
      if (res.data && res.data.data) {
        setExercise(res.data.data);
      }
    } catch (error) {
      console.log(error);
      // Alert.alert("Error", "Failed to load plans")
    } finally {
      setIsLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      const res = await GetApiRequest("api/exercise-categories/my-categories");
      if (res && res.data && res.data.data) {
        const fetchedCategories = res.data.data.map((cat) => ({
          ...cat,
          active: false,
        }));
        setCategories([
          { id: "all", name: "All", active: true },
          ...fetchedCategories,
        ]);
      }
    } catch (error) {
      console.log(error);
      // Alert.alert("Error", "Failed to load categories")
    }
  };

  const handleCategorySelect = (category) => {
    setCategories(
      categories.map((cat) => ({
        ...cat,
        active: cat.name === category.name,
      }))
    );
    setSelectedCategory(category.name);
  };

  const filteredExercises =
    selectedCategory === "All"
      ? exercise.filter((ex) =>
          ex.name.toLowerCase().includes(searchText.toLowerCase())
        )
      : exercise.filter(
          (ex) =>
            ex.category &&
            ex.category.name === selectedCategory &&
            ex.name.toLowerCase().includes(searchText.toLowerCase())
        );

  useEffect(() => {
    getCategories();
    getMyPlans();
  }, []);

  const ActivePlanCard = ({ number = "03" }) => (
    <LinearGradient
      colors={["#FFBB02", "#FFBB02"]}
      style={styles.activePlanCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{t("InstructorHome.activePlans")}</Text>
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 100,
            padding: 4,
          }}
        >
          <Image
            source={Images.dumble}
            style={{ width: wp(5), height: wp(5), resizeMode: "contain" }}
          />
        </View>
      </View>
      <Text style={styles.cardNumber}>{number}</Text>
      <Ionicons
        name="arrow-up"
        size={wp(4)}
        color="#FFF"
        style={styles.cardArrow}
      />
    </LinearGradient>
  );

  const Categories = () => (
    <FlatList
      data={categories}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.categoryButton,
            item.active && styles.activeCategoryButton,
          ]}
          onPress={() => handleCategorySelect(item)}
        >
          <Text
            style={[
              styles.categoryText,
              item.active && styles.activeCategoryText,
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryList}
    />
  );

  const ExerciseCard = ({ exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() =>
        navigation.navigate(RouteName.Client_Exercise_Detail, { exercise })
      }
    >
      <Image
        source={
          exercise.images && exercise.images.length > 0
            ? { uri: exercise.images[0] }
            : Images.dumyImg
        }
        style={styles.exerciseImage}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.exerciseOverlay}
      >
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseTitle} numberOfLines={2}>
            {exercise.name}
          </Text>
          <View style={styles.exerciseMeta}>
            <Text style={styles.exerciseDetails}>
              {exercise.duration || 0} min
            </Text>
            <Text style={styles.exerciseDetails}>
              • {exercise.difficulty || "Beginner"}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const onLogoutPress = async () => {
    setLoading(true);
    try {
      const response = await PostApiRequest("api/auth/logout");
      setLogoutModal(false);
      dispatch(setToken(""));
      dispatch(clearUserData({}));
      await AsyncStorage.removeItem("token");
      navigation.reset({
        index: 0,
        routes: [{ name: RouteName.AuthStack }],
      });
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={"transparent"}
        translucent
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: hp(10) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Image source={Images.SplashImage} style={styles.img} />
            </View>
            <Text style={styles.userName}>
              {userData?.userData?.name || "John Abraham"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {/* <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate(RouteName.Client_Message)}
            >
              <Ionicons name="chatbubble-outline" size={wp(6)} color="#fff" />
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.iconButton}>
              <View style={styles.notificationDot} />
              <Ionicons
                name="notifications-outline"
                size={wp(6)}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setLogoutModal(true)}
            >
              <Image
                source={Images.logout}
                style={{
                  height: 26,
                  width: 26,
                  tintColor: COLORS.primaryColor,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={wp(5)} color="#ffffff" />
          <TextInput
            style={styles.searchInput}
            placeholder={t("InstructorHome.search_placeholder")}
            placeholderTextColor="#ffffff"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Active Plans Rows */}
        <View style={styles.activePlansContainer}>
          <View style={styles.activePlansRow}>
            <ActivePlanCard />
            <ActivePlanCard />
          </View>
          <View style={styles.activePlansRow}>
            <ActivePlanCard />
            <ActivePlanCard />
          </View>
        </View>

        <View style={{ paddingBottom: hp(4) }}>
          <ClientReportChart />
        </View>

        {/* My Exercise */}
        <View style={styles.myExerciseSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("InstructorHome.myExercises")}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(RouteName.Client_exercise)}
            >
              <Text style={styles.seeAllText}>
                {t("InstructorHome.seeall")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <View style={styles.categoryContainer}>
            <Categories />
          </View>

          <View style={styles.exerciseScrollContainer}>
            {filteredExercises.length === 0 && !isLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No exercises found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchText
                    ? "Try adjusting your search"
                    : "Create your first exercise"}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredExercises}
                renderItem={({ item }) => <ExerciseCard exercise={item} />}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.exerciseList}
                ItemSeparatorComponent={() => <View style={{ width: wp(3) }} />}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <LogoutModal
        isVisible={logoutModal}
        onDisable={() => setLogoutModal(false)}
        onPress={onLogoutPress}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: Platform.OS === "ios" ? hp(8) : hp(6),
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: " suicidal",
    alignItems: "center",
    marginRight: wp(3),
  },
  img: {
    width: hp(4),
    height: hp(4),
    resizeMode: "contain",
  },
  userName: {
    color: "#fff",
    fontSize: wp(4),
    fontFamily: fonts.medium,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: wp(2),
    marginRight: wp(2),
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: wp(1.5),
    right: wp(1.5),
    width: wp(2),
    height: wp(2),
    backgroundColor: "#4CAF50",
    borderRadius: wp(5),
  },
  profileButton: {
    marginLeft: wp(2),
  },
  profileImage: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
    marginHorizontal: wp(5),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(3),
    borderWidth: 0.3,
    borderColor: COLORS.gray2,
    height: hp(7),
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    marginLeft: wp(3),
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  activePlansContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(3),
  },
  activePlansRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: wp(3),
  },
  activePlanCard: {
    width: (wp(100) - wp(10) - wp(3)) / 2,
    padding: wp(4),
    borderRadius: wp(4),
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },
  cardTitle: {
    color: "#FFF",
    fontSize: wp(3),
    fontFamily: fonts.regular,
  },
  cardNumber: {
    color: "#FFF",
    fontSize: wp(6),
    fontFamily: fonts.regular,
    marginBottom: hp(0.5),
  },
  cardArrow: {
    position: "absolute",
    bottom: wp(4),
    right: wp(4),
  },
  myExerciseSection: {
    paddingHorizontal: wp(5),
    marginBottom: hp(3),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  sectionTitle: {
    color: "#fff",
    fontSize: wp(4.5),
    fontFamily: fonts.medium,
  },
  seeAllText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  categoryContainer: {
    marginBottom: hp(2),
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
  exerciseScrollContainer: {
    minHeight: hp(20),
  },
  exerciseList: {
    paddingRight: wp(5),
  },
  exerciseCard: {
    width: wp(60),
    height: hp(20),
    borderRadius: wp(4),
    overflow: "hidden",
    position: "relative",
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
    height: "60%",
    justifyContent: "flex-end",
    paddingHorizontal: wp(3),
    paddingBottom: hp(1.5),
  },

  exerciseTitle: {
    color: "#FFF",
    fontSize: wp(4),
    fontFamily: fonts.medium,
    marginBottom: hp(0.5),
  },
  exerciseMeta: {
    flexDirection: "row",
    gap: wp(2),
    alignItems: "center",
  },
  exerciseDetails: {
    color: "#FFF",
    fontSize: wp(3),
    fontFamily: fonts.regular,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(5),
  },
  emptyStateText: {
    color: "#FFF",
    fontSize: wp(4),
    fontFamily: fonts.medium,
    marginBottom: hp(1),
  },
  emptyStateSubtext: {
    color: "#999",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
    textAlign: "center",
  },
});
