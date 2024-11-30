import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import AppBar from "../components/AppBar";
import BottomNavBar from "../components/BottomNavBar";
import Home from "./home";
import Calendar from "./calendar/calendar";
import Pets from "./pets/pets";
import Vet from "./pets/vet";
import Profile from "./profile";

const Dashboard = ({ navigation, route }) => {
  const { initialScreen } = route.params || {}; // Get the initialScreen parameter from navigation
  const [activeScreen, setActiveScreen] = useState(initialScreen || "Home"); // Set initial state

  // Update the activeScreen when initialScreen changes
  useEffect(() => {
    if (initialScreen) {
      setActiveScreen(initialScreen);
    }
  }, [initialScreen]);

  // Function to handle screen changes
  const handleNavigation = (screen) => {
    setActiveScreen(screen);
  };

  // Render the appropriate screen based on activeScreen state
  const renderScreen = () => {
    switch (activeScreen) {
      case "Home":
        return <Home navigation={navigation} />;
      case "Calendar":
        return <Calendar navigation={navigation} />;
      case "Pets":
        return <Pets navigation={navigation} />;
      case "Vet":
        return <Vet navigation={navigation} />;
      case "Profile":
        return <Profile navigation={navigation} />;
      default:
        return <Home navigation={navigation} />;
    }
  };

  return (
    <View style={styles.container}>
      <AppBar
        title={activeScreen}
        onLogout={() => navigation.navigate("Login")}
      />
      <View style={styles.content}>{renderScreen()}</View>
      <BottomNavBar
        navigation={navigation}
        activeScreen={activeScreen}
        onNavigate={handleNavigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
});

export default Dashboard;
