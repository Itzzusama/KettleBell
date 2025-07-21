import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
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

const InboxScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocus = useIsFocused();
  const client = route.params?.client;
  const topInset = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    setRefreshing(true);
    try {
      const response = await GetApiRequest("msg/messages/" + client?.id);
      if (response.data) {
        setMessages(response.data?.messages);
      }
    } catch (error) {
      console.log("errrrrrr", error);
    } finally {
      setRefreshing(false);
    }
  };

  const sendMsg = (res) => {
    if (socket) {
      socket.emit(
        "send-message",
        {
          name: userData?.name,
          recipientId: data?.id,
          messageText: inputText,
        },

        (res) => {
          if (res?.success) {
            setMessages((prevMessages) => [res?.message, ...prevMessages]);
          } else {
            ToastMessage("Chat Error, Please Refresh the App", "error");
          }
        }
      );
      setInputText("");
    } else {
      console.log("Socket is null or not properly initialized");
    }
  };
  const renderMessage = ({ item }) => (
    <>
      <CustomText
        label={moment(item.createdAt).format("h:mm A")}
        color="#818898"
        fontSize={12}
        marginTop={5}
        alignSelf={item.sender == userId ? "flex-end" : "flex-start"}
      />
      <View
        style={[
          styles.messageContainer,
          item.sender == userId ? styles.userMessage : styles.otherMessage,
        ]}
      >
        <CustomText
          label={item?.message}
          color={item.sender == userId ? COLORS.white : COLORS.black}
          lineHeight={25}
        />
      </View>
    </>
  );

  // useEffect(() => {
  //   if (socket) {
  //     socket.on("recieved-message", (msg) => {
  //       setMessages((prevMessages) => [msg, ...prevMessages]);
  //     });
  //   }
  //   return () => {
  //     if (socket) {
  //       socket.off("recieved-message");
  //     }
  //   };
  // }, [socket]);

  // useEffect(() => {
  //   fetchMessages();
  // }, [isFocus]);

  return (
    <ScreenWrapper
      backgroundColor={COLORS.backgroundColor}
      barStyle="light-content"
      footerUnScrollable={() => (
        <Footer inputText={inputText} setInputText={setInputText} />
      )}
    >
      <View style={[styles.header, { marginTop: topInset }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={wp(6.5)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{client?.name || "Name"}</Text>
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
