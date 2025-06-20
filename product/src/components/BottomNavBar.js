import React from "react";
import { View, TouchableOpacity, Text, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../styles/Theme";
import { BottomNavBarStyles as styles } from "../styles/GlobalStyles";

const { width } = Dimensions.get("window");

const BottomNavBar = ({ navigation, onNavigate, activeScreen }) => {
  // List of buttons for the Bottom Navigation Bar
  const buttons = ["Calendar", "Booking", "ChatInbox", "Maps", "Profile"];
  const selectedIndex = buttons.indexOf(activeScreen);
  const accentBarWidth = width / buttons.length;

  // Handle the navigation and call the parent onNavigate function
  const handleNavigation = (screen) => {
    if (screen === "Maps") {
      navigation.navigate("Maps");
    } else if (screen === "ChatInbox") {
      navigation.navigate("ChatInbox");
    } else {
      if (screen !== activeScreen) {
        onNavigate(screen);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.accentBar,
          {
            width: accentBarWidth,
            left: selectedIndex * accentBarWidth,
          },
        ]}
      />
      {/* Render each button in the navigation bar */}
      {buttons.map((button) => (
        <TouchableOpacity
          key={button}
          style={styles.button}
          onPress={() => handleNavigation(button)}
        >
          <MaterialIcons
            name={getIconName(button)}
            size={button === "ChatInbox" ? 40 : 24}
            color={colors.primary}
          />
          {button === "ChatInbox" ? null : (
            <Text style={styles.iconText}>{button}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Function to map button names to MaterialIcons icons
const getIconName = (button) => {
  switch (button) {
    case "Maps":
      return "map";
    case "Calendar":
      return "event";
    case "ChatInbox":
      return "sms";
    case "Booking":
      return "local-hospital";
    case "Profile":
      return "person";
    default:
      return "home";
  }
};

export default BottomNavBar;
