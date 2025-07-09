import { useState } from "react";
import { ActivityIndicator, Animated, TouchableOpacity } from "react-native";
import fonts from "../assets/fonts";
import { COLORS } from "../utils/COLORS";
import CustomText from "./CustomText";

const CustomButton = ({
  onPress,
  title,
  disabled,
  loading,
  customStyle,
  customText,
  marginBottom,
  marginTop,
  backgroundColor,
  color,
  width = "100%",
  height = 54,
  borderRadius = 8,
  justifyContent = "center",
  alignItems = "center",
  flexDirection = "row",
  alignSelf = "center",
  fontSize,
  marginRight,
  borderWidth,
  borderColor,
  fontFamily,
  mainStyle,
}) => {
  const [animation] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(animation, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animation, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        mainStyle,
        { transform: [{ scale: animation }], width, alignSelf },
      ]}
    >
      <TouchableOpacity
        disabled={loading || disabled}
        activeOpacity={0.6}
        style={[
          {
            backgroundColor: disabled || loading
              ? COLORS.disableButtonColor
              : backgroundColor || COLORS.primaryColor,
            marginTop,
            marginBottom,
            width: "100%",
            height,
            borderRadius,
            flexDirection,
            alignItems,
            justifyContent,
            marginRight,
            borderWidth,
            borderColor,
          },
          customStyle,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.white}
            animating={true}
          />
        ) : (
          <CustomText
            textStyle={customText}
            label={title}
            color={color || COLORS.white}
            fontFamily={fontFamily || fonts.regular}
            fontSize={fontSize || 17}
            lineHeight={22}
            marginTop={-2}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CustomButton;