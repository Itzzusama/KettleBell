import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../../components/ScreenWrapper";
import { COLORS } from "../../../utils/COLORS";
import Footer from "./molecules/Footer";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import fonts from "../../../assets/fonts";
import { GetApiRequest } from "../../../services/api";
import { useIsFocused } from "@react-navigation/native";
import { useSocket } from "../../../utils/SocketProvider";
import { useSelector } from "react-redux";
import CustomText from "../../../components/CustomText";
import moment from "moment";

const InboxScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocus = useIsFocused();

  // Get socket helpers
  const { send, socket, isConnected } = useSocket();

  const { userData } = useSelector((state) => state.users);
  const client = route.params?.client;
  const userId = userData?._id;
  const clientId = client?.id;
  const topInset = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
  console.log(client);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Join conversation and fetch messages
  useEffect(() => {
    if (clientId) {
      fetchMessages();
    }

    if (socket && clientId) {
      socket.emit("joinConversation", clientId);
      // Listen for new messages
      socket.on("newMessage", handleNewMessage);
      socket.on("error", handleError);
      // Optionally listen for typing
      socket.on("typing", handleTyping);
    }

    return () => {
      if (socket) {
        socket.off("newMessage", handleNewMessage);
        socket.off("typing", handleTyping);
        socket.off("error", handleError);
      }
    };
  }, [socket, clientId]);

  // Mark all messages as read when focused
  useEffect(() => {
    if (isFocus && socket && messages.length > 0) {
      const unread = messages.filter((m) => {
        const messageSenderId =
          typeof m.sender === "object" ? m.sender._id : m.sender;
        return !m.readBy?.includes(userId) && messageSenderId !== userId;
      });

      unread.forEach((msg) => {
        socket.emit("markMessageRead", msg._id);
      });
    }
  }, [isFocus, messages, socket, userId]);

  const fetchMessages = async () => {
    setRefreshing(true);
    try {
      const response = await GetApiRequest(
        `api/chat/conversations/${clientId}/messages`
      );
      console.log("Messages response:", response.data);

      if (response.data?.success && Array.isArray(response.data?.data)) {
        setMessages(response.data.data || []);
      } else {
        console.warn("Invalid messages response format:", response.data);
        setMessages([]);
      }
    } catch (error) {
      console.log("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNewMessage = (msg) => {
    console.log("New message received:", msg);
    setMessages((prev) => [msg, ...prev]);

    // Mark as read if message is from other user
    const messageSenderId =
      typeof msg.sender === "object" ? msg.sender._id : msg.sender;
    if (messageSenderId !== userId) {
      socket.emit("markMessageRead", msg._id);
    }
  };

  const handleError = (error) => {
    console.log("Socket error:", error);
  };

  const handleTyping = (data) => {
    if (data.clientId === clientId && data.isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || !socket) return;

    const messageData = {
      recipientId: clientId,
      message: inputText,
      messageType: "text",
    };
    console.log("Sending message:", messageData);

    // Create a temporary message for immediate UI feedback
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      content: inputText,
      sender: { _id: userId },
      createdAt: new Date().toISOString(),
      messageType: "text",
      isPending: true,
    };

    // Add temporary message to UI
    setMessages((prev) => [tempMessage, ...prev]);
    setInputText("");

    socket.emit("sendMessage", messageData, (res) => {
      console.log("Send message response:", res);
      if (res?.success && res.message) {
        // Replace temporary message with real message
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg._id !== tempMessage._id);
          return [res.message, ...filtered];
        });
      } else {
        // Remove temporary message if failed
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== tempMessage._id)
        );
        console.error("Failed to send message:", res);
      }
    });
  };

  // Typing indicator
  useEffect(() => {
    if (!socket || !clientId) return;

    const typingTimeout = setTimeout(() => {
      if (inputText) {
        socket.emit("typing", { clientId, isTyping: true });
      }
    }, 500);

    return () => clearTimeout(typingTimeout);
  }, [inputText, socket, clientId]);

  const isUserMessage = (message) => {
    const messageSenderId =
      typeof message.sender === "object" ? message.sender._id : message.sender;
    return messageSenderId === userId;
  };

  const getMessageContent = (message) => {
    return message?.content || message?.message || "";
  };

  const getMessageSender = (message) => {
    if (typeof message.sender === "object") {
      return message.sender._id;
    }
    return message.sender;
  };

  const renderMessage = ({ item }) => {
    try {
      const isUser = isUserMessage(item);
      const messageContent = getMessageContent(item);
      const messageTime = moment(item.createdAt).format("h:mm A");

      // Debug logging
      console.log("Rendering message:", {
        id: item._id,
        content: messageContent,
        sender: item.sender,
        senderId: getMessageSender(item),
        isUser,
        userId,
      });

      // return (
      //   <View key={item._id || item.id} style={styles.messageWrapper}>
      //     <CustomText
      //       label={messageTime}
      //       color="#818898"
      //       fontSize={12}
      //       marginTop={5}
      //       alignSelf={isUser ? "flex-end" : "flex-start"}
      //     />
      //     <View
      //       style={[
      //         styles.messageContainer,
      //         isUser ? styles.userMessage : styles.otherMessage,
      //       ]}
      //     >
      //       <CustomText
      //         label={messageContent}
      //         color={isUser ? COLORS.black1 : COLORS.white}
      //         lineHeight={25}
      //       />
      //     </View>
      //   </View>
      // );
    } catch (error) {
      console.error("Error rendering message:", error, item);
      return null;
    }
  };

  return (
    <ScreenWrapper
      backgroundColor={COLORS.backgroundColor}
      barStyle="light-content"
      footerUnScrollable={() => (
        <View style={{ marginBottom: 16 }}>
          <Footer
            inputText={inputText}
            setInputText={setInputText}
            sendMessage={handleSend}
          />
        </View>
      )}
    >
      {/* Header */}
      <View style={[styles.header, { marginTop: topInset }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={wp(6.5)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{client?.name || "Name"}</Text>
      </View>

      {/* Messages */}
      <View style={{ flex: 1, marginTop: 10 }}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchMessages}
          refreshing={refreshing}
        />
        {isTyping && (
          <View style={styles.typingContainer}>
            <CustomText
              label="Typing..."
              color="#818898"
              fontSize={12}
              marginTop={5}
              alignSelf="flex-start"
            />
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default InboxScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: wp(2.5),
  },
  headerTitle: {
    color: "#FFF",
    fontSize: hp(2.3),
    flex: 1,
    fontFamily: fonts.medium,
  },
  messageWrapper: {
    marginBottom: 10,
  },
  messageContainer: {
    maxWidth: "70%",
    padding: 14,
    borderRadius: 15,
    marginTop: 5,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primaryColor,
    borderTopRightRadius: 0,
    elevation: 1,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryColor,
    borderTopLeftRadius: 0,
    elevation: 1,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
