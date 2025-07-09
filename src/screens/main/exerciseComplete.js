import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Svg, { Circle } from 'react-native-svg';
import fonts from '../../assets/fonts';
import { COLORS } from '../../utils/COLORS';

const { width, height } = Dimensions.get('window');

// Responsive scaling function
const scale = (size) => (width / 375) * size;

// Custom Progress Semicircle component (reverted to 180-degree semicircle)
const ProgressCircle = ({ 
  percentage, 
  label,
  completedColor = '#FEC635', 
  remainingColor = '#E5E5E5', 
  size = wp(55), // Increased size
  strokeWidth = wp(3.5) // Increased stroke width
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Semicircle circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.progressContainer}>
      <Svg width={size} height={size / 2 + strokeWidth}> 
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={remainingColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          transform={`rotate(180, ${size / 2}, ${size / 2})`} 
        />
        {/* Progress semicircle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={completedColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(180, ${size / 2}, ${size / 2})`} 
        />
      </Svg>
      
      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={styles.emojiIcon}>😊</Text>
        <Text style={styles.percentageText}>{percentage}%</Text>
        <Text style={styles.centerLabel}>{label}</Text>
      </View>
    </View>
  );
};

export default function ExerciseComplete() {
  const { t } = useTranslation();
  const [statusBarHeight, setStatusBarHeight] = useState(StatusBar.currentHeight || 0);
  const [dimensions, setDimensions] = useState({ width, height });

  // Handle orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      setStatusBarHeight(StatusBar.currentHeight || 0);
    });
    return () => subscription?.remove();
  }, []);

  const completedPercentage = 70;
  const remainingPercentage = 30;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#2A2A2A', '#1A1A1A', '#000000']}
        style={[
          styles.gradientBackground,
          {
            height: dimensions.height + (Platform.OS === 'android' ? statusBarHeight : 0),
          },
        ]}
      />

      {/* Decorative circles in top-left corner */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Progress Circle */}
          <View style={styles.progressSection}>
            <ProgressCircle percentage={64.87} label={t("ExerciseComplete.burn_calories_label")} />
            
            {/* Progress labels */}
            <View style={styles.progressLabels}>
              <View style={styles.labelItem}>
                <Text style={styles.labelPercentage}>{completedPercentage}%</Text>
                <Text style={styles.labelText}>{t("ExerciseComplete.completed_label")}</Text>
              </View>
              <View style={styles.labelItem}>
                <Text style={[styles.labelPercentage, { color: '#E5E5E5' }]}>{remainingPercentage}%</Text>
                <Text style={[styles.labelText, { color: '#E5E5E5' }]}>{t("ExerciseComplete.remaining_label")}</Text>
              </View>
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>{t("ExerciseComplete.title")}</Text>
            <Text style={styles.subtitle}>
              {t("ExerciseComplete.subtitle", { percentage: completedPercentage })}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -hp(10),
    left: -wp(15),
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: 'rgba(254, 198, 53, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    top: -hp(12),
    left: -wp(12),
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: 'rgba(254, 198, 53, 0.15)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: -hp(8),
    left: -wp(18),
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: 'rgba(254, 198, 53, 0.08)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: hp(5),
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(3),
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: wp(8), // Adjusted for semicircle
  },
  emojiIcon: {
    fontSize: wp(10),
    marginBottom: hp(0.5),
            fontFamily:fonts.regular,

  },
  percentageText: {
    color: '#FFF',
    fontSize: wp(10),
        fontFamily:fonts.bold,
    lineHeight: wp(11),
  },
  centerLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: wp(3.7),
        fontFamily:fonts.regular,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp(55),
    marginTop: hp(1),
  },
  labelItem: {
    alignItems: 'center',
  },
  labelPercentage: {
    color: '#FEC635',
    fontSize: wp(4.2),
        fontFamily:fonts.regular,
  },
  labelText: {
    color: '#FEC635',
    fontSize: wp(3),
        fontFamily:fonts.regular,
  },
  titleSection: {
    alignItems: 'center',
  },
  mainTitle: {
    color: '#FFF',
    fontSize: scale(29),
        fontFamily:fonts.bold,
    textAlign: 'center',
    marginBottom: hp(2),
    lineHeight: scale(38),
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: scale(16),
    textAlign: 'center',
    lineHeight: scale(24),
        fontFamily:fonts.regular,
    paddingHorizontal:hp(3)
  },
});