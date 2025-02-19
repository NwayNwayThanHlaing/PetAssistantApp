import React, { useState, useEffect } from "react";
import * as Font from "expo-font";
import { View, ActivityIndicator, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import MyStack from "./src/MyStack";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import font from "./assets/fonts/NerkoOne-Regular.ttf";
import { auth } from "./src/auth/firebaseConfig";
import Device from "expo-device";

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

  const loadFonts = async () => {
    await Font.loadAsync({
      "NerkoOne-Regular": font,
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();

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

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <MyStack />
    </ThemeProvider>
  );
};

export default App;
