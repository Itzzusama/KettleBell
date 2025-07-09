import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Svg, { Circle } from 'react-native-svg';
import fonts from '../../assets/fonts';
import { Images } from '../../assets/images';
import CustomButton from '../../components/CustomButton';
import RouteName from '../../navigation/RouteName';
import { COLORS } from '../../utils/COLORS';

const { width, height } = Dimensions.get('window');

// Responsive scaling function
const scale = (size) => (width / 375) * size;

// Custom ProgressCircle component
const ProgressCircle = ({ percentage, color, size = wp(16), strokeWidth = wp(2) }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={COLORS.white}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90, ${size / 2}, ${size / 2})`}
      />
    </Svg>
  );
};

const RecipeTime2 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const [statusBarHeight, setStatusBarHeight] = useState(StatusBar.currentHeight || 0);
  const { meal } = route.params || {};
  console.log("meal:===========>", meal);

 
  const [dimensions, setDimensions] = useState({ width, height });
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      setStatusBarHeight(StatusBar.currentHeight || 0);
    });
    return () => subscription?.remove();
  }, []);
 
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Image
        source={Images.fruits}
        style={[
          styles.backgroundImage,
          { height: dimensions.height + (Platform.OS === 'android' ? statusBarHeight : 0) },
        ]}
      />

      {/* Linear Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', '#000000']}
        style={[
          styles.gradientOverlay,
          {
            height: dimensions.height + (Platform.OS === 'android' ? statusBarHeight : 0),
            top: 0,
          },
        ]}
      />

      {/* Scrollable Content */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Progress Circles */}
          <View style={styles.progressCircles}>
            <View style={styles.progressItem}>
              <ProgressCircle percentage={70} color="#FEC635" />
            </View>
          </View>

          {/* Exercise Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.exerciseTitle}>{meal.name}</Text>
            <Text style={styles.exerciseDescription}>
              {meal.description}
            </Text>
            <Text style={{color: COLORS.primaryColor, fontFamily: fonts.regular, fontSize: hp(2)}}>{meal.time}</Text>
          </View>

          {/* Exercise Cards List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.spacer} />
            <CustomButton title={t('RecipeTime2.next_button')} onPress={() => navigation.navigate(RouteName.Meal_Detail, { meal } )} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default RecipeTime2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    width: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    position: 'absolute',
    bottom: scale(50),
    left: scale(15),
    right: scale(15),
    zIndex: 5,
  },
  scrollView: {
    maxHeight: hp(50),
  },
  scrollContent: {
    paddingBottom: hp(2),
  },
  progressCircles: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: hp(3),
  },
  progressItem: {
    alignItems: 'center',
    marginRight: wp(5),
  },
  titleSection: {
    marginBottom: hp(2),
  },
  exerciseTitle: {
    color: '#FFF',
    fontSize: scale(28),
    lineHeight: scale(32),
    marginBottom: hp(1.7),
    fontFamily: fonts.bold,
  },
  exerciseDescription: {
    color: 'rgba(255, 255, 255, 0.96)',
    fontSize: scale(14),
    lineHeight: scale(20),
    fontFamily: fonts.regular,
    width: wp(60), 
  },
  exercisesList: {
    gap: hp(1),
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(42, 42, 42, 0.9)',
    borderRadius: wp(3),
    padding: wp(3),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardImage: {
    width: wp(15),
    height: wp(12),
    borderRadius: wp(2),
    marginRight: wp(3),
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: wp(4),
    fontWeight: '600',
    marginBottom: hp(0.5),
  },
  cardDescription: {
    color: '#CCC',
    fontSize: wp(3),
    marginBottom: hp(0.5),
  },
  cardEquipment: {
    color: '#888',
    fontSize: wp(3),
  },
  cardDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  durationText: {
    color: COLORS.primaryColor,
    fontSize: wp(3),
    fontWeight: '500',
  },
  spacer: {
    height: hp(2),
  },
});
