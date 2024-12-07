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

    // Query for events that are today or tomorrow (string comparison works for YYYY-MM-DD format)
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

    // console.log("Upcoming events fetched:", events);

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

      // If the event is within the next 10 minutes, send a notification
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
  const [userId, setUserId] = useState(null); // State for userId

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
        console.log("User authenticated, userId:", user.uid); // Log the authenticated userId
      } else {
        console.log("No user is logged in");
      }
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // If userId is available, start checking for upcoming events
    if (userId) {
      const interval = setInterval(() => {
        getUpcomingEvents(userId); // Fetch events and send notifications
      }, 1000); // 10seconds 60000 ms = 1 minute

      // Clear the interval when the component is unmounted
      return () => clearInterval(interval);
    }
  }, [userId]); // Re-run the effect when userId changes

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
