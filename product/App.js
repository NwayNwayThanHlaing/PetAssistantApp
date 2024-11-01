import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, Nway. This is Expo with Firebase!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  text: {
    fontSize: 24,
    color: "#fff",
  },
});
