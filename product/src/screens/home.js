import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} />
        <Text style={styles.title}>Welcome to My App</Text>
      </View>

      {/* Welcome Message */}
      <Text style={styles.welcomeText}>Hello, User!</Text>
      <Text style={styles.instructionText}>This is your home page.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
});

export default Home;
