import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import fonts from "../../assets/fonts";
import { COLORS } from "../../utils/COLORS";

export default function MessageScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={wp(6)} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("Message.header_title")}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Specialist Notification Banner */}
      <View style={styles.notificationBanner}>
        <View style={styles.specialistIcon}>
          <Ionicons name="person" size={wp(4)} color="#666" />
        </View>
        <Text style={styles.notificationText}>{t("Message.notification_text")}</Text>
      </View>

      {/* Chat Area */}
      <View style={styles.chatContainer}>
        {/* Date Indicator */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{t("Message.date_text")}</Text>
        </View>

        {/* Message */}
        <View style={styles.messageContainer}>
          <View style={styles.sentMessage}>
            <Text style={styles.messageText}>{t("Message.sample_message")}</Text>
            <View style={styles.messageStatus}>
              <Ionicons name="checkmark" size={wp(4)} color="white" />
            </View>
          </View>
          <Text style={styles.timestamp}>15:59</Text>
        </View>
      </View>

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? hp(10) : hp(2)}
      >
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder={t("Message.input_placeholder")}
            placeholderTextColor="#888"
            multiline
          />
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy-outline" size={wp(5.5)} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={wp(5.5)} color="#888" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    fontSize: hp(2.3), // Responsive font size
    color: "white",
    fontFamily: fonts.medium,
  },
  placeholder: {
    width: wp(8), // Responsive placeholder width
  },
  notificationBanner: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    marginHorizontal: wp(4),
    marginVertical: hp(2),
    borderRadius: wp(3),
  },
  specialistIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: COLORS.darkGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  notificationText: {
    color: "#888",
    fontSize: wp(3), 
    fontFamily: fonts.regular,
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  dateContainer: {
    alignItems: "center",
    marginVertical: hp(3),
  },
  dateText: {
    color: "#888",
    fontSize: wp(3.2), // Responsive font size
    fontFamily: fonts.regular,
  },
  messageContainer: {
    alignItems: "flex-end",
    marginBottom: hp(3),
  },
  sentMessage: {
    backgroundColor: "#FFD700",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderRadius: wp(5),
    borderBottomRightRadius: wp(1),
    maxWidth: wp(70), 
    flexDirection: "row",
    alignItems: "center",
  },
  messageText: {
    color: "white",
    fontSize: wp(3),
    fontFamily: fonts.regular,
    marginRight: wp(2),
  },
  messageStatus: {
    marginLeft: wp(1),
  },
  timestamp: {
    color: "#888",
    fontSize: wp(2.6), // Responsive font size
    fontFamily: fonts.regular,
    marginTop: hp(0.5),
    marginRight: wp(2),
  },
  inputContainer: {
    width: "100%",
  },
  messageInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#2a2a2a",
    borderRadius: wp(5),
    marginHorizontal: wp(4),
    marginVertical: hp(1.5),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8), // Reduced padding for smaller height
    minHeight: hp(5), 
  },
  messageInput: {
    flex: 1,
    color: "white",
    fontSize: wp(3.8), 
    fontFamily: fonts.regular,
    maxHeight: hp(8), 
    paddingVertical: hp(0.5), 
  },
  emojiButton: {
    marginLeft: wp(2),
    padding: wp(1.5), 
  },
  attachButton: {
    marginLeft: wp(2),
    padding: wp(1.5), 
  },
});