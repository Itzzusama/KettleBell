import React from "react";
import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";

import fonts from "../../../../assets/fonts";
import { COLORS } from "../../../../utils/COLORS";
import { Icons } from "../../../../assets/icons";

const Footer = ({ inputText, setInputText, sendMessage = () => "" }) => {
  return (
    <View style={[styles.mainContainer]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Write Your Message"
          placeholderTextColor={COLORS.gray}
          value={inputText}
          multiline
          textAlignVertical="top"
          onChangeText={(text) => setInputText(text)}
        />
      </View>
      <TouchableOpacity onPress={sendMessage}>
        <Icons
          name={"send"}
          family={"Feather"}
          color={COLORS.primaryColor}
          size={22}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primaryColor,
    paddingHorizontal: 12,
    width: "95%",
    alignSelf: "center",
    backgroundColor: COLORS.bgGray,
    height: 56,
    marginBottom: 12,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: COLORS.bgGray,
    borderRadius: 50,
    justifyContent: "center",
  },
  input: {
    padding: 0,
    margin: 0,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: COLORS.black,
  },
});
