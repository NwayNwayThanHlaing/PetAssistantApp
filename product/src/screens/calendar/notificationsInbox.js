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
import {
  formatDateTime,
  isWithinLastTwoWeeks,
  sortNotifications,
} from "../../actions/utils";

const NotificationsInbox = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;

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
