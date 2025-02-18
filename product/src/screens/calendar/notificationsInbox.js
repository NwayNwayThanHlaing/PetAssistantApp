import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { colors } from "../../styles/Theme";
import nothing from "../../../assets/nothing.png";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../auth/firebaseConfig";
import { fetchUserEvents } from "../../actions/userActions";
import * as Notifications from "expo-notifications";

const NotificationsInbox = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for notification clicks
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const eventId = response.notification.request.content.data.eventId;
        if (eventId) {
          navigation.navigate("Calendar", {
            screen: "EventDetails",
            params: { eventId },
          });
        }
      }
    );

    return () => subscription.remove(); // Cleanup on unmount
  }, [navigation]);

  const isWithinLastTwoWeeks = (dateString, time) => {
    if (!dateString || !time) return false;

    // Convert date and time to a JavaScript Date object
    const [year, month, day] = dateString.split("-");
    const notificationDate = new Date(
      year,
      month - 1,
      day,
      time.hours,
      time.minutes
    );

    // Get the current date and time
    const currentDate = new Date();

    // Calculate the difference in milliseconds
    const differenceInMs = currentDate - notificationDate;

    // Check if the notification is in the past and within the last two weeks (14 days)
    return differenceInMs > 0 && differenceInMs <= 14 * 24 * 60 * 60 * 1000;
  };

  const sortNotifications = (notifications) => {
    return notifications.sort((a, b) => {
      // Convert date and time to JavaScript Date objects for comparison
      const dateA = new Date(
        a.date.split("-").join("/") + " " + `${a.time.hours}:${a.time.minutes}`
      );
      const dateB = new Date(
        b.date.split("-").join("/") + " " + `${b.time.hours}:${b.time.minutes}`
      );

      // Sort in descending order (most recent first)
      return dateB - dateA;
    });
  };

  const scheduleEventNotification = async (event) => {
    const eventTime = new Date(
      event.date.split("-").join("/") +
        " " +
        `${event.time.hours}:${event.time.minutes}`
    );
    const currentTime = new Date();
    const timeDifference = eventTime - currentTime;

    if (timeDifference > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: event.title,
          body: event.notes || "Reminder for your event",
          sound: "default",
          data: { eventId: event.id }, // Include event ID for navigation
        },
        trigger: {
          date: eventTime, // Trigger at the event time
        },
      });
      console.log("Notification scheduled for:", event.title, "at", eventTime);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          throw new Error("User not logged in");
        }

        // Fetch events for the logged-in user
        const events = await fetchUserEvents(userId);

        // Filter notifications within the last two weeks
        const filteredNotifications = events.filter((event) =>
          isWithinLastTwoWeeks(event.date, event.time)
        );

        // Sort notifications by date and time
        const sortedNotifications = sortNotifications(filteredNotifications);

        // Set the filtered and sorted notifications
        setNotifications(sortedNotifications);

        // Schedule notifications for each event
        sortedNotifications.forEach((event) => {
          scheduleEventNotification(event);
        });

        console.log(
          "Notifications fetched and scheduled:",
          sortedNotifications
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
        Alert.alert(
          "Error",
          "Failed to fetch notifications. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [notifications]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Helper function to format date & time as "DD/MM/YYYY HH:MM AM/PM"
  const formatDateTime = (dateString, time) => {
    if (!dateString || !time) return "No Date Provided";

    // Convert date from "YYYY-MM-DD" to "DD/MM/YYYY"
    const parts = dateString.split("-"); // Split "YYYY-MM-DD"
    if (parts.length !== 3) return dateString; // Return original if format is incorrect
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`; // Convert to "DD/MM/YYYY"

    // Format time to "HH:MM AM/PM"
    let { hours, minutes } = time;
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 24-hour to 12-hour format
    const formattedTime = `${hours}:${minutes
      .toString()
      .padStart(2, "0")}${period}`;

    return `${formattedDate} ${formattedTime}`;
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        item.read ? styles.readNotification : styles.unreadNotification,
      ]}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        {item.notes && (
          <Text style={styles.notificationMessage}>{item.notes}</Text>
        )}
        <Text style={styles.notificationMessage}>
          {formatDateTime(item.date, item.time)}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {notifications.length === 0 ? (
          <>
            <Image
              source={nothing}
              style={{
                width: 150,
                height: 150,
                alignSelf: "center",
                marginTop: 100,
                marginBottom: 30,
              }}
            />
            <Text
              style={{
                fontSize: 18,
                color: colors.secondary,
                textAlign: "center",
              }}
            >
              No notifications found! {"\n"} You're all caught up.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.header}>Notifications</Text>
            <FlatList
              data={notifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 20,
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 20,
    color: colors.primary,
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    marginBottom: 10,
  },
  readNotification: {
    opacity: 0.7,
  },
  unreadNotification: {
    borderLeftWidth: 5,
    borderLeftColor: colors.accent,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.primaryLight,
    marginTop: 5,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    marginLeft: 10,
  },
});

export default NotificationsInbox;
