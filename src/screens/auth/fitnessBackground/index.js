import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import fonts from '../../../assets/fonts';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import ProgressBar from '../../../components/progressBar';
import RouteName from "../../../navigation/RouteName/index";
import { nextSection, previousSection, setCurrentSection, updateUserData } from '../../../store/slices/progressSlice';
import { COLORS } from '../../../utils/COLORS';
export default function FitnessBackground() {
    const {t} = useTranslation();
    const navigation=useNavigation() 
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.progress);
const insets = useSafeAreaInsets();
    const [selectedFitnessLevel, setSelectedFitnessLevel] = useState(userData.fitnessBackground?.fitnessLevel || 'beginner');
    const [selectedActivityLevel, setSelectedActivityLevel] = useState(userData.fitnessBackground?.activityLevel?.toLowerCase() || 'moderate');
    const [exerciseFrequency, setExerciseFrequency] = useState(userData.fitnessBackground?.exerciseFrequency || '');
    const [exerciseHistory, setExerciseHistory] = useState(userData.fitnessBackground?.exerciseHistory || '');

    const fitnessLevelOptions = ['beginner', 'intermediate', 'advance'];
    
    const activityLevels = [
        'sedentary',
        'light',
        'moderate',
        'active',
        'veryActive'
    ];

    useEffect(() => {
        dispatch(setCurrentSection(4)); 
    }, [dispatch]);

    const handleNext = () => { 
        dispatch(updateUserData({ 
            fitnessBackground: { 
                activityLevel: selectedActivityLevel.charAt(0).toUpperCase() + selectedActivityLevel.slice(1), 
                exerciseFrequency: parseInt(exerciseFrequency), 
                exerciseHistory 
            }
        }));
        dispatch(nextSection());
        navigation.navigate(RouteName.Fitness_Goal); 
    };

    const handleBack = () => {
        dispatch(previousSection());
        navigation.goBack();
    };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent"  translucent/>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={wp(6)} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.userIcon}>
          <Ionicons name="barbell" size={wp(6)} color={COLORS.primaryColor} />
        </View>
        <Text style={styles.title}>{t('FitnessBackground.title')}</Text>
        <ProgressBar />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('FitnessBackground.sectionTitle')}</Text>
        <Text style={styles.subtitle}>{t('FitnessBackground.subtitle')}</Text>
        {/* Gender Selection */}
        <Text style={styles.label}>{t('FitnessBackground.fitnessLevel')}</Text>
        <View style={styles.genderContainer}>
          {fitnessLevelOptions.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.genderButton,
                selectedFitnessLevel === level && styles.genderButtonSelected,
              ]}
              onPress={() => setSelectedFitnessLevel(level)}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  selectedFitnessLevel === level && styles.genderButtonTextSelected,
                ]}
              >
                {t(`FitnessBackground.fitnessLevels.${level}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Activity Level */}
        <Text style={styles.label}>{t('FitnessBackground.activityLevel')}</Text>
        <View style={styles.activityContainer}>
          {activityLevels.map((level, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.activityOption,
                selectedActivityLevel === level && styles.activityOptionSelected,
              ]}
              onPress={() => setSelectedActivityLevel(level)}
            >
              <View style={[
                styles.radioButton,
                selectedActivityLevel === level && styles.radioButtonSelected,
              ]}>
                {selectedActivityLevel === level && <View style={styles.radioButtonInner} />}
              </View>
              <Text
                style={[
                  styles.activityOptionText,
                  selectedActivityLevel === level && styles.activityOptionTextSelected,
                ]}
              >
                {t(`FitnessBackground.activityLevels.${level}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.questionText}>{t('FitnessBackground.exerciseFrequency')}</Text>
        <CustomInput 
          value={exerciseFrequency} 
          onChangeText={setExerciseFrequency}
          keyboardType="numeric"
          placeholder={"2"}
        />

        <Text style={styles.label}>{t('FitnessBackground.exerciseHistory')}</Text>
        <CustomInput 
          value={exerciseHistory} 
          onChangeText={setExerciseHistory}
          placeholder={"2 year of gym"}
        />

          <View style={styles.buttonContainer}>
            <CustomButton title={t('FitnessBackground.next')} onPress={handleNext} />
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
     backgroundColor:"#181819",
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    borderWidth: 2,
    borderColor: COLORS.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: hp(1),
  },
  title: {
    fontSize: wp(6),
       fontFamily: fonts.bold,
       color: "white",
       paddingBottom: hp(2),
  },
  sectionTitle: {
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
  content: {
    flexGrow: 1,
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  label: {
   fontSize: wp(3.5),
       color: "white",
       marginBottom: hp(1.5),
       fontFamily: fonts.regular,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: hp(3),
  },
  genderButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: '#4a4a4a',
    backgroundColor: 'transparent',
  },
  genderButtonSelected: {
    backgroundColor: COLORS.primaryColor,
    borderColor: COLORS.primaryColor,
  },
  genderButtonText: {
    color: '#cccccc',
    fontSize: wp(3),
    textAlign: 'center',
    fontFamily:fonts.regular,
  },
  genderButtonTextSelected: {
    color: 'white',
  },
  activityContainer: {
    marginBottom: hp(3),
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2),
  },
  activityOptionSelected: {
    // Add any selected styling if needed
  },
  radioButton: {
    width: wp(5),
    height: wp(5),
    borderRadius: wp(2.5),
    borderWidth: 2,
    borderColor: COLORS.primaryColor,
    marginRight: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primaryColor,
  },
  radioButtonInner: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    backgroundColor: COLORS.primaryColor,
  },
  activityOptionText: {
    color: '#cccccc',
    fontSize: wp(3),
    flex: 1,
        fontFamily:fonts.regular,

  },
  activityOptionTextSelected: {
    color: 'white',
  },
  questionText: {
    fontSize: wp(3.4),
    color: 'white',
    marginBottom: hp(1.5),
    marginTop: hp(2),
        fontFamily:fonts.regular,

  },
  buttonContainer: {
    marginVertical: hp(4),
  },
});