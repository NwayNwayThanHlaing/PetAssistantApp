// Dashboard.js
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import AppBar from "../components/AppBar"; // Import the AppBar component
import BottomNavBar from "../components/BottomNavBar"; // Import the BottomNavBar component
import Home from "./home"; // Import other screens
import Calendar from "./calendar"; // Import the Calendar screen
import Pets from "./pets"; // Import the Pets screen
import Vet from "./vet"; // Import the Vets screen
import Profile from "./profile"; // Import the UserProfile screen

const Dashboard = ({ navigation }) => {
  const [activeScreen, setActiveScreen] = useState("Home"); // State to manage active screen

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
      <BottomNavBar navigation={navigation} onNavigate={handleNavigation} />
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
