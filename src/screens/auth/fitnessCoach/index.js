import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import fonts from '../../../assets/fonts';
import { Icons } from '../../../assets/icons';
import CustomButton from '../../../components/CustomButton';
import ProgressBar from '../../../components/progressBar';
import RouteName from '../../../navigation/RouteName';
import { nextSection, previousSection, setCurrentSection } from '../../../store/slices/progressSlice';
import { COLORS } from '../../../utils/COLORS';

export default function FitnessCoach() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userData } = useSelector(state => state.progress);
  const profileImageUri = userData.profilePicture;
  const userName = userData.name;
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    dispatch(nextSection());
    navigation.navigate(RouteName.Basic_Information);
  };

  const handleBack = () => {
    dispatch(previousSection());
    navigation.goBack();
  };

  useEffect(() => {
    dispatch(setCurrentSection(0));
  }, [dispatch]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={wp(6)} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.profileIconContainer}>
          <Image source={Icons.profile} style={styles.profileIcon} />
        </View>
        <ProgressBar />
        <Text style={styles.title}>{t("fitnessCoach.title")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.greeting}>{t('fitnessCoach.greeting', { name: userName })}</Text>
          <Text style={styles.description}>
            {t("fitnessCoach.description1")}
          </Text>
          <Text style={styles.subDescription}>
            {t("fitnessCoach.description2")}
          </Text>
          <View style={styles.imageContainer}>
            <Image
              source={profileImageUri ? { uri: profileImageUri } : Icons.profile}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.instruction}>
            {t("fitnessCoach.description3")}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton title={t("fitnessCoach.button")} onPress={handleNext} />
        </View>
      </ScrollView>
    </View>
  );
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
    paddingTop: hp(8),
    paddingBottom: hp(2),
  },
  backButton: {
    width: wp(10),
    height: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconContainer: {
    marginBottom: hp(2),
  },
  profileIcon: {
    width: wp(10),
    height: wp(10),
    resizeMode: 'contain',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(4),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  title: {
    fontSize: wp(6),
    fontFamily: fonts.bold,
    color: 'white',
    marginBottom: hp(2),
    paddingBottom: hp(2),
  },
  greeting: {
    fontSize: wp(5),
    fontFamily: fonts.medium,
    color: 'white',
    marginBottom: hp(2),
    marginTop: hp(2),
  },
  description: {
    fontSize: wp(3),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    lineHeight: hp(3),
    marginBottom: hp(1),
  },
  subDescription: {
    fontSize: wp(3),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    lineHeight: hp(2.5),
    marginBottom: hp(5),
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: hp(5),
  },
  profileImage: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
  },
  instruction: {
    fontSize: wp(3.5),
    fontStyle: "italic",
    color: COLORS.gray2,
    textAlign: 'center',
    lineHeight: hp(2.5),
  },
  buttonContainer: {
    marginBottom: hp(5),
    paddingHorizontal: wp(5),
  },
});