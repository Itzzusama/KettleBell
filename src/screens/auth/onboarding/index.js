import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import fonts from "../../../assets/fonts";
import { Images } from "../../../assets/images";
import RouteName from "../../../navigation/RouteName";
import { COLORS } from "../../../utils/COLORS";
// Get initial window dimensions
const { width, height } = Dimensions.get("window");

// Responsive scaling function
const scale = (size) => (width / 375) * size; // Base width: 375 (iPhone 11 Pro)
const scaleFont = (size) => (width / 375) * size;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const [statusBarHeight, setStatusBarHeight] = useState(
    StatusBar.currentHeight || 0
  );

  const slidesContent = t("Onboarding.slides", { returnObjects: true });

  const images = [
    Images.OnboardingImage3,
    Images.OnboardingImage2,
    Images.OnboardingImage1,
  ];

  const data = slidesContent.map((slide, index) => ({
    id: index + 1,
    image: images[index],
    heading: slide.heading,
    description: slide.description,
  }));

  // Handle orientation changes
  const [dimensions, setDimensions] = useState({ width, height });
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
      setStatusBarHeight(StatusBar.currentHeight || 0); // Update status bar height
    });
    return () => subscription?.remove();
  }, []);

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      navigation.navigate(RouteName.LOGIN);
    }
  };

  const handleSkip = () => {
    navigation.navigate(RouteName.LOGIN);
  };

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { height: dimensions.height }]}>
      <Image
        source={item.image}
        style={[
          styles.image,
          {
            height:
              dimensions.height +
              (Platform.OS === "android" ? statusBarHeight : 0),
          },
        ]}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "#FFBB0280"]}
        style={[styles.gradient, { height: dimensions.height * 0.7 }]}
      />
      <View style={styles.content}>
        <Text style={styles.heading}>{item.heading}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderPaginationDots = () => (
    <View style={styles.dotsContainer}>
      {data.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>{t("Onboarding.skip_button")}</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View style={styles.bottomSection}>
        {renderPaginationDots()}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Ionicons name="arrow-forward" size={scale(24)} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor, // Fallback background color
  },
  slide: {
    width: width,
    position: "relative",
  },
  image: {
    width: "100%",
    resizeMode: "cover",
    position: "absolute",
    top: 0,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -50,
  },
  skipButton: {
    position: "absolute",
    top:
      Platform.OS === "ios" ? scale(40) : StatusBar.currentHeight + scale(10),
    right: scale(20),
    zIndex: 10,
    paddingHorizontal: scale(15),
    paddingVertical: scale(8),
  },
  skipText: {
    color: "#fff",
    fontSize: scaleFont(16),
    fontFamily: fonts.medium
  },
  content: {
    position: "absolute",
    bottom: scale(120),
    left: scale(30),
    right: scale(30),
    zIndex: 5,
  },
  heading: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(32),
    marginBottom: scale(12),
    textAlign: "center",
  },
  description: {
    color: "rgba(255,255,255,0.8)",
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
    textAlign: "center",
    fontFamily: fonts.regular
  },
  bottomSection: {
    position: "absolute",
    bottom: scale(50),
    left: scale(30),
    right: scale(30),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginHorizontal: scale(4),
  },
  activeDot: {
    backgroundColor: COLORS.primaryColor,
    width: scale(24),
  },
  inactiveDot: {
    backgroundColor: COLORS.gray,
  },
  nextButton: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: scale(3.84),
    elevation: 5,
  },
});
