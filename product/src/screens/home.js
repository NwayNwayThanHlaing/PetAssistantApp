import React, { useEffect, useState } from "react";
import ReminderPage from "./reminder";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { colors } from "../styles/Theme";
import calendar from "../../assets/calendar.png";
import vet from "../../assets/vet.png";
import home from "../../assets/home.jpg";
import { auth } from "../auth/firebaseConfig";
import { firestore } from "../auth/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const Home = ({ navigation }) => {
  const currentUser = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    // Redirect to Login if no current user
    if (!currentUser) {
      navigation.navigate("Login");
    }
  }, [currentUser, navigation]);

  // Fetch current user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(firestore, "users", currentUser.uid); // Reference to the document
        const userDoc = await getDoc(userDocRef); // Fetch the document

        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log("No such user document found!");
          Alert.alert("Error", "User data not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to fetch user data.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.welcomeCard}>
        {loading ? ( // Show loading indicator while fetching data
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
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
                Hi, {userData?.name || "User"}!
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  navigation.push("Dashboard", {
                    initialScreen: "Pets",
                    previousScreen: "Home",
                  })
                }
              >
                <Text style={styles.buttonText}>My Pets</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
              initialScreen: "Booking",
              previousScreen: "Home",
            })
          }
        >
          <Image source={vet} style={styles.icon} />
          <Text style={styles.exploreText}>Booking</Text>
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
    marginVertical: 15,
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
    marginTop: 20,
    marginLeft: 3,
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
    padding: 18,
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
    width: 50,
    height: 50,
    alignSelf: "center",
  },
  button: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Home;
