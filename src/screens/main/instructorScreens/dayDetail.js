import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native"
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { Alert, FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Modal from "react-native-modal"
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
import fonts from "../../../assets/fonts"
import { Images } from "../../../assets/images"
import RouteName from "../../../navigation/RouteName"
import { DeleteApiRequest, GetApiRequest, PostApiRequest } from "../../../services/api"
import { COLORS } from "../../../utils/COLORS"

export default function DayDetail() {
  const navigation = useNavigation()
  const route = useRoute()
  const { t } = useTranslation()

  // Get parameters from route
  const { workoutId, day } = route.params || {}

  const [modalVisible, setModalVisible] = useState(false)
  const [exerciseSelectionModalVisible, setExerciseSelectionModalVisible] = useState(false)
  const [dailyWorkout, setDailyWorkout] = useState(null)
  const [exercises, setExercises] = useState([])
  const [allExercises, setAllExercises] = useState([])
  const [filteredExercises, setFilteredExercises] = useState([])
  const [searchText, setSearchText] = useState("")
  const [loading, setLoading] = useState(true)
  const [exerciseLoading, setExerciseLoading] = useState(false)
  const [addingExercise, setAddingExercise] = useState(false)
  const [error, setError] = useState(null)

  // Fetch daily workout data
  const fetchDailyWorkout = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!workoutId || !day) {
        throw new Error("Missing required parameters: workoutPlanId or dayOfWeek")
      }

      const url = `api/workout-plans/${workoutId}/daily-workouts/${day}`
      const response = await GetApiRequest(url)

      if (response.data.success) {
        setDailyWorkout(response.data.data)
        setExercises(response.data.data.exercises || [])
      } else {
        throw new Error("Failed to fetch daily workout data")
      }
    } catch (err) {
      console.error("Error fetching daily workout:", err)
      setError(err.message || "Failed to load workout data")
      Alert.alert("Error", err.message || "Failed to load workout data")
    } finally {
      setLoading(false)
    }
  }, [workoutId, day])

  // Fetch all exercises for selection
  const fetchAllExercises = useCallback(async () => {
    try {
      setExerciseLoading(true)
      const response = await GetApiRequest("api/exercises")

      if (response.data && response.data.data) {
        setAllExercises(response.data.data)
        setFilteredExercises(response.data.data)
      } else {
        setAllExercises([])
        setFilteredExercises([])
      }
    } catch (err) {
      console.error("Error fetching exercises:", err)
      Alert.alert("Error", "Failed to load exercises")
      setAllExercises([])
      setFilteredExercises([])
    } finally {
      setExerciseLoading(false)
    }
  }, [])

  // Add exercise to workout day
  const addExerciseToDay = async (exerciseId) => {
    try {
      setAddingExercise(true)
      const url = `api/workout-plans/${workoutId}/daily-workouts/${day}/exercises`
      const response = await PostApiRequest(url, { exerciseId })

      if (response.data.success || response.status === 200) {
        // Close modal and refresh workout data
        setExerciseSelectionModalVisible(false)
        await fetchDailyWorkout()
        Alert.alert("Success", "Exercise added successfully!")
      } else {
        throw new Error("Failed to add exercise")
      }
    } catch (err) {
      console.error("Error adding exercise:", err)
      Alert.alert("Error", err.message || "Failed to add exercise")
    } finally {
      setAddingExercise(false)
    }
  }

  // Delete exercise from workout day
  const deleteExerciseFromDay = async (exerciseId) => {
    Alert.alert(
      "Delete Exercise",
      "Are you sure you want to remove this exercise from the workout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const url = `api/workout-plans/${workoutId}/daily-workouts/${day}/exercises/${exerciseId}`
              const response = await DeleteApiRequest(url)

              if (response.status === 200 || response.status === 204) {
                await fetchDailyWorkout()
                Alert.alert("Success", "Exercise removed successfully!")
              } else {
                throw new Error("Failed to remove exercise")
              }
            } catch (err) {
              console.error("Error deleting exercise:", err)
              Alert.alert("Error", err.message || "Failed to remove exercise")
            }
          }
        }
      ]
    )
  }

  // Filter exercises based on search
  const handleSearch = (text) => {
    setSearchText(text)
    if (text.trim() === "") {
      setFilteredExercises(allExercises)
    } else {
      const filtered = allExercises.filter(exercise =>
        exercise.name.toLowerCase().includes(text.toLowerCase()) ||
        exercise.description.toLowerCase().includes(text.toLowerCase())
      )
      setFilteredExercises(filtered)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchDailyWorkout()
    }, [fetchDailyWorkout])
  )

  const handleAddPress = () => {
    setModalVisible(true)
  }

  const handleBackPress = () => {
    navigation.goBack()
  }

  const handleCreateNewExercise = () => {
    setModalVisible(false)
    navigation.navigate(RouteName.Create_Exercise, {
      workoutId,
      day,
      onExerciseAdded: fetchDailyWorkout
    })
  }

  const handleSelectExistingExercise = () => {
    setModalVisible(false)
    fetchAllExercises()
    setExerciseSelectionModalVisible(true)
  }

  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate(RouteName.Client_Exercise_Detail, { exercise: item })} style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseIconAndInfo}>
          <View style={styles.exerciseIcon}>
            <Image source={item.image ? { uri: item.image } : Images.dumble} style={styles.exerciseImage} />
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{item.name || "Exercise"}</Text>
            <Text style={styles.equipmentText}>{item.equipment[0] || "No equipment specified"}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteExerciseFromDay(item._id)}
        >
          <Ionicons name="trash-outline" size={heightPercentageToDP(2.5)} color={COLORS.red} />
        </TouchableOpacity>
      </View>

      <View style={styles.exerciseDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t("DayDetails.Time")}</Text>
          <Text style={styles.detailValue}>{item.duration || "N/A"}</Text>
        </View>
        {item.description && (
          <View style={styles.notesRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{item.description}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  const renderExerciseSelectionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.exerciseSelectionCard}
      onPress={() => addExerciseToDay(item._id)}
      disabled={addingExercise}
    >
      <View style={styles.exerciseSelectionHeader}>
        <View style={styles.exerciseSelectionIcon}>
          <Image
            source={item.images?.[0] ? { uri: item.images[0] } : Images.dumble}
            style={styles.exerciseSelectionImage}
          />
        </View>
        <View style={styles.exerciseSelectionInfo}>
          <Text style={styles.exerciseSelectionName}>{item.name}</Text>
          <Text style={styles.exerciseSelectionDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.exerciseSelectionMeta}>
            <Text style={styles.exerciseSelectionDifficulty}>{item.difficulty}</Text>
            <Text style={styles.exerciseSelectionDuration}>{item.duration} min</Text>
          </View>
        </View>
      </View>
      {addingExercise && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Adding...</Text>
        </View>
      )}
    </TouchableOpacity>
  )

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Image source={Images.dumble} style={styles.emptyImage} />
      <Text style={styles.emptyText}>{t("DayDetails.NoExercises")}</Text>
      <Text style={styles.emptySubtext}>{t("DayDetails.AddExercisePrompt")}</Text>
    </View>
  )

  const renderEmptyExerciseSelection = () => (
    <View style={styles.emptyContainer}>
      <Image source={Images.dumble} style={styles.emptyImage} />
      <Text style={styles.emptyText}>No exercises found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your search terms</Text>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout data...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={heightPercentageToDP(3)} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {dailyWorkout?.name || `${day} ${t("DayDetails.title")}`}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
          <Ionicons name="add" size={heightPercentageToDP(2.4)} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Exercise Count */}
      <View style={styles.infoContainer}>
        <Text style={styles.exerciseCount}>
          {exercises.length} {t("DayDetails.Exercises")}
        </Text>
        {dailyWorkout?.description && (
          <Text style={styles.descriptionText}>{dailyWorkout.description}</Text>
        )}
      </View>

      {/* Exercise List */}
      <FlatList
        data={exercises}
        renderItem={renderExerciseItem}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={[
          styles.listContainer,
          exercises.length === 0 && styles.listContainerEmpty
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchDailyWorkout}
      />

      {/* Add Exercise Modal */}
      {
        modalVisible && (
          <Modal
            isVisible={modalVisible}
            onBackdropPress={() => setModalVisible(false)}
            onSwipeComplete={() => setModalVisible(false)}
            swipeDirection="down"
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropOpacity={0.5}
            style={styles.modal}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={heightPercentageToDP(3)} color={COLORS.white} />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>{t("DayDetails.ModalTitle")}</Text>
              <Text style={styles.modalHeader}>{t("DayDetails.ModalHeader")}</Text>

              <TouchableOpacity style={styles.modalButton} onPress={handleCreateNewExercise}>
                <Ionicons name="add-circle-outline" size={heightPercentageToDP(2.5)} color={COLORS.white} />
                <Text style={styles.modalButtonText}>{t("DayDetails.CreateNewExercise")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSelected]}
                onPress={handleSelectExistingExercise}
              >
                <Ionicons name="list-outline" size={heightPercentageToDP(2.5)} color={COLORS.white} />
                <Text style={styles.modalButtonText}>{t("DayDetails.SelectExistingExercise")}</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )
      }

      {/* Exercise Selection Modal */}
      {
        exerciseSelectionModalVisible && (
          <Modal
            isVisible={exerciseSelectionModalVisible}
            onBackdropPress={() => setExerciseSelectionModalVisible(false)}
            onSwipeComplete={() => setExerciseSelectionModalVisible(false)}
            swipeDirection="down"
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropOpacity={0.5}
            style={styles.modal}
          >
            <View style={[styles.modalContent, styles.exerciseSelectionModal]}>
              <View style={styles.modalHandle} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setExerciseSelectionModalVisible(false)}
              >
                <Ionicons name="close" size={heightPercentageToDP(3)} color={COLORS.white} />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Select Exercise</Text>
              <Text style={styles.modalHeader}>Choose an exercise to add to your workout</Text>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={heightPercentageToDP(2.5)} color={COLORS.gray2} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search exercises..."
                  placeholderTextColor={COLORS.gray2}
                  value={searchText}
                  onChangeText={handleSearch}
                />
              </View>

              {/* Exercise List */}
              <FlatList
                data={filteredExercises}
                renderItem={renderExerciseSelectionItem}
                keyExtractor={(item) => item._id}
                ListEmptyComponent={exerciseLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading exercises...</Text>
                  </View>
                ) : renderEmptyExerciseSelection}
                contentContainerStyle={styles.exerciseSelectionList}
                showsVerticalScrollIndicator={false}
                refreshing={exerciseLoading}
                onRefresh={fetchAllExercises}
              />
            </View>
          </Modal>
        )
      }
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: heightPercentageToDP(6),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: widthPercentageToDP(4),
    paddingVertical: heightPercentageToDP(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.darkGray,
  },
  backButton: {
    padding: widthPercentageToDP(1),
  },
  headerTitle: {
    fontSize: heightPercentageToDP(2.3),
    fontFamily: fonts.medium,
    color: COLORS.white,
    flex: 1,
    textAlign: "center",
    marginHorizontal: widthPercentageToDP(2),
  },
  addButton: {
    width: widthPercentageToDP(8),
    height: widthPercentageToDP(8),
    borderRadius: widthPercentageToDP(4),
    backgroundColor: COLORS.primaryColor,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    paddingHorizontal: widthPercentageToDP(4),
    paddingVertical: heightPercentageToDP(1.5),
  },
  exerciseCount: {
    fontSize: heightPercentageToDP(2),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  descriptionText: {
    fontSize: heightPercentageToDP(1.6),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    marginTop: heightPercentageToDP(0.5),
  },
  listContainer: {
    paddingHorizontal: widthPercentageToDP(4),
    paddingBottom: heightPercentageToDP(2),
  },
  listContainerEmpty: {
    flex: 1,
    justifyContent: "center",
  },
  exerciseCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: widthPercentageToDP(4),
    marginBottom: heightPercentageToDP(2),
    padding: widthPercentageToDP(4),
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: heightPercentageToDP(2),
  },
  exerciseIconAndInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  exerciseIcon: {
    width: widthPercentageToDP(9),
    height: widthPercentageToDP(9),
    borderRadius: widthPercentageToDP(4.5),
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: widthPercentageToDP(3),
  },
  exerciseImage: {
    width: "60%",
    height: "60%",
    resizeMode: "contain",
  },
  exerciseInfo: {
    flex: 1,
    paddingLeft: widthPercentageToDP(1),
  },
  exerciseName: {
    fontSize: heightPercentageToDP(1.8),
    fontFamily: fonts.semiBold,
    color: COLORS.white,
  },
  equipmentText: {
    fontSize: heightPercentageToDP(1.6),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    marginTop: heightPercentageToDP(0.5),
  },
  exerciseDetails: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.gray3,
    paddingTop: heightPercentageToDP(1.5),
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: heightPercentageToDP(0.8),
  },
  detailLabel: {
    fontSize: heightPercentageToDP(1.6),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
  },
  detailValue: {
    fontSize: heightPercentageToDP(1.6),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  notesRow: {
    paddingVertical: heightPercentageToDP(0.8),
  },
  notesText: {
    fontSize: heightPercentageToDP(1.6),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    marginTop: heightPercentageToDP(0.5),
    lineHeight: heightPercentageToDP(2.2),
  },
  deleteButton: {
    padding: widthPercentageToDP(2),
    borderRadius: widthPercentageToDP(2),
    backgroundColor: COLORS.red + "20",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: heightPercentageToDP(8),
  },
  emptyImage: {
    width: widthPercentageToDP(20),
    height: widthPercentageToDP(20),
    opacity: 0.3,
    marginBottom: heightPercentageToDP(2),
  },
  emptyText: {
    fontSize: heightPercentageToDP(2),
    fontFamily: fonts.medium,
    color: COLORS.gray2,
    textAlign: "center",
    marginBottom: heightPercentageToDP(1),
  },
  emptySubtext: {
    fontSize: heightPercentageToDP(1.6),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    textAlign: "center",
    paddingHorizontal: widthPercentageToDP(10),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: heightPercentageToDP(1.8),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: COLORS.lightGray,
    borderTopLeftRadius: widthPercentageToDP(6),
    borderTopRightRadius: widthPercentageToDP(6),
    padding: widthPercentageToDP(6),
    minHeight: heightPercentageToDP(35),
  },
  modalHandle: {
    width: widthPercentageToDP(12),
    height: heightPercentageToDP(0.6),
    backgroundColor: COLORS.gray3,
    borderRadius: widthPercentageToDP(1),
    alignSelf: "center",
    marginBottom: heightPercentageToDP(2),
  },
  modalTitle: {
    fontSize: heightPercentageToDP(2.2),
    fontFamily: fonts.semiBold,
    color: COLORS.white,
    marginBottom: heightPercentageToDP(1),
  },
  modalHeader: {
    fontSize: heightPercentageToDP(1.6),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    marginBottom: heightPercentageToDP(3),
  },
  modalButton: {
    backgroundColor: COLORS.darkGray,
    borderRadius: widthPercentageToDP(3),
    paddingVertical: heightPercentageToDP(1.8),
    paddingHorizontal: widthPercentageToDP(4),
    marginBottom: heightPercentageToDP(1.5),
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray3,
  },
  modalButtonSelected: {
    borderColor: COLORS.primaryColor,
    backgroundColor: COLORS.primaryColor + "20",
  },
  modalButtonText: {
    fontSize: heightPercentageToDP(1.8),
    fontFamily: fonts.medium,
    color: COLORS.white,
    marginLeft: widthPercentageToDP(3),
  },
  closeButton: {
    position: "absolute",
    top: heightPercentageToDP(2),
    right: widthPercentageToDP(6),
    padding: widthPercentageToDP(1),
    zIndex: 1,
  },
  exerciseSelectionModal: {
    minHeight: heightPercentageToDP(70),
  },
  exerciseSelectionList: {
    paddingBottom: heightPercentageToDP(2),
  },
  exerciseSelectionCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: widthPercentageToDP(4),
    marginBottom: heightPercentageToDP(2),
    padding: widthPercentageToDP(4),
    position: "relative",
  },
  exerciseSelectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: heightPercentageToDP(1.5),
  },
  exerciseSelectionIcon: {
    width: widthPercentageToDP(10),
    height: widthPercentageToDP(10),
    borderRadius: widthPercentageToDP(5),
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: widthPercentageToDP(3),
  },
  exerciseSelectionImage: {
    width: "70%",
    height: "70%",
    resizeMode: "contain",
  },
  exerciseSelectionInfo: {
    flex: 1,
  },
  exerciseSelectionName: {
    fontSize: heightPercentageToDP(1.8),
    fontFamily: fonts.semiBold,
    color: COLORS.white,
    marginBottom: heightPercentageToDP(0.5),
  },
  exerciseSelectionDescription: {
    fontSize: heightPercentageToDP(1.4),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    marginBottom: heightPercentageToDP(0.5),
  },
  exerciseSelectionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseSelectionDifficulty: {
    fontSize: heightPercentageToDP(1.4),
    fontFamily: fonts.regular,
    color: COLORS.primaryColor,
  },
  exerciseSelectionDuration: {
    fontSize: heightPercentageToDP(1.4),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: widthPercentageToDP(4),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.darkGray,
    borderRadius: widthPercentageToDP(4),
    paddingHorizontal: widthPercentageToDP(3),
    marginBottom: heightPercentageToDP(2),
  },
  searchInput: {
    flex: 1,
    fontSize: heightPercentageToDP(1.8),
    fontFamily: fonts.regular,
    color: COLORS.white,
    paddingVertical: heightPercentageToDP(1.5),
    paddingHorizontal: widthPercentageToDP(2),
  },
})