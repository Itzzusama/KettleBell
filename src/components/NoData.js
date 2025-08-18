import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import fonts from "../assets/fonts";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { COLORS } from "../utils/COLORS";

const NoData = ({
  title = "Nothing here yet",
  subtitle,
  marginTop = 0,
  iconName = "document-text-outline",
  onActionPress,
  actionLabel = "Reload",
  fullHeight = false,
  style,
  compact = false,
}) => {
  return (
    <View
      style={[
        styles.wrapper,
        fullHeight && { flex: 1, justifyContent: "center" },
        { marginTop },
        style,
      ]}
    >
      <View style={[styles.noDataContainer, compact && styles.compact]}>
        <View style={styles.iconBadge}>
          <Ionicons name={iconName} size={wp(7.5)} color={COLORS.white} />
        </View>

        <Text style={styles.titleText} numberOfLines={2}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.subtitleText} numberOfLines={3}>
            {subtitle}
          </Text>
        ) : null}

        {onActionPress ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onActionPress}
            style={styles.actionBtn}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default NoData;

const styles = StyleSheet.create({
  wrapper: { width: "80%", alignSelf: "center" },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(3.6),
    paddingHorizontal: wp(4),

    gap: hp(1.2),
  },
  compact: { paddingVertical: hp(2.2) },
  iconBadge: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    backgroundColor: "#2C2E31",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3A3D41",
  },
  titleText: {
    color: "#F1F1F3",
    fontSize: wp(4),
    fontFamily: fonts.medium,
    textAlign: "center",
  },
  subtitleText: {
    color: "#9CA3AF",
    fontSize: wp(3.2),
    fontFamily: fonts.regular,
    textAlign: "center",
    lineHeight: hp(2.6),
  },
  actionBtn: {
    marginTop: hp(0.6),
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    backgroundColor: COLORS.primaryColor || "#FEC635",
  },
  actionText: {
    color: "#0B0B0C",
    fontSize: wp(3.4),
    fontFamily: fonts.semiBold || fonts.medium,
  },
});
