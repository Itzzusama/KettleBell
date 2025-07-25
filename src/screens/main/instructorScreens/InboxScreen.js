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
import moment from "moment/moment";

const InboxScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocus = useIsFocused();
  const socket = useSocket();
  const { userData } = useSelector((state) => state.users);
  const client = route.params?.client;
  const message = route.params?.message;
  const userId = userData?._id;
  const clientId = client?.id || client?._id;
  const topInset = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Join conversation and fetch messages
  useEffect(() => {
    if (socket && clientId) {
      socket.emit("joinConversation", clientId);
      fetchMessages();
      // Listen for new messages
      socket.on("newMessage", handleNewMessage);
      // Optionally listen for typing
      socket.on("typing", handleTyping);
    }
    return () => {
      if (socket) {
        socket.off("newMessage", handleNewMessage);
        socket.off("typing", handleTyping);
      }
    };
    // eslint-disable-next-line
  }, [socket, clientId]);

  // Mark all messages as read when focused
  useEffect(() => {
    if (socket && messages.length > 0) {
      const unread = messages.filter(m => !m.read && m.sender !== userId);
      unread.forEach(msg => {
        socket.emit("markMessageRead", msg._id);
      });
    }
  }, [messages, socket, userId]);

  const fetchMessages = async () => {
    setRefreshing(true);
    try {
      const response = await GetApiRequest("msg/messages/" + clientId);
      if (response.data) {
        setMessages(response.data?.messages || []);
      }
    } catch (error) {
      console.log("errrrrrr", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNewMessage = (msg) => {
    setMessages(prev => [msg, ...prev]);
    // Optionally mark as read if message is for this user
    if (msg.sender !== userId) {
      socket.emit("markMessageRead", msg._id);
    }
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
      clientId,
      content: inputText,
      messageType: "text",
      sender: userId,
    };
    socket.emit("sendMessage", messageData, (res) => {
      if (res?.success && res.message) {
        setMessages(prev => [res.message, ...prev]);
      }
    });
    setInputText("");
  };

  // Typing indicator
  useEffect(() => {
    if (!socket || !clientId) return;
    if (inputText) {
      socket.emit("typing", { clientId, isTyping: true });
    }
    // Optionally debounce
  }, [inputText, socket, clientId]);

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
          <Footer inputText={inputText} setInputText={setInputText} sendMessage={handleSend} />
        </View>
      )}
    >
      <View style={[styles.header, { marginTop: topInset }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={wp(6.5)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{message?.client?.name || "Name"}</Text>
      </View>
      <View style={{ flex: 1, marginTop: 10 }}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item._id || item.id}
          inverted
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
        />
        {isTyping && (
          <CustomText label="Typing..." color="#818898" fontSize={12} marginTop={5} alignSelf="flex-start" />
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
    // textAlign: "center",
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
