// HealthNote.js
import React from "react";
import { Text, View, Linking, StyleSheet } from "react-native";
import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

export default function HealthNote({
  explanation,
  sources = [], // array of { label: string, url: string }
  disclaimer,
}) {
  return (
    <View style={{ marginTop: 12 }}>
      {explanation && <Text style={styles.noteText}>{explanation}</Text>}

      {sources.length > 0 && (
        <>
          <Text style={[styles.noteText, styles.sectionHeader]}>Sources</Text>
          {sources.map((s, index) => (
            <Text key={index} style={styles.noteText}>
              • {s.label}:{" "}
              <Text
                style={styles.linkText}
                onPress={() => Linking.openURL(s.url)}
              >
                View
              </Text>
            </Text>
          ))}
        </>
      )}

      {disclaimer && (
        <Text style={[styles.noteText, styles.disclaimer]}>{disclaimer}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  noteText: {
    fontSize: 13,
    color: "#AFAFAF",
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
  sectionHeader: {
    marginTop: 8,
    fontWeight: "600",
    color: "#FFF",
  },
  linkText: {
    color: COLORS.primaryColor || "#FEC635",
    textDecorationLine: "underline",
  },
  disclaimer: {
    marginTop: 8,
    fontStyle: "italic",
    lineHeight: 20,
  },
});
