// import React, { useState } from "react";
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   Dimensions,
// } from "react-native";
// import { MaterialIcons } from "@expo/vector-icons";
// import { colors } from "../styles/Theme";
// import { BottomNavBarStyles as styles } from "../styles/GlobalStyles";

// const { width } = Dimensions.get("window");

// const BottomNavBar = ({ onNavigate }) => {
//   const [selected, setSelected] = useState("Home");

//   const handleNavigation = (screen) => {
//     setSelected(screen);
//     onNavigate(screen);
//   };

//   const buttons = ["Home", "Calendar", "Pets", "Vet", "Profile"];
//   const selectedIndex = buttons.indexOf(selected);
//   const accentBarWidth = width / buttons.length;

//   return (
//     <View style={styles.container}>
//       <View
//         style={[
//           styles.accentBar,
//           {
//             width: accentBarWidth,
//             left: selectedIndex * accentBarWidth,
//           },
//         ]}
//       />
//       {buttons.map((button) => (
//         <TouchableOpacity
//           key={button}
//           style={styles.button}
//           onPress={() => handleNavigation(button)}
//         >
//           <MaterialIcons
//             name={getIconName(button)}
//             size={button === "Pets" ? 40 : 24}
//             color={colors.primary}
//           />
//           {button === "Pets" ? null : (
//             <Text style={styles.iconText}>{button}</Text>
//           )}
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// };

// const getIconName = (button) => {
//   switch (button) {
//     case "Home":
//       return "home";
//     case "Calendar":
//       return "event";
//     case "Pets":
//       return "pets";
//     case "Vet":
//       return "local-hospital";
//     case "Profile":
//       return "person";
//     default:
//       return "home";
//   }
// };

// export default BottomNavBar;


import React from "react";
import { View, TouchableOpacity, Text, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../styles/Theme";
import { BottomNavBarStyles as styles } from "../styles/GlobalStyles";

const { width } = Dimensions.get("window");

const BottomNavBar = ({ onNavigate, activeScreen }) => {
  // List of buttons for the Bottom Navigation Bar
  const buttons = ["Home", "Calendar", "Pets", "Vet", "Profile"];

  // Determine which button is currently selected based on the activeScreen prop
  const selectedIndex = buttons.indexOf(activeScreen);
  const accentBarWidth = width / buttons.length;

  // Handle the navigation and call the parent onNavigate function
  const handleNavigation = (screen) => {
    if (screen !== activeScreen) {
      onNavigate(screen);
    }
  };

  return (
    <View style={styles.container}>
      {/* Accent bar that highlights the currently selected tab */}
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
            size={button === "Pets" ? 40 : 24}
            color={colors.primary}
          />
          {button === "Pets" ? null : (
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
      return "home";
  }
};

export default BottomNavBar;
