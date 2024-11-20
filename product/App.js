import React, { useState, useEffect, useRef } from "react";
import * as Font from "expo-font";
import { View, ActivityIndicator, Platform } from "react-native";
import MyStack from "./src/MyStack";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import font from "./assets/fonts/NerkoOne-Regular.ttf";

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();

  // Function to load custom fonts
  const loadFonts = async () => {
    await Font.loadAsync({
      "NerkoOne-Regular": font,
    });
    setFontsLoaded(true);
  };

  // Function to register for push notifications
  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
    setExpoPushToken(token);
    return token;
  };

  useEffect(() => {
    // Load fonts
    loadFonts();

    // Register for push notifications
    registerForPushNotificationsAsync();

    // Set up listeners for notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received:", response);
      });

    // Cleanup listeners on unmount
    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
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
