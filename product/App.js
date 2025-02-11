import React, { useState, useEffect } from "react";
import * as Font from "expo-font";
import { View, ActivityIndicator, Alert } from "react-native";
import MyStack from "./src/MyStack";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import font from "./assets/fonts/NerkoOne-Regular.ttf";
import registerNNPushToken from "native-notify";
import { auth, firestore } from "./src/auth/firebaseConfig";
import axios from "axios";
import { collection, getDocs, query, where } from "firebase/firestore";

// Function to send push notification via Native Notify API
const sendPushNotification = async (userId, eventName) => {
  try {
    console.log("Sending push notification to subId:", userId);
    const response = await axios.post(
      "https://app.nativenotify.com/api/indie/notification",
      {
        subId: userId,
        appId: 25248,
        appToken: "wtOK6Mg9wWTJpjgjr1qH0v",
        title: `Reminder: ${eventName}`,
        message: `Time for the task "${eventName}".`,
      }
    );
    console.log("Push notification sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

const getUpcomingEvents = async (userId) => {
  try {
    const currentTime = new Date();

    // Get today's date (YYYY-MM-DD)
    const currentDateOnly = currentTime.toISOString().split("T")[0];

    // Calculate tomorrow's date (YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(currentTime.getDate() + 1);
    const tomorrowDateOnly = tomorrow.toISOString().split("T")[0];
    const eventsRef = collection(firestore, `users/${userId}/events`);

    // Query for events that are today or tomorrow (string comparison)
    const q = query(
      eventsRef,
      where("date", ">=", currentDateOnly),
      where("date", "<=", tomorrowDateOnly)
    );

    const querySnapshot = await getDocs(q);

    const events = [];
    querySnapshot.forEach((doc) => {
      const eventData = doc.data();
      events.push({ id: doc.id, ...eventData });
    });

    // Log events to check
    if (events.length === 0) {
      console.log("No upcoming events found for user:", userId);
    }

    events.forEach((event) => {
      const { date, time, title } = event;

      // Create a full event timestamp by combining date and time
      const eventDate = new Date(
        `${date}T${String(time.hours).padStart(2, "0")}:${String(
          time.minutes
        ).padStart(2, "0")}:00`
      );

      // Compare event timestamp with current time
      const timeDifference = eventDate - currentTime;

      // If the event is within the next 1 second, send a notification
      if (timeDifference <= 1000 && timeDifference > 0) {
        console.log("Sending notification for event:", title);
        sendPushNotification(userId, title);
      }
    });
  } catch (error) {
    console.error("Error fetching user events: ", error);
    Alert.alert("Error fetching events", error.message);
  }
};

const App = () => {
  // Register push token for Native Notify
  registerNNPushToken(25248, "wtOK6Mg9wWTJpjgjr1qH0v");

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status

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

  useEffect(() => {
    let interval;

    if (isLoggedIn && userId) {
      // Start event checking when logged in
      interval = setInterval(() => {
        getUpcomingEvents(userId);
      }, 1000); // 1 second or 1000 milliseconds interval
    }

    // Cleanup the interval when user logs out or when the component unmounts
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoggedIn, userId]); // Re-run the effect when isLoggedIn or userId changes

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
