"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useDispatch } from "react-redux"
import fonts from "../../../assets/fonts"
import LanguageSwitcher from "../../../components/languageSwitcher"
import RouteName from "../../../navigation/RouteName"
import { PostApiRequest } from "../../../services/api"
import { logout } from "../../../store/slices/AuthConfig"
import { COLORS } from "../../../utils/COLORS"
import toast from "../../../utils/Toast/toastContext"

export default function ClientProfile() {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const specialties = ["Strength Training", "Kettlebell", "Weight Loss"]
  const dispatch = useDispatch()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [notificationEnabled, setNotificationEnabled] = useState(true)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const res = await PostApiRequest("api/auth/logout")
      toast.showToast({
        status: "success",
        message: res.data.message,
        duration: 3000,
      })

      await AsyncStorage.clear()
      dispatch(logout())
      navigation.reset({
        index: 0,
        routes: [{ name: RouteName.LOGIN }],
      })
    } catch (error) {
      toast.showToast({
        status: "error",
        message: error.response
          ? error.response.data.message
          : "An error occurred during logout.",
        duration: 3000,
      })
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={"transparent"} transparent />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={heightPercentageToDP(3)} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("clientProfile.title")}</Text>
        <LanguageSwitcher />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1618641986557-1ecd230959aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={heightPercentageToDP(2)} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>Madison Smith</Text>
          <Text style={styles.profileEmail}>madisons@example.com</Text>
        </View>

        {/* Specialties Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t("clientProfile.Special")}</Text>
          <View style={styles.specialtiesContainer}>
            {specialties.map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t("clientProfile.Special")}</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Ionicons name="calculator-outline" size={heightPercentageToDP(2.5)} color={COLORS.primaryColor} />
              </View>
              <Text style={styles.menuItemText}>{t("clientProfile.bmr_calculator")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={heightPercentageToDP(2.5)} color={COLORS.gray2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate(RouteName.Client_Message)}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Ionicons name="chatbubble-outline" size={heightPercentageToDP(2.5)} color={COLORS.primaryColor} />
              </View>
              <Text style={styles.menuItemText}>{t("clientProfile.message")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={heightPercentageToDP(2.5)} color={COLORS.gray2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate(RouteName.Client_Progress)}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Ionicons name="trending-up-outline" size={heightPercentageToDP(2.5)} color={COLORS.primaryColor} />
              </View>
              <Text style={styles.menuItemText}>{t("clientProfile.workout_progress")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={heightPercentageToDP(2.5)} color={COLORS.gray2} />
          </TouchableOpacity>
        </View>

        {/* Notification Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t("clientProfile.notification")}</Text>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Ionicons name="notifications-outline" size={heightPercentageToDP(2.5)} color={COLORS.primaryColor} />
              </View>
              <Text style={styles.menuItemText}>{t("clientProfile.pop_up_notification")}</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleSwitch, notificationEnabled ? styles.toggleSwitchOn : styles.toggleSwitchOff]}
              onPress={() => setNotificationEnabled(!notificationEnabled)}
            >
              <View style={[styles.toggleKnob, notificationEnabled ? styles.toggleKnobOn : styles.toggleKnobOff]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t("clientProfile.setting")}</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Ionicons name="settings-outline" size={heightPercentageToDP(2.5)} color={COLORS.primaryColor} />
              </View>
              <Text style={styles.menuItemText}>{t("clientProfile.app_settings")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={heightPercentageToDP(2.5)} color={COLORS.gray2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Ionicons name="shield-outline" size={heightPercentageToDP(2.5)} color={COLORS.primaryColor} />
              </View>
              <Text style={styles.menuItemText}>{t("clientProfile.privacy_policy")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={heightPercentageToDP(2.5)} color={COLORS.gray2} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setShowLogoutModal(true)}
            disabled={isLoggingOut}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Ionicons name="log-out-outline" size={heightPercentageToDP(2.5)} color={COLORS.primaryColor} />
              </View>
              <Text style={styles.menuItemText}>
                {isLoggingOut ? t("clientProfile.loggingOut") : t("clientProfile.logout")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={heightPercentageToDP(2.5)} color={COLORS.gray2} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showLogoutModal && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
                disabled={isLoggingOut}
              >
                <Text style={styles.modalButtonText}>
                  {isLoggingOut ? "Logging Out" : "Logout"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: heightPercentageToDP(6),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: widthPercentageToDP(4),
  },
  backButton: {
    padding: widthPercentageToDP(1),
  },
  headerTitle: {
    fontSize: heightPercentageToDP(2.3),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: heightPercentageToDP(3),
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: heightPercentageToDP(2),
  },
  profileImage: {
    width: widthPercentageToDP(25),
    height: widthPercentageToDP(25),
    borderRadius: widthPercentageToDP(12.5),
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primaryColor,
    width: widthPercentageToDP(8),
    height: widthPercentageToDP(8),
    borderRadius: widthPercentageToDP(4),
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: heightPercentageToDP(2.5),
    fontFamily: fonts.bold,
    color: COLORS.white,
    marginBottom: heightPercentageToDP(0.5),
  },
  profileEmail: {
    fontSize: heightPercentageToDP(1.6),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
  },
  sectionContainer: {
    backgroundColor: COLORS.darkGray,
    borderRadius: widthPercentageToDP(3),
    marginHorizontal: widthPercentageToDP(4),
    marginBottom: heightPercentageToDP(3),
    padding: heightPercentageToDP(2),
  },
  sectionTitle: {
    fontSize: heightPercentageToDP(1.8),
    fontFamily: fonts.medium,
    color: COLORS.white,
    marginBottom: heightPercentageToDP(1.5),
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: widthPercentageToDP(2),
  },
  specialtyTag: {
    backgroundColor: "#FFE7A6",
    paddingHorizontal: widthPercentageToDP(3),
    paddingVertical: heightPercentageToDP(0.8),
    borderRadius: widthPercentageToDP(4),
  },
  specialtyText: {
    fontSize: heightPercentageToDP(1.4),
    fontFamily: fonts.medium,
    color: COLORS.black,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: heightPercentageToDP(1.5),
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemIcon: {
    marginRight: widthPercentageToDP(3),
  },
  menuItemText: {
    fontSize: heightPercentageToDP(1.6),
    fontFamily: fonts.regular,
    color: COLORS.white,
  },
  toggleSwitch: {
    width: widthPercentageToDP(12),
    height: heightPercentageToDP(3),
    borderRadius: heightPercentageToDP(1.5),
    padding: widthPercentageToDP(0.5),
  },
  toggleSwitchOn: {
    backgroundColor: "#4CD964",
  },
  toggleSwitchOff: {
    backgroundColor: COLORS.gray3,
  },
  toggleKnob: {
    width: heightPercentageToDP(2.5),
    height: heightPercentageToDP(2.5),
    borderRadius: heightPercentageToDP(1.25),
    backgroundColor: COLORS.white,
  },
  toggleKnobOn: {
    alignSelf: "flex-end",
  },
  toggleKnobOff: {
    alignSelf: "flex-start",
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.darkGray,
    borderRadius: widthPercentageToDP(3),
    padding: widthPercentageToDP(4),
    width: widthPercentageToDP(80),
  },
  modalTitle: {
    fontSize: heightPercentageToDP(2),
    fontFamily: fonts.medium,
    color: COLORS.white,
    marginBottom: heightPercentageToDP(2),
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: heightPercentageToDP(1.5),
    borderRadius: widthPercentageToDP(2),
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.gray3,
  },
  confirmButton: {
    backgroundColor: COLORS.primaryColor,
  },
  modalButtonText: {
    fontSize: heightPercentageToDP(1.8),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
})