import React, { useState, useEffect } from "react";
import MyStack from "./src/MyStack";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { auth } from "./src/auth/firebaseConfig";
import * as Notifications from "expo-notifications";
import { collection, query, onSnapshot } from "firebase/firestore";
import { firestore } from "./src/auth/firebaseConfig";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const App = () => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionsGranted(status === "granted");
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    // Check authentication status and fetch userId
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Set userId if authenticated
        setIsLoggedIn(true); // Set login status to true
        //console.log("User authenticated, userId:", user.uid);
      } else {
        setUserId(null);
        setIsLoggedIn(false); // Set login status to false
        //console.log("No user is logged in");
      }
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Reference to the user's events collection
    const eventsRef = collection(firestore, "users", userId, "events");
    const eventsQuery = query(eventsRef);

    // Real-time listener for Firestore changes
    const unsubscribe = onSnapshot(eventsQuery, (querySnapshot) => {
      const events = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(events); // Update state with new events
    });

    return () => unsubscribe(); // Cleanup listener when component unmounts
  }, [userId]); // Only runs when `userId` changes

  // Schedule notifications when the component mounts
  useEffect(() => {
    if (permissionsGranted) {
      checkAllNotifications();
    }
  }, [permissionsGranted, notifications]);

  const scheduleNoti = async (event) => {
    if (!permissionsGranted) {
      //console.log("Permissions not granted");
      return;
    }

    // Parse the event date and time
    const [year, month, day] = event.date.split("-");
    const eventDate = new Date(
      year,
      month - 1,
      day,
      event.time.hours,
      event.time.minutes
    );

    // Check if the current date and time match the event's date and time
    if (eventDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "PurrNote",
          body: `Reminder: ${event.title}`,
          sound: "default",
        },
        trigger: {
          type: "date",
          date: eventDate,
        }, // Schedule for the event date and time
      });
    }
  };

  // Function to check all events in the notifications list
  const checkAllNotifications = async () => {
    // Clear all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const event of notifications) {
      await scheduleNoti(event);
    }
  };

  return (
    <ThemeProvider>
      <MyStack />
    </ThemeProvider>
  );
};

export default App;
