// import React, { useState, useEffect } from "react";
// import * as Font from "expo-font";
// import { View, ActivityIndicator, Alert } from "react-native";
// import * as Notifications from "expo-notifications";
// import MyStack from "./src/MyStack";
// import { ThemeProvider } from "./src/contexts/ThemeContext";
// import font from "./assets/fonts/NerkoOne-Regular.ttf";
// import { auth } from "./src/auth/firebaseConfig";
// import Device from "expo-device";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// const App = () => {
//   const [fontsLoaded, setFontsLoaded] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
//   const [permissionsGranted, setPermissionsGranted] = useState(false);

//   const loadFonts = async () => {
//     await Font.loadAsync({
//       "NerkoOne-Regular": font,
//     });
//     setFontsLoaded(true);
//   };

//   // Request notification permissions
//   const requestPermissions = async () => {
//     if (Device.isDevice) {
//       const { status: existingStatus } =
//         await Notifications.getPermissionsAsync();
//       let finalStatus = existingStatus;

//       if (existingStatus !== "granted") {
//         const { status } = await Notifications.requestPermissionsAsync();
//         finalStatus = status;
//       }

//       setPermissionsGranted(finalStatus === "granted");

//       if (finalStatus !== "granted") {
//         Alert.alert(
//           "Permission Required",
//           "Please enable notifications in your app settings.",
//           [
//             {
//               text: "Open Settings",
//               onPress: () => {
//                 Linking.openSettings();
//               },
//             },
//             {
//               text: "Cancel",
//               style: "cancel",
//             },
//           ]
//         );
//       }
//     } else {
//       console.log("This is not a device");
//     }
//   };

//   useEffect(() => {
//     loadFonts();
//     requestPermissions();

//     // Check authentication status and fetch userId
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setUserId(user.uid); // Set userId if authenticated
//         setIsLoggedIn(true); // Set login status to true
//         console.log("User authenticated, userId:", user.uid);
//       } else {
//         setUserId(null);
//         setIsLoggedIn(false); // Set login status to false
//         console.log("No user is logged in");
//       }
//     });

//     // Clean up listener on unmount
//     return () => unsubscribe();
//   }, []);

//   if (!fontsLoaded) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <ThemeProvider>
//       <MyStack />
//     </ThemeProvider>
//   );
// };

// export default App;

import React, { useState, useEffect } from "react";
import * as Font from "expo-font";
import { View, ActivityIndicator, Alert, Linking } from "react-native";
import * as Notifications from "expo-notifications";
import MyStack from "./src/MyStack";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import font from "./assets/fonts/NerkoOne-Regular.ttf";
import { auth } from "./src/auth/firebaseConfig";
import Device from "expo-device";

// Set the notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Load custom fonts
  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        "NerkoOne-Regular": font,
      });
      setFontsLoaded(true);
    } catch (error) {
      console.error("Error loading fonts:", error);
      Alert.alert("Error", "Failed to load fonts. Please restart the app.");
    }
  };

  // Request notification permissions
  const requestPermissions = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionsGranted(finalStatus === "granted");

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your app settings.",
          [
            {
              text: "Open Settings",
              onPress: () => {
                Linking.openSettings();
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      }
    } else {
      console.log("This is not a device");
    }
  };

  useEffect(() => {
    loadFonts();
    requestPermissions(); // Request notification permissions when the app starts

    // Check authentication status and fetch userId
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Set userId if authenticated
        setIsLoggedIn(true); // Set login status to true
        console.log("User authenticated, userId:", user.uid);
      } else {
        setUserId(null);
        setIsLoggedIn(false); // Set login status to false
        console.log("No user is logged in");
      }
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  // Show a loading indicator while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      {/* Pass userId and isLoggedIn to MyStack */}
      <MyStack userId={userId} isLoggedIn={isLoggedIn} />
    </ThemeProvider>
  );
};

export default App;
