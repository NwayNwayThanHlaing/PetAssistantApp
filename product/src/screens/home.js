import React from "react";
import ReminderPage from "./reminder";
import { View, StyleSheet } from "react-native";

const Home = () => {
  return (
    <View style={styles.container}>
      <ReminderPage />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
export default Home;
