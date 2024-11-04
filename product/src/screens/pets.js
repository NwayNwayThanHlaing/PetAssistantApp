// Pets.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

const Pets = ({ navigation }) => {
  const handleLogout = () => {
    // Add your logout logic here
    Alert.alert("Logout", "You have successfully logged out!");
    navigation.navigate("Login"); // Navigate back to the Login page
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Pets Page!</Text>
      <Text style={styles.subtitle}>You are now logged in.</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#ff7f50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Pets;
