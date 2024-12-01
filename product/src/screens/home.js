import React, { useEffect } from "react";
import ReminderPage from "./reminder";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors } from "../styles/Theme";
import calendar from "../../assets/calendar.png";
import vet from "../../assets/vet.png";
import home from "../../assets/home.jpg";
import { auth } from "../auth/firebaseConfig";

const Home = ({ navigation }) => {
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      navigation.navigate("Login");
    }
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.welcomeCard}>
        <Image
          source={home}
          style={{
            width: "100%",
            height: 180,
            borderRadius: 20,
          }}
        />
        <View style={styles.welcomeTextGroup}>
          <Text style={styles.welcomeHeader}>
            Welcome, {currentUser.displayName}
          </Text>
          <Text style={styles.welcomeText}>See your pets</Text>
        </View>
      </View>
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
          <Text style={styles.exploreText}>Vet</Text>
        </TouchableOpacity>
      </View>
      <ReminderPage />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 80,
  },
  welcomeCard: {
    backgroundColor: "white",
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 20,
  },
  welcomeTextGroup: {
    position: "absolute",
    top: 20,
    left: 15,
    right: 15,
  },
  welcomeHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.primary,
  },
  explore: {
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  buttonBox: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "48%",
    borderRadius: 20,
  },
  exploreText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 10,
    fontWeight: "bold",
  },
  icon: {
    width: 45,
    height: 45,
    alignSelf: "center",
    marginBottom: 10,
  },
});
export default Home;
