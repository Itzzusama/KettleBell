import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from "react-native-responsive-screen";
import fonts from "../../../assets/fonts";
import { COLORS } from "../../../utils/COLORS";
import { GetApiRequest } from "../../../services/api";
import { useEffect, useState } from "react";
import moment from "moment/moment";

export default function ClientMessage() {
  const navigation = useNavigation();

  const isFocus = useIsFocused();
  const { t } = useTranslation();
  const messages = [
    {
      id: 1,
      name: "Emilie",
      message: "Ok, see you then",
      time: "23 min",
      hasUnread: true,
      isOnline: false,
      isTyping: false,
      isSentByMe: false,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 2,
      name: "Emilie",
      message: "Typing...",
      time: "23 min",
      hasUnread: true,
      isOnline: true,
      isTyping: true,
      isSentByMe: false,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 3,
      name: "Emilie",
      message: "You: Hello how are you?",
      time: "23 min",
      hasUnread: false,
      isOnline: true,
      isTyping: false,
      isSentByMe: true,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 4,
      name: "Emilie",
      message: "You: Hey! What's up, long time...",
      time: "23 min",
      hasUnread: false,
      isOnline: false,
      isTyping: false,
      isSentByMe: true,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 5,
      name: "Emilie",
      message: "Ok, see you then",
      time: "23 min",
      hasUnread: false,
      isOnline: false,
      isTyping: false,
      isSentByMe: false,
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 6,
      name: "Emilie",
      message: "You: Hello how are you?",
      time: "23 min",
      hasUnread: false,
      isOnline: true,
      isTyping: false,
      isSentByMe: true,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 7,
      name: "Emilie",
      message: "You: Hey! What's up, long time...",
      time: "23 min",
      hasUnread: false,
      isOnline: false,
      isTyping: false,
      isSentByMe: true,
      avatar:
        "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 8,
      name: "Emilie",
      message: "Ok, see you then",
      time: "23 min",
      hasUnread: false,
      isOnline: false,
      isTyping: false,
      isSentByMe: false,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
  ];

  const [conversations, setConversations] = useState([]);

  const getConversation = async () => {
    try {
      const response = await GetApiRequest("api/chat/conversations");
      console.log(
        "response.data?.data[0]?.client",
        response.data?.data[0]?.client
      );

      setConversations(response.data?.data || []);
    } catch (error) {}
  };

  useEffect(() => {
    getConversation();
  }, [isFocus]);

  const handleMessagePress = (message) => {
    console.log("Message pressed:", message.name);
    // Navigate to chat screen
  };

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() => handleMessagePress(item)}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: item?.client?.avatar
              ? item?.client?.avatar
              : "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
          }}
          style={styles.avatar}
        />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.messageContent}>
        <Text style={styles.messageName}>{item?.client?.name}</Text>
        {/* <Text style={styles.messageName}>{item?.name}</Text> */}
        <Text
          style={[
            styles.messageText,
            item.isTyping && styles.typingText,
            item.isSentByMe && styles.sentMessageText,
          ]}
        >
          {item.message}
        </Text>
      </View>

      <View style={styles.messageRight}>
        <Text style={styles.messageTime}>
          {moment(item.lastMessageAt).fromNow()}
        </Text>
        {item.hasUnread && <View style={styles.unreadIndicator} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={"transparent"}
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={heightPercentageToDP(3)}
            color={COLORS.white}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("ClientMessage.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Messages Section */}
      <View style={styles.messagesSection}>
        <Text style={styles.sectionTitle}>{t("ClientMessage.msg")}</Text>

        <FlatList
          data={conversations}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
        />
      </View>
    </SafeAreaView>
  );
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
    paddingBottom: heightPercentageToDP(2),
  },
  backButton: {
    padding: widthPercentageToDP(1),
  },
  headerTitle: {
    fontSize: heightPercentageToDP(2.3),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  headerSpacer: {
    width: widthPercentageToDP(8),
  },
  messagesSection: {
    flex: 1,
    paddingHorizontal: widthPercentageToDP(4),
    paddingTop: heightPercentageToDP(2),
  },
  sectionTitle: {
    fontSize: heightPercentageToDP(2.2),
    fontFamily: fonts.bold,
    color: COLORS.white,
    marginBottom: heightPercentageToDP(2),
  },
  messagesList: {
    paddingBottom: heightPercentageToDP(2),
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: heightPercentageToDP(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  avatarContainer: {
    position: "relative",
    marginRight: widthPercentageToDP(3),
  },
  avatar: {
    width: widthPercentageToDP(12),
    height: widthPercentageToDP(12),
    borderRadius: widthPercentageToDP(6),
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: widthPercentageToDP(3.5),
    height: widthPercentageToDP(3.5),
    borderRadius: widthPercentageToDP(1.75),
    backgroundColor: "#47D16C",
    borderWidth: 2,
    borderColor: COLORS.backgroundColor,
  },
  messageContent: {
    flex: 1,
    justifyContent: "center",
  },
  messageName: {
    fontSize: heightPercentageToDP(1.8),
    fontFamily: fonts.medium,
    color: COLORS.white,
    marginBottom: heightPercentageToDP(0.3),
  },
  messageText: {
    fontSize: heightPercentageToDP(1.5),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    lineHeight: heightPercentageToDP(2),
  },
  typingText: {
    fontStyle: "italic",
    color: COLORS.gray2,
  },
  sentMessageText: {
    color: COLORS.gray2,
  },
  messageRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  messageTime: {
    fontSize: heightPercentageToDP(1.4),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    marginBottom: heightPercentageToDP(0.5),
  },
  unreadIndicator: {
    width: widthPercentageToDP(2.5),
    height: widthPercentageToDP(2.5),
    borderRadius: 20,
    backgroundColor: COLORS.primaryColor,
  },
});
