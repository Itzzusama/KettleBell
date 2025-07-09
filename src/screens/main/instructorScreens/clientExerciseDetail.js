import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import fonts from '../../../assets/fonts';
import { Images } from '../../../assets/images/index';
import { GetApiRequest } from '../../../services/api';
import { COLORS } from '../../../utils/COLORS';

const ClientExerciseDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  // Get exercise ID from route params
  const { exercise } = route.params || {};
  const exerciseId = exercise?._id || exercise?.id;

  // State management
  const [exerciseData, setExerciseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch exercise details from API
  const fetchExerciseDetails = useCallback(async () => {
    if (!exerciseId) {
      setError("Exercise ID not provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await GetApiRequest(`api/exercises/${exerciseId}`);

      if (response.data && response.data.data) {
        setExerciseData(response.data.data);
      } else {
        throw new Error("Exercise data not found");
      }
    } catch (err) {
      console.error("Error fetching exercise details:", err);
      setError(err.message || "Failed to load exercise details");
      Alert.alert("Error", err.message || "Failed to load exercise details");
    } finally {
      setLoading(false);
    }
  }, [exerciseId]);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchExerciseDetails();
    }, [fetchExerciseDetails])
  );

  // Loading component
  const LoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primaryColor} />
      <Text style={styles.loadingText}>Loading exercise details...</Text>
    </View>
  );

  // Error component
  const ErrorComponent = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={wp(15)} color={COLORS.red} />
      <Text style={styles.errorText}>Failed to load exercise details</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchExerciseDetails}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Main render
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={wp(6)} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercise Details</Text>
        </View>

        <LoadingComponent />
      </SafeAreaView>
    );
  }

  if (error || !exerciseData) {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={wp(6)} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercise Details</Text>
        </View>

        <ErrorComponent />
      </SafeAreaView>
    );
  }

  const {
    name,
    description,
    images,
    category,
    difficulty,
    targetMuscles,
    equipment,
    instructions,
  } = exerciseData;

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={wp(6)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: hp(4) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image
            source={images && images.length > 0 ? { uri: images[0] } : Images.dumyImg}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.exerciseTitle}>{name}</Text>
          <Text style={styles.exerciseDescription}>
            {description}
          </Text>
          <View style={{ borderWidth: 0.5, borderColor: '#333', marginVertical: hp(0.2) }} />

          <View style={{ marginVertical: hp(2) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
                <Image
                  source={Images.dumble}
                  style={styles.detailImage}
                />
                <Text style={styles.detailLabel}>{t("ClientExerciseDetail.Category")}</Text>
              </View>
              <Text style={styles.detailValue}>{category?.name || 'N/A'}</Text>
            </View>
            <View style={{ borderWidth: 0.5, borderColor: '#333', marginVertical: hp(2) }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
                <Image
                  source={Images.dumble}
                  style={styles.detailImage}
                />
                <Text style={styles.detailLabel}>{t("ClientExerciseDetail.Difficulty")}</Text>
              </View>
              <Text style={styles.detailValue}>{difficulty}</Text>
            </View>
          </View>
          <View style={{ borderWidth: 0.5, borderColor: '#333', marginVertical: hp(0.2), marginBottom: hp(2) }} />

          {/* Target Muscles */}
          {targetMuscles && targetMuscles.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("ClientExerciseDetail.TargetMuscles")}</Text>
              <View style={styles.tagsContainer}>
                {targetMuscles.map((muscle, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Equipment */}
          {equipment && equipment.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("ClientExerciseDetail.Equipment")}</Text>
              <View style={styles.tagsContainer}>
                {equipment.map((item, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Instructions */}
          {instructions && instructions.length > 0 && (
            <View style={styles.section2}>
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>{t("ClientExerciseDetail.Instructions")}</Text>
                {instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>{index + 1}.</Text>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClientExerciseDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: hp(6)
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    color: '#FFF',
    fontSize: hp(2.3),
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.medium,
  },
  imageContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: hp(25),
    borderRadius: wp(4),
  },
  infoContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  exerciseTitle: {
    color: '#FFF',
    fontSize: wp(6),
    fontFamily: fonts.medium,

  },
  exerciseDescription: {
    color: '#888',
    fontSize: wp(2.7),
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
  detailImage: {
    width: wp(5),
    height: wp(5),
    resizeMode: 'contain',
  },
  detailLabel: {
    color: COLORS.white,
    fontSize: wp(3.2),
    fontFamily: fonts.regular,

  },
  detailValue: {
    color: '#FFF',
    fontSize: wp(3.7),
    fontFamily: fonts.regular,
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
    color: '#FFF',
    fontSize: wp(4),
    fontFamily: fonts.medium,
    marginBottom: hp(1.5),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  tag: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: wp(5),
    paddingVertical: hp(0.5),
    borderRadius: wp(5),
    borderWidth: 0.5,
    borderColor: '#444',
  },
  tagText: {
    color: '#5C5C60',
    fontSize: wp(2.8),
    fontFamily: fonts.regular,

  },
  instructionsHeader: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    marginBottom: hp(2),
  },
  instructionsTitle: {
    color: '#FFF',
    fontSize: wp(5),
    fontFamily: fonts.medium,
    paddingBottom: hp(2),
  },
  instructionsContainer: {
    backgroundColor: COLORS.primaryColor,
    borderRadius: wp(3),
    padding: wp(4),
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: hp(1.5),
    alignItems: 'flex-start',
  },
  instructionNumber: {
    color: '#FFF',
    fontSize: wp(3.5),
    fontFamily: fonts.medium,
    marginRight: wp(2),
    minWidth: wp(5),
  },
  instructionText: {
    color: '#FFF',
    fontSize: wp(3.5),
    lineHeight: wp(5),
    flex: 1,
    fontFamily: fonts.regular,

  },
  buttonContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  startButton: {
    borderRadius: wp(3),
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400, // Added for responsiveness on larger screens
  },
  startButtonTouchable: {
    paddingVertical: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundColor,
  },
  loadingText: {
    color: '#FFF',
    fontSize: wp(4),
    marginTop: hp(2),
    fontFamily: fonts.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundColor,
    padding: wp(5),
  },
  errorText: {
    color: COLORS.red,
    fontSize: wp(4.5),
    textAlign: 'center',
    marginTop: hp(2),
    fontFamily: fonts.medium,
  },
  retryButton: {
    backgroundColor: COLORS.primaryColor,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(10),
    borderRadius: wp(3),
    marginTop: hp(3),
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: wp(4.5),
    fontWeight: 'bold',
    fontFamily: fonts.medium,
  },
});