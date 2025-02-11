import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import AppBar from "../components/AppBar";
import BottomNavBar from "../components/BottomNavBar";
import Home from "./home";
import Calendar from "./calendar/calendar";
import Pets from "./pets/pets";
import Booking from "./pets/booking";
import Profile from "./profile";

const Dashboard = ({ navigation, route }) => {
  const { initialScreen } = route.params || {};
  const [activeScreen, setActiveScreen] = useState(initialScreen || "Home");

  // Update the activeScreen when the initialScreen changes
  useEffect(() => {
    if (initialScreen) {
      setActiveScreen(initialScreen);
    }
  }, [initialScreen]);

  const handleNavigation = (screen) => {
    setActiveScreen(screen);
  };

  // Render the active screen dynamically
  const renderScreen = () => {
    switch (activeScreen) {
      case "Home":
        return <Home navigation={navigation} />;
      case "Calendar":
        return <Calendar navigation={navigation} />;
      case "Pets":
        return <Pets navigation={navigation} />;
      case "Booking":
        return <Booking navigation={navigation} />;
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
      {/* Render the selected screen */}
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
