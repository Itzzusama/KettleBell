import { useIsFocused } from "@react-navigation/native";
import {
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ImageFast from "./ImageFast";

import { COLORS } from "../utils/COLORS";

const { width, height } = Dimensions.get("window");

const FocusAwareStatusBar = ({ barStyle, backgroundColor, translucent }) => {
  const isFocused = useIsFocused();
  return isFocused ? (
    <StatusBar
      barStyle={barStyle}
      backgroundColor={backgroundColor}
      translucent={translucent}
    />
  ) : null;
};

const ScreenWrapper = ({
  children,
  statusBarColor = COLORS.mainBg,
  translucent = false,
  scrollEnabled = false,
  backgroundImage,
  backgroundColor = COLORS.mainBg,
  headerUnScrollable = () => null,
  footerUnScrollable = () => null,
  barStyle = "dark-content",
  refreshControl,
  paddingBottom,
  nestedScrollEnabled,
  paddingHorizontal = 16,
}) => {
  const topInset =
    translucent && Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

  const Content = () => (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <FocusAwareStatusBar
        barStyle={barStyle}
        backgroundColor={statusBarColor}
        translucent={translucent}
      />

      {headerUnScrollable()}

      {scrollEnabled ? (
        <KeyboardAwareScrollView
          nestedScrollEnabled={nestedScrollEnabled}
          refreshControl={refreshControl}
          style={styles.container}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom:
              paddingBottom ?? (Platform.OS === "android" ? 10 : 20),
            paddingHorizontal,
            flexGrow: 1,
            backgroundColor,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View
          style={{
            paddingHorizontal,
            flex: 1,
            paddingTop: topInset,
            paddingBottom
          }}
        >
          {children}
        </View>
      )}

      {footerUnScrollable()}
    </SafeAreaView>
  );

  return backgroundImage ? (
    <View style={{ width, height: height + 70, zIndex: 999 }}>
      <ImageFast
        source={backgroundImage}
        style={{
          width,
          height: height + 70,
          position: "absolute",
          zIndex: -1,
        }}
        resizeMode="cover"
      />
      {Content()}
    </View>
  ) : (
    Content()
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
