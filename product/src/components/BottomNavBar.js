// BottomNavBar.js
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../styles/Theme";
import { BottomNavBarStyles } from "../styles/GlobalStyles";
import Pets from "../screens/pets";

const { width } = Dimensions.get("window"); // Get the screen width

const BottomNavBar = ({ onNavigate }) => {
  const [selected, setSelected] = useState("Home");

  const handleNavigation = (screen) => {
    setSelected(screen);
    onNavigate(screen);
  };

  const buttons = ["Home", "Calendar", "Pets", "Vet", "Profile"];
  const selectedIndex = buttons.indexOf(selected);
  const accentBarWidth = width / buttons.length;

  return (
    <View style={BottomNavBarStyles.container}>
      <View
        style={[
          BottomNavBarStyles.accentBar,
          {
            width: accentBarWidth,
            left: selectedIndex * accentBarWidth,
          },
        ]}
      />
      {buttons.map((button) => (
        <TouchableOpacity
          key={button}
          style={[BottomNavBarStyles.button]}
          onPress={() => handleNavigation(button)}
        >
          <MaterialIcons
            name={getIconName(button)}
            size={["Pets"].includes(button) ? 40 : 24}
            color={colors.primary}
          />
          {button === "Pets" ? null : (
            <Text style={BottomNavBarStyles.iconText}>{button}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Function to return the correct icon name based on button
const getIconName = (button) => {
  switch (button) {
    case "Home":
      return "home";
    case "Calendar":
      return "event";
    case "Pets":
      return "pets";
    case "Vet":
      return "local-hospital";
    case "Profile":
      return "person";
    default:
      return "home"; // Fallback icon
  }
};

export default BottomNavBar;
