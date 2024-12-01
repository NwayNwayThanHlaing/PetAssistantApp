import React from "react";
import ReminderPage from "./reminder";
import { View, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
import { colors } from "../styles/Theme";
import { color } from "@cloudinary/url-gen/qualifiers/background";
import calendar from "../../assets/calendar.png";
import vet from "../../assets/vet.png";

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.exploreHeader}>Explore More</Text>
      <View style={styles.explore}>
        <TouchableOpacity
          style={styles.buttonBox}
          onPress={() =>
            navigation.push("Dashboard", {
              initialScreen: "Calendar",
              previousScreen: "Home",
            })
          }
        >
          <Image source={calendar} style={styles.icon} />
          <Text style={styles.exploreText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonBox}
          onPress={() =>
            navigation.push("Dashboard", {
              initialScreen: "Vet",
              previousScreen: "Home",
            })
          }
        >
          <Image source={vet} style={styles.icon} />
          <Text style={styles.exploreText}>Appointments</Text>
        </TouchableOpacity>
      </View>
      <ReminderPage />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  explore: {
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  buttonBox: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    padding: 20,
    paddingBottom: 25,
    width: "48%",
    borderRadius: 20,
  },
  exploreHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginHorizontal: 20,
    marginVertical: 15,
    textAlign: "center",
  },
  exploreText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: "center",
    fontWeight: "bold",
  },
  icon: {
    width: 60,
    height: 60,
    alignSelf: "center",
    marginVertical: 10,
    marginBottom: 15,
  },
});
export default Home;
