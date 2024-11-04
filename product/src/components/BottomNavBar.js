// // BottomNavBar.js
// import React, { useState } from "react";
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   StyleSheet,
//   Dimensions,
//   SafeAreaView,
// } from "react-native";
// import { MaterialIcons } from "@expo/vector-icons";
// import { colors } from "../styles/Theme";
// import { BottomNavBarStyles } from "../styles/GlobalStyles";

// const { width } = Dimensions.get("window"); // Get the screen width

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
//     <SafeAreaView style={BottomNavBarStyles.safeArea}>
//       <View style={BottomNavBarStyles.container}>
//         <View
//           style={[
//             BottomNavBarStyles.accentBar,
//             {
//               width: accentBarWidth,
//               left: selectedIndex * accentBarWidth,
//             },
//           ]}
//         />
//         {buttons.map((button) => (
//           <TouchableOpacity
//             key={button}
//             style={[BottomNavBarStyles.button]}
//             onPress={() => handleNavigation(button)}
//           >
//             <MaterialIcons
//               name={getIconName(button)}
//               size={["Pets"].includes(button) ? 40 : 24}
//               color={colors.primary}
//             />
//             {button === "Pets" ? null : (
//               <Text style={BottomNavBarStyles.iconText}>{button}</Text>
//             )}
//           </TouchableOpacity>
//         ))}
//       </View>
//     </SafeAreaView>
//   );
// };

// // Function to return the correct icon name based on button
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
//       return "home"; // Fallback icon
//   }
// };

// export default BottomNavBar;
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  SafeAreaView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../styles/Theme";
import { BottomNavBarStyles as styles } from "../styles/GlobalStyles";
import { BackgroundColor } from "@cloudinary/url-gen/actions/background/actions/BackgroundColor";

const { width } = Dimensions.get("window");

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
