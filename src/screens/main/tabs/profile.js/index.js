"use client";

import {
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import fonts from "../../../../assets/fonts/index";
import RouteName from "../../../../navigation/RouteName";
import { GetApiRequest, PostApiRequest } from "../../../../services/api";
import { resetProgress } from "../../../../store/slices/progressSlice";
import { COLORS } from "../../../../utils/COLORS";
import { useToast } from "../../../../utils/Toast/toastContext";

const { width } = Dimensions.get("window");

export default function Profile() {
  const navigation = useNavigation();
  const { userData } = useSelector((state) => state.users);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState({});
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const toast = useToast();

  const toggleSwitch = () => setIsNotificationEnabled((prev) => !prev);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await PostApiRequest("api/auth/logout");
      toast.showToast({
        status: "success",
        message: res.data.message,
        duration: 3000,
      });

      await AsyncStorage.clear();
      dispatch(resetProgress());
    } catch (error) {
      toast.showToast({
        status: "error",
        message: error.response
          ? error.response.data.message
          : "An error occurred during logout.",
        duration: 3000,
      });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      navigation.navigate(RouteName.AuthStack);
    }
  };

  const LogoutModal = () => (
    <Modal
      visible={showLogoutModal}
      transparent={true}
      onRequestClose={() => setShowLogoutModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIconContainer}>
              <MaterialCommunityIcons
                name="logout"
                size={32}
                color={COLORS.primaryColor}
              />
            </View>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to logout from your account?
            </Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.logoutButton]}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <View style={styles.loader} />
              ) : (
                <Text style={styles.logoutButtonText}>Logout</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={"light-content"}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("Profile.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri:
                  userData.avatar ||
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/profile%20%281%29-eXi6mLmmvgcw9cLfiOwFvfXZletFX8.png",
              }}
              style={styles.profileImage}
            />
            <View style={styles.editIconContainer}>
              <FontAwesome name="pencil" size={14} color="white" />
            </View>
          </View>
          <Text style={styles.profileName}>{userData?.name}</Text>
          <Text style={styles.profileEmail}>{userData?.email}</Text>
        </View>

        {/* Health Profile */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("Profile.health")}</Text>
          {[
            {
              icon: <FontAwesome5 name="bullseye" size={16} color="#FFD700" />,
              label: t("Profile.health_items.primary_goal"),
              value: "General Fitness",
            },
            {
              icon: (
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={18}
                  color="#FFD700"
                />
              ),
              label: t("Profile.health_items.fitness_level"),
              value: "Beginner",
            },
            {
              icon: <FontAwesome5 name="fire" size={16} color="#FFD700" />,
              label: t("Profile.health_items.daily_calories"),
              value: "2556 Calories",
            },
            {
              icon: (
                <MaterialCommunityIcons
                  name="food-drumstick"
                  size={18}
                  color="#FFD700"
                />
              ),
              label: t("Profile.health_items.protein_goal"),
              value: "126g",
            },
          ].map((item, index) => (
            <View style={styles.infoRow} key={index}>
              <View style={styles.infoLeft}>
                {item.icon}
                <Text style={styles.infoLabel}>{item.label}</Text>
              </View>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Specialties */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("Profile.specialties")}</Text>
          {[
            {
              icon: (
                <FontAwesome5 name="calculator" size={hp(2)} color="#FFD700" />
              ),
              label: t("Profile.specialties_items.bmr_calculator"),
            },
            {
              icon: (
                <Feather name="message-square" size={hp(2)} color="#FFD700" />
              ),
              label: t("Profile.specialties_items.message"),
              navigateTo: "Message",
            },
            {
              icon: (
                <MaterialCommunityIcons
                  name="chart-line"
                  size={hp(2.2)}
                  color="#FFD700"
                />
              ),
              label: t("Profile.specialties_items.workout_progress"),
            },
            {
              icon: (
                <MaterialCommunityIcons
                  name="history"
                  size={hp(2.2)}
                  color="#FFD700"
                />
              ),
              label: "Logs",
              navigateTo: "LogScreen",
            },
          ].map((item, index) => (
            <TouchableOpacity
              style={styles.menuItem}
              key={index}
              onPress={() => {
                if (item.navigateTo == "Message") {
                  navigation.navigate(RouteName.Message_screen);
                } else if (item.navigateTo === "LogScreen") {
                  navigation.navigate(RouteName.LogScreen);
                } else {
                  // Handle other navigation cases if needed
                }
              }}
            >
              <View style={styles.menuLeft}>
                {item.icon}
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={hp(2.4)} color="gray" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Notification */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("Profile.notification")}</Text>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <FontAwesome5 name="bell" size={hp(2)} color="#FFD700" />
              <Text style={styles.menuLabel}>
                {t("Profile.notification_items.pop_up_notification")}
              </Text>
            </View>
            <Switch
              value={isNotificationEnabled}
              onValueChange={toggleSwitch}
              trackColor={{ false: "#3e3e3e", true: "#4CD964" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("Profile.settings")}</Text>
          {[
            {
              icon: (
                <Ionicons name="settings-outline" size={18} color="#FFD700" />
              ),
              label: t("Profile.settings_items.app_settings"),
              onPress: () => {},
            },
            {
              icon: (
                <MaterialCommunityIcons
                  name="shield-check"
                  size={18}
                  color="#FFD700"
                />
              ),
              label: t("Profile.settings_items.privacy_policy"),
              onPress: () => {},
            },
            {
              icon: (
                <MaterialCommunityIcons
                  name="shield-check"
                  size={18}
                  color="#FFD700"
                />
              ),
              label: "Update Password",
              onPress: () => navigation.navigate(RouteName.Update_Password),
            },
            {
              icon: (
                <MaterialCommunityIcons
                  name="logout"
                  size={18}
                  color="#FFD700"
                />
              ),
              label: t("Profile.settings_items.logout"),
              onPress: () => setShowLogoutModal(true),
            },
          ].map((item, index) => (
            <TouchableOpacity
              style={styles.menuItem}
              key={index}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                {item.icon}
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={hp(2.4)} color="gray" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <LogoutModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: hp(6),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: hp(2.3),
    color: "white",
    fontFamily: fonts.medium,
  },
  placeholder: { width: 24 },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: hp(10),
  },
  profileInfo: {
    alignItems: "center",
    paddingVertical: 24,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 999,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFD700",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    color: "white",
    fontFamily: fonts.regular,
  },
  profileEmail: {
    fontSize: 14,
    color: "#888",
    fontFamily: fonts.regular,
  },
  card: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    color: "white",
    marginBottom: 16,
    fontFamily: fonts.medium,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    color: "#888",
    marginLeft: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  infoValue: {
    color: "white",
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuLabel: {
    color: "#888",
    marginLeft: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.2)",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.medium,
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  logoutButton: {
    backgroundColor: COLORS.primaryColor,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  loader: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
    borderTopColor: "transparent",
    animationKeyframes: {
      "0%": { transform: [{ rotate: "0deg" }] },
      "100%": { transform: [{ rotate: "360deg" }] },
    },
    animationDuration: "1s",
    animationIterationCount: "infinite",
  },
});
