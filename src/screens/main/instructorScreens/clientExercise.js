"use client";

import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import fonts from "../../../assets/fonts";
import { Images } from "../../../assets/images";
import RouteName from "../../../navigation/RouteName";
import {
  DeleteApiRequest,
  GetApiRequest,
  PostApiRequest,
  PutApiRequest,
} from "../../../services/api";
import { COLORS } from "../../../utils/COLORS";
import { useToast } from "../../../utils/Toast/toastContext";

export default function Plans() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [myPlans, setMyPlans] = useState([]);
  const toast = useToast();
  const { t } = useTranslation();
  const [categoriesState, setCategoriesState] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createCategory();
    }
  };

  const handleEditCategory = () => {
    if (newCategoryName.trim() && editingCategory) {
      updateCategory();
    }
  };

  const handleDeleteCategory = (category) => {
    if (category.name === "All") {
      toast.showToast({
        type: "error",
        message: "You cannot delete the 'All' category",
        duration: 4000,
      });
      return;
    }

    const hasPlans = myPlans.some(
      (plan) => plan.category && plan.category.name === category.name
    );

    if (hasPlans) {
      toast.showToast({
        type: "error",
        message: "Cannot delete category with associated workout plans",
        duration: 4000,
      });
      return;
    }

    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCategory(category.id),
        },
      ]
    );
  };

  const handleEditPlan = (item) => {
    // Navigate to CreateExercise with the item data for editing
    navigation.navigate(RouteName.Create_Exercise, {
      editMode: true,
      exerciseData: item,
    });
  };

  const getCategories = async () => {
    try {
      const res = await GetApiRequest("api/exercise-categories/my-categories");
      if (res && res.data && res.data.data) {
        const fetchedCategories = res.data.data.map((cat) => ({
          ...cat,
          active: false,
        }));
        setCategoriesState([
          { id: "all", name: "All", active: true },
          ...fetchedCategories,
        ]);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to load categories");
    }
  };

  const createCategory = async () => {
    try {
      const res = await PostApiRequest("api/exercise-categories", {
        name: newCategoryName.trim(),
      });
      if (res && res.data) {
        getCategories();
        setShowAddCategoryModal(false);
        setNewCategoryName("");
        toast.showToast({
          type: "success",
          message: "Category created successfully",
          duration: 4000,
        });
      }
    } catch (error) {
      console.log(error);
      toast.showToast({
        type: "error",
        message: "Failed to create category",
        duration: 4000,
      });
    }
  };

  const updateCategory = async () => {
    try {
      const res = await PutApiRequest(
        `api/exercise-categories/${editingCategory.id}`,
        {
          name: newCategoryName.trim(),
        }
      );
      if (res && res.data) {
        getCategories();
        setShowEditCategoryModal(false);
        setNewCategoryName("");
        setEditingCategory(null);
        toast.showToast({
          type: "success",
          message: "Category updated successfully",
          duration: 4000,
        });
      }
    } catch (error) {
      console.log(error);
      toast.showToast({
        type: "error",
        message: "Failed to update category",
        duration: 4000,
      });
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const res = await DeleteApiRequest(
        `api/exercise-categories/${categoryId}`
      );
      if (res) {
        getCategories();
        if (
          selectedCategory ===
          categoriesState.find((cat) => cat.id === categoryId)?.name
        ) {
          setSelectedCategory("All");
        }
        toast.showToast({
          type: "success",
          message: "Category deleted successfully",
          duration: 4000,
        });
      }
    } catch (error) {
      console.log(error);
      toast.showToast({
        type: "error",
        message: "Failed to delete category",
        duration: 4000,
      });
    }
  };

  const handleDeletePlan = (item) => {
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete "${item.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePlan(item._id),
        },
      ]
    );
  };

  const handleCategorySelect = (category) => {
    setCategoriesState(
      categoriesState.map((cat) => ({
        ...cat,
        active: cat.name === category.name,
      }))
    );
    setSelectedCategory(category.name);
  };

  const openEditCategoryModal = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setShowEditCategoryModal(true);
  };

  const getMyPlans = async () => {
    try {
      setIsLoading(true);
      const res = await GetApiRequest("api/exercises/my-exercises");
      if (res.data && res.data.data) {
        setMyPlans(res.data.data);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlan = async (planId) => {
    try {
      const res = await DeleteApiRequest(`api/exercises/${planId}`);
      if (res) {
        getMyPlans();
        toast.showToast({
          type: "success",
          message: "Workout plan deleted successfully",
          duration: 4000,
        });
      }
    } catch (error) {
      console.log(error);
      toast.showToast({
        type: "error",
        message: "Failed to delete workout plan",
        duration: 4000,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([getCategories(), getMyPlans()]);
    } catch (error) {
      console.log(error);
      toast.showToast({
        type: "error",
        message: "Failed to refresh data",
        duration: 4000,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const Categories = () => (
    <FlatList
      data={categoriesState}
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

  const WorkoutCard = ({ item }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => navigation.navigate(RouteName.Client_Exercise_Detail, { exercise: item })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            item.images && item.images.length > 0
              ? { uri: item.images[0] }
              : Images.dumyImg
          }
          style={styles.workoutImage}
        />
        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditPlan(item)}
          >
            <Feather name="edit" size={wp(3)} color={COLORS.primaryColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeletePlan(item)}
          >
            <Feather name="trash-2" size={wp(3)} color={COLORS.primaryColor} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.workoutOverlay}>
        <View style={styles.workoutContent}>
          <Text style={styles.workoutTitle} numberOfLines={2}>{item.name}</Text>
          <View style={styles.durationContainer}>
            <Ionicons
              name="time-outline"
              size={wp(4)}
              color={COLORS.primaryColor}
            />
            <Text style={styles.durationText}>
              {item.duration} hours
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredWorkoutPlans = myPlans.filter(
    (plan) =>
      (selectedCategory === "All" ||
        (plan.category && plan.category.name === selectedCategory)) &&
      plan.name.toLowerCase().includes(searchText.toLowerCase())
  );

  useFocusEffect(
    useCallback(() => {
      getCategories();
      getMyPlans();
    }, [])
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={wp(6.5)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exercise</Text>
        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={() => navigation.navigate(RouteName.Create_Exercise)}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={wp(5)} color={COLORS.white} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("Plan.search_placeholder")}
            placeholderTextColor={COLORS.white}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{t("Plan.category")}</Text>
          <View style={styles.categoryActions}>
            <TouchableOpacity
              style={[styles.categoryActionButton, styles.editActionButton]}
              onPress={() => {
                const activeCategory = categoriesState.find(
                  (cat) => cat.active
                );
                if (activeCategory && activeCategory.name !== "All") {
                  openEditCategoryModal(activeCategory);
                } else {
                  Alert.alert(
                    t("Plan.error"),
                    t("Plan.select_category_to_edit")
                  );
                }
              }}
            >
              <Feather name="edit" size={wp(3.5)} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.categoryActionButton, styles.deleteActionButton]}
              onPress={() => {
                const activeCategory = categoriesState.find(
                  (cat) => cat.active
                );
                if (activeCategory && activeCategory.name !== "All") {
                  handleDeleteCategory(activeCategory);
                } else {
                  Alert.alert(
                    t("Plan.error"),
                    t("Plan.select_category_to_delete")
                  );
                }
              }}
            >
              <Feather name="trash-2" size={wp(3.5)} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primaryColor,
                borderRadius: 7,
                paddingVertical: wp(1.3),
                paddingHorizontal: wp(3),
              }}
              onPress={() => setShowAddCategoryModal(true)}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: wp(3),
                  fontFamily: fonts.medium,
                }}
              >
                + Add Category
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingVertical: hp(1.5) }}>
          <Categories />
        </View>
      </View>

      {filteredWorkoutPlans.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No workout plans found</Text>
          <Text style={styles.emptyStateSubtext}>
            {searchText
              ? "Try adjusting your search"
              : "Create your first workout plan"}
          </Text>
        </View>
      ) : null}

      <FlatList
        data={filteredWorkoutPlans}
        renderItem={({ item }) => <WorkoutCard item={item} />}
        keyExtractor={(item) => item._id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.workoutGrid}
        columnWrapperStyle={
          filteredWorkoutPlans.length > 1 ? styles.workoutRow : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primaryColor]}
            tintColor={COLORS.primaryColor}
          />
        }
      />

      <Modal
        isVisible={showAddCategoryModal || showEditCategoryModal}
        onBackdropPress={() => { setShowAddCategoryModal(false); setShowEditCategoryModal(false) }}
        onBackButtonPress={() => { setShowAddCategoryModal(false); setShowEditCategoryModal(false) }}
        backdropOpacity={0.7}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={styles.modal}
        useNativeDriver={true}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{t("Plan.addcategory")}</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t("Plan.name")}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t("Plan.name")}
              placeholderTextColor="#666"
              value={newCategoryName}
              onChangeText={(text) => setNewCategoryName(text)}
            />
          </View>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowAddCategoryModal(false);
                setShowEditCategoryModal(false);
                setNewCategoryName("");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.addButton]}
              onPress={showAddCategoryModal ? handleAddCategory : handleEditCategory}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
  },
  backButton: {
    padding: wp(2.5),
  },
  headerTitle: {
    color: "#FFF",
    fontSize: hp(2.3),
    textAlign: "center",
    flex: 1,
    fontFamily: fonts.medium,
  },
  headerAddButton: {
    backgroundColor: COLORS.primaryColor,
    borderRadius: 20,
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(2.5),
    marginTop: hp(1),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
    borderRadius: wp(2.5),
    paddingHorizontal: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.gray3,
    height: hp(7),
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 12,
    marginLeft: wp(2.5),
    fontFamily: fonts.regular,
  },
  categorySection: {
    paddingHorizontal: wp(5),
    marginBottom: hp(2.5),
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },
  categoryTitle: {
    color: "#FFF",
    fontSize: 17,
    fontFamily: fonts.semiBold,
  },
  categoryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  categoryActionButton: {
    backgroundColor: COLORS.primaryColor,
    borderRadius: wp(5),
    padding: wp(2),
    alignItems: "center",
    justifyContent: "center",
  },
  editActionButton: {
    backgroundColor: "#4CAF50",
  },
  deleteActionButton: {
    backgroundColor: "#FF4444",
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
  workoutGrid: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(12),
  },
  workoutRow: {
    justifyContent: "space-between",
    marginBottom: hp(2),
  },
  workoutCard: {
    width: wp(42.5),
    height: hp(26),
    borderRadius: wp(3),
    overflow: "hidden",
    position: "relative",
    marginBottom: hp(2),
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  workoutImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  iconContainer: {
    position: "absolute",
    top: wp(2),
    right: wp(2),
    flexDirection: "row",
    gap: wp(1.5),
  },
  actionButton: {
    backgroundColor: COLORS.white,
    borderRadius: 50,
    padding: wp(1.5),
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: COLORS.white,
  },
  workoutOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    height: hp(9.5),
    padding: wp(2.5),
  },
  workoutContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  workoutTitle: {
    color: "#FFF",
    fontSize: wp(3.8),
    fontFamily: fonts.regular,
  },
  workoutDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: hp(0.5),
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    color: COLORS.primaryColor,
    fontSize: wp(3),
    fontFamily: fonts.regular,
    marginLeft: wp(1),
  },
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    paddingHorizontal: wp(8),
  },
  modalContainer: {
    backgroundColor: "#2A2A2D",
    borderRadius: wp(4),
    padding: wp(6),
    width: "100%",
    maxWidth: wp(80),
  },
  modalTitle: {
    color: "#FFF",
    fontSize: wp(4.5),
    fontFamily: fonts.medium,
    textAlign: "center",
    marginBottom: hp(3),
  },
  inputContainer: {
    marginBottom: hp(3),
  },
  inputLabel: {
    color: "#FFF",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
    marginBottom: hp(1),
  },
  modalInput: {
    backgroundColor: "#1F1F21",
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    color: "#FFF",
    fontSize: wp(3.5),
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: "#444",
  },
  modalButtonContainer: {
    flexDirection: "row",
    gap: wp(3),
  },
  modalButton: {
    flex: 1,
    borderRadius: wp(2.5),
    paddingVertical: hp(1),
    alignItems: "center",
  },
  addButton: {
    backgroundColor: COLORS.primaryColor,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#666",
  },
  addButtonText: {
    color: "white",
    fontSize: wp(4),
    fontFamily: fonts.medium,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: wp(4),
    fontFamily: fonts.medium,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(10),
  },
  emptyStateText: {
    color: "#FFF",
    fontSize: wp(4.5),
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