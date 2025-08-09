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
  const client = route?.params?.client;
  const message = route?.params?.message;
  const userId = userData?._id;
  const clientId = client?.id || client?._id;
  const topInset = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
  console.log(client);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch conversation history
  const fetchMessages = async () => {
    setRefreshing(true);
    try {
      const response = await GetApiRequest("api/msg/messages/" + clientId);
      if (response?.data?.messages) {
        setMessages(response.data.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.log("Error fetching messages:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Setup socket listeners
  useEffect(() => {
    if (!isConnected || !clientId) return;

    // Join conversation
    send("joinConversation", clientId);

    // Load history
    fetchMessages();

    // Listen for new messages
    socket?.on("newMessage", ({ message }) => {
      setMessages((prev) => [message, ...prev]);
    });

    // Listen for typing
    socket?.on("userTyping", ({ userId: typingUserId, isTyping }) => {
      if (typingUserId === clientId) {
        setIsTyping(isTyping);
      }
    });

    // Mark unread messages as read
    if (messages.length > 0) {
      messages
        .filter((m) => !m.read && m.sender !== userId)
        .forEach((msg) => {
          send("markMessageRead", msg._id);
        });
    }

    return () => {
      socket?.off("newMessage");
      socket?.off("userTyping");
    };
  }, [isConnected, clientId]);

  // Emit typing status
  useEffect(() => {
    if (!isConnected || !clientId) return;
    send("typing", {
      recipientId: clientId,
      isTyping: !!inputText.trim(),
    });
  }, [inputText, isConnected, clientId]);

  // Send a message
  const handleSend = () => {
    if (!inputText.trim() || !isConnected) return;

    const messageData = {
      recipientId: clientId,
      message: inputText,
      messageType: "text",
    };

    send("sendMessage", messageData, (res) => {
      if (res?.success && res.message) {
        setMessages((prev) => [res.message, ...prev]);
      }
    });

    setInputText("");
  };

  // Render a single message bubble
  const renderMessage = ({ item }) => (
    <>
      <CustomText
        label={moment(item.createdAt).format("h:mm A")}
        color="#818898"
        fontSize={12}
        marginTop={5}
        alignSelf={item.sender === userId ? "flex-end" : "flex-start"}
      />
      <View
        style={[
          styles.messageContainer,
          item.sender === userId ? styles.userMessage : styles.otherMessage,
        ]}
      >
        <CustomText
          label={item?.content || item?.message}
          color={item.sender === userId ? COLORS.white : COLORS.black}
          lineHeight={25}
        />
      </View>
    </>
  );

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
        <Text style={styles.headerTitle}>
          {message?.client?.name || client?.name || "Name"}
        </Text>
      </View>

      {/* Messages */}
      <View style={{ flex: 1, marginTop: 10 }}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id || item.id}
          inverted
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
        />
        {isTyping && (
          <CustomText
            label="Typing..."
            color="#818898"
            fontSize={12}
            marginTop={5}
            alignSelf="flex-start"
          />
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
  messageContainer: {
    maxWidth: "70%",
    padding: 14,
    borderRadius: 15,
    marginTop: 15,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primaryColor,
    borderTopRightRadius: 0,
    elevation: 1,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#EAF5FF",
    borderTopLeftRadius: 0,
    elevation: 1,
  },
});
