import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import ScreenWrapper from "../../../components/ScreenWrapper";
import { COLORS } from "../../../utils/COLORS";
import Footer from "./molecules/Footer";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import moment from "moment/moment";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Modal from "react-native-modal";
import fonts from "../../../assets/fonts";
import { GetApiRequest } from "../../../services/api";
import { useIsFocused } from "@react-navigation/native";
import { useSocket } from "../../../utils/SocketProvider";
import { useSelector } from "react-redux";
import CustomText from "../../../components/CustomText";

const InboxScreen = ({ route }) => {
  const flatListRef = useRef();
  const navigation = useNavigation();
  const isFocus = useIsFocused();
  const socket = useSocket();
  const insets = useSafeAreaInsets();
  const { userData } = useSelector((state) => state.users);
  const client = route.params?.client;
  const userId = userData?._id;
  const clientId = client?.id || client?._id;
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const topInset = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [msgType, setMsgType] = useState("text");
  const [url, setUrl] = useState("");

  useEffect(() => {
    flatListRef?.current?.scrollToEnd({ animated: true });
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => keyBoardShow()
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => keyBoardHide()
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const keyBoardShow = () => {
    setIsKeyboardVisible(true);
    setTimeout(() => {
      flatListRef?.current.scrollToEnd({ animated: true });
    }, 200);
  };

  const keyBoardHide = () => {
    setIsKeyboardVisible(false);
    setTimeout(() => {
      flatListRef?.current.scrollToEnd({ animated: true });
    }, 200);
  };

  useEffect(() => {
    if (clientId) {
      fetchMessages();
    }

    if (socket && clientId) {
      socket.emit("joinConversation", clientId);
      socket.on("newMessage", handleNewMessage);
      socket.on("error", handleError);
    }

    return () => {
      if (socket) {
        socket.off("newMessage", handleNewMessage);
        socket.off("error", handleError);
      }
    };
  }, [socket, clientId]);

  useEffect(() => {
    if (isFocus && socket && messages.length > 0) {
      const unread = messages.filter((m) => {
        const messageSenderId =
          typeof m.sender === "object" ? m.sender._id : m.sender;
        return !m.readBy?.includes(userId) && messageSenderId !== userId;
      });

      unread.forEach((msg) => {
        socket.emit("markMessageRead", msg._id) || msg?.message?._id;
      });
    }
  }, [isFocus, messages, socket, userId]);

  const fetchMessages = async () => {
    setRefreshing(true);
    try {
      const response = await GetApiRequest(
        `api/chat/conversations/${clientId}/messages`
      );

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
    // setMessages((prev) => [msg?.message, ...prev]);

    const messageSenderId =
      typeof msg.sender === "object" ? msg.sender._id : msg.sender;
    if (messageSenderId !== userId) {
      socket.emit("markMessageRead", msg._id);
    }
  };

  const handleError = (error) => {
    console.log("Socket error:", error);
  };

  const handleSend = () => {
    if ((!inputText.trim() && !url) || !socket) return;

    const messageData = {
      recipientId: clientId,
      message: msgType === "image" ? url : inputText,
      messageType: msgType,
    };

    setInputText("");
    setUrl("");
    setMsgType("text");

    socket.emit("sendMessage", messageData, (res) => {
      if (res.message) {
        setMessages((prev) => {
          return [...prev, res.message];
        });
      }
    });
  };

  const isUserMessage = (message) => {
    const messageSenderId =
      typeof message.sender === "object" ? message.sender._id : message.sender;
    return messageSenderId === userId;
  };
  const renderDateLabel = (date) => {
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "day").startOf("day");
    const messageDate = moment(date).startOf("day");

    if (messageDate.isSame(today, "day")) return "Today";
    if (messageDate.isSame(yesterday, "day")) return "Yesterday";
    return messageDate.format("MM/DD/YYYY");
  };

  const getMessageContent = (message) => {
    let content = message?.content || message?.message || "";

    if (typeof content === "object") {
      try {
        return JSON.stringify(content);
      } catch {
        return "";
      }
    }

    return String(content);
  };

  const renderMessage = ({ item, index }) => {
    try {
      const isUser = isUserMessage(item);
      const messageContent = getMessageContent(item);
      const messageTime = moment(item.createdAt).format("h:mm A");

      let showDate = false;
      if (index === 0) {
        showDate = true;
      } else {
        const prev = messages[index - 1];
        if (!moment(item.createdAt).isSame(prev.createdAt, "day")) {
          showDate = true;
        }
      }

      return (
        <View key={item._id || item.id} style={styles.messageWrapper}>
          {showDate && (
            <View style={styles.dateSeparator}>
              <Text style={styles.dateText}>
                {renderDateLabel(item.createdAt)}
              </Text>
            </View>
          )}
          <CustomText
            label={messageTime}
            color="#818898"
            fontSize={12}
            marginTop={5}
            alignSelf={isUser ? "flex-end" : "flex-start"}
          />
          <View
            style={[
              styles.messageContainer,
              isUser ? styles.userMessage : styles.otherMessage,
            ]}
          >
            {item?.messageType == "image" ? (
              <TouchableOpacity
                onPress={() => {
                  setSelectedImage(messageContent);
                  setIsImageModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: messageContent }}
                  style={{ width: 80, height: 80, borderRadius: 10 }}
                />
              </TouchableOpacity>
            ) : (
              <CustomText
                label={messageContent}
                color={isUser ? COLORS.black1 : COLORS.white}
                lineHeight={25}
              />
            )}
          </View>
        </View>
      );
    } catch (error) {
      console.error("Error rendering message:", error, item);
      return null;
    }
  };

  return (
    <ScreenWrapper
      backgroundColor={COLORS.backgroundColor}
      paddingHorizontal={15}
      barStyle="light-content"
      headerUnScrollable={() => (
        <View style={[styles.header, { marginTop: topInset }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={wp(6.5)} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{client?.name || "Message"}</Text>
        </View>
      )}
      scrollEnabled={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-end",
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchMessages}
          refreshing={refreshing}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {url ? (
          <View style={styles.previewWrapper}>
            <Image source={{ uri: url }} style={styles.previewImage} />
          </View>
        ) : null}

        <View
          style={{
            marginBottom: isKeyboardVisible
              ? insets.bottom + 40
              : insets.bottom,
          }}
        >
          <Footer
            inputText={inputText}
            setInputText={setInputText}
            setMsgType={setMsgType}
            setUrl={setUrl}
            handleSend={handleSend}
          />
        </View>
      </KeyboardAvoidingView>
      <Modal
        isVisible={isImageModalVisible}
        onBackdropPress={() => setIsImageModalVisible(false)}
        style={{ margin: 0 }}
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {/* Close Button */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 40,
              right: 20,
              zIndex: 2,
            }}
            onPress={() => setIsImageModalVisible(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>

          {/* Full Screen Image */}
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={{
                flex: 1,
                resizeMode: "contain",
                width: "100%",
                height: "100%",
              }}
            />
          ) : null}
        </View>
      </Modal>
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
  dateSeparator: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginVertical: 8,
    backgroundColor: "#242427",
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: "#33373B",
  },
  dateText: {
    color: COLORS.primaryColor,
    fontSize: 14,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  previewWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    elevation: 4,
    alignItems: "flex-end",
    alignSelf: "flex-end",
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
});
