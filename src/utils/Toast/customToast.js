import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Feather";
import Fonts from "../../assets/fonts";
import { COLORS } from "../COLORS";

const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

const ToastIcon = ({ type }) => {
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return <Icon name="check-circle" size={24} color={COLORS.white} />;
    case TOAST_TYPES.ERROR:
      return <Icon name="x-circle" size={24} color={COLORS.white} />;
    case TOAST_TYPES.WARNING:
      return <Icon name="alert-triangle" size={24} color={COLORS.white} />;
    case TOAST_TYPES.INFO:
    default:
      return <Icon name="info" size={24} color={COLORS.white} />;
  }
};

const getBackgroundColor = (type) => {
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return "#10B981"; // Emerald green
    case TOAST_TYPES.ERROR:
      return "#EF4444"; // Red
    case TOAST_TYPES.WARNING:
      return "#F59E0B"; // Amber
    case TOAST_TYPES.INFO:
    default:
      return "#3B82F6"; // Blue
  }
};

const CustomToast = ({
  visible = false,
  message = "",
  type = TOAST_TYPES.INFO,
  duration = 3000,
  onClose = () => {},
  position = "top",
  title,
  action,
  actionText,
  actionOnPress,
  isGlobal = false,
}) => {
  // Use refs to store animated values
  const translateYRef = useRef(null);
  const opacityRef = useRef(null);
  const progressWidthRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize animated values safely
  const getTranslateY = useCallback(() => {
    if (!translateYRef.current) {
      translateYRef.current = new Animated.Value(-100);
    }
    return translateYRef.current;
  }, []);

  const getOpacity = useCallback(() => {
    if (!opacityRef.current) {
      opacityRef.current = new Animated.Value(0);
    }
    return opacityRef.current;
  }, []);

  const getProgressWidth = useCallback(() => {
    if (!progressWidthRef.current) {
      progressWidthRef.current = new Animated.Value(0);
    }
    return progressWidthRef.current;
  }, []);

  const showToast = useCallback(() => {
    const translateY = getTranslateY();
    const opacity = getOpacity();
    const progressWidth = getProgressWidth();

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue:
          position === "top"
            ? StatusBar.currentHeight + (Platform.OS === "ios" ? hp(6) : hp(1))
            : -hp(1),
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(progressWidth, {
        toValue: wp(isGlobal ? 90 : 85),
        duration: duration,
        useNativeDriver: false, // Width animation doesn't support native driver
      }),
    ]).start();
  }, [
    position,
    isGlobal,
    duration,
    getTranslateY,
    getOpacity,
    getProgressWidth,
  ]);

  const hideToast = useCallback(() => {
    const translateY = getTranslateY();
    const opacity = getOpacity();
    const progressWidth = getProgressWidth();

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === "top" ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(progressWidth, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onClose();
    });
  }, [position, onClose, getTranslateY, getOpacity, getProgressWidth]);

  useEffect(() => {
    if (visible) {
      showToast();

      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    } else {
      hideToast();
    }

    // Cleanup timer on unmount or when visible changes
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, showToast, hideToast, duration]);

  // Don't render if not visible and animation values aren't initialized
  if (!visible && !translateYRef.current) {
    return null;
  }

  const translateY = getTranslateY();
  const opacity = getOpacity();
  const progressWidth = getProgressWidth();

  const toastStyles = {
    backgroundColor: getBackgroundColor(type),
    transform: [{ translateY: position === "top" ? translateY : undefined }],
    bottom: position === "bottom" ? translateY : undefined,
    top: position === "top" ? 0 : undefined,
    opacity,
    width: wp(isGlobal ? 90 : 85),
  };

  return (
    <Animated.View
      style={[
        styles.container,
        toastStyles,
        position === "bottom" && styles.bottomContainer,
      ]}
    >
      <View style={styles.contentContainer}>
        {/* <View style={styles.iconContainer}>
          <ToastIcon type={type} />
        </View> */}

        <View style={styles.textContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
        </View>

        {action && (
          <TouchableOpacity onPress={actionOnPress} style={styles.actionButton}>
            <Text style={styles.actionText}>{actionText || "Action"}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Icon name="x" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.progressBar,
          {
            width: progressWidth,
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center",
    minHeight: hp(6),
    borderRadius: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 999,
    overflow: "hidden",
  },
  bottomContainer: {
    bottom: hp(2),
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  iconContainer: {
    marginRight: wp(3),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontFamily: Fonts.bold,
    fontSize: hp(1.8),
    marginBottom: 2,
  },
  message: {
    color: COLORS.white,
    fontFamily: Fonts.medium,
    fontSize: hp(1.6),
  },
  closeButton: {
    padding: 4,
  },
  actionButton: {
    paddingHorizontal: wp(2),
    marginRight: wp(2),
  },
  actionText: {
    color: COLORS.white,
    fontFamily: Fonts.bold,
    fontSize: hp(1.6),
    textDecorationLine: "underline",
  },
  progressBar: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
});

export { CustomToast, TOAST_TYPES };
