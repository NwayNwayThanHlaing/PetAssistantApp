import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { colors } from "../../styles/Theme";
import nothing from "../../../assets/nothing.png";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../auth/firebaseConfig";
import {
  fetchUserEvents,
  updateEventReadStatus,
} from "../../actions/userActions";
import * as Notifications from "expo-notifications";
import { MaterialIcons } from "@expo/vector-icons";

const NotificationsInbox = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;

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
    const currentDate = new Date();
    const differenceInMs = currentDate - notificationDate; // calculate difference in milliseconds

    // Check if the notification is in the past and within the last two weeks
    return differenceInMs > 0 && differenceInMs <= 14 * 24 * 60 * 60 * 1000;
  };

  const sortNotifications = (notifications) => {
    return notifications.sort((a, b) => {
      // Convert date and time to JavaScript Date objects for comparison
      const dateA = new Date(
        `${a.date}T${a.time.hours.toString().padStart(2, "0")}:
         ${a.time.minutes.toString().padStart(2, "0")}: 00`
      );
      const dateB = new Date(
        `${b.date}T${b.time.hours.toString().padStart(2, "0")}:
         ${b.time.minutes.toString().padStart(2, "0")}: 00`
      );

      return dateB - dateA; // Sort in descending order
    });
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
  }, [userId]);

  // Listen for notification clicks
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const eventId = response.notification.request.content.data.eventId;
        if (eventId) {
          await markNotificationAsRead(eventId);
        }
      }
    );
    return () => subscription.remove();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Mark notification as read when clicked
  const markNotificationAsRead = async (eventId) => {
    try {
      // Update the local state first for instant UI change
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === eventId
            ? { ...notification, read: true }
            : notification
        )
      );
      // Update Firestore field
      await updateEventReadStatus(userId, eventId, true);
    } catch (error) {
      console.error("Error updating read status:", error);
    }
  };

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
      onPress={async () => {
        markNotificationAsRead(item.id);
        // Navigate to Calendar showing the event
        navigation.push("Dashboard", {
          initialScreen: "Calendar",
          previousScreen: "Notifications",
          selectedDate: item.date,
        });
      }}
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
    <SafeAreaView style={styles.container}>
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
          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons
              name="arrow-back-ios"
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Text style={styles.header}>Notifications</Text>
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
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
    paddingHorizontal: 10,
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 20,
    color: colors.primary,
  },
  listContainer: {
    paddingBottom: 5,
    paddingHorizontal: 10,
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
    borderWidth: 1,
    borderColor: colors.primaryLightest,
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
  back: {
    paddingLeft: 15,
    paddingVertical: 5,
  },
});

export default NotificationsInbox;
