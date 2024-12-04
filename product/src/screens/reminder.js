import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { colors } from "../styles/Theme";
import { fetchUserEvents } from "../actions/userActions";
import { getAuth } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const ReminderPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Events
        const eventsData = await fetchUserEvents(userId);

        // Since relatedPets already contains pet names, directly use it
        const updatedEventsData = eventsData.map((event) => {
          event.relatedPetsNames = event.relatedPets || [];
          return event;
        });

        // Filter out past events based on the date (ignoring time)
        const filteredEvents = updatedEventsData.filter((event) => {
          const eventDate = getDateOnly(getDateTime(event));
          const today = getDateOnly(new Date());
          return eventDate >= today; // Keep events from today or in the future
        });

        // Sort events by date and time
        filteredEvents.sort((a, b) => {
          const dateA = getDateTime(a);
          const dateB = getDateTime(b);
          return dateA - dateB;
        });

        setEvents(filteredEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Utility function to get the JavaScript Date from different formats
  const getDateTime = (event) => {
    let date;
    if (event.date instanceof Timestamp) {
      date = event.date.toDate(); // Convert Firestore Timestamp to JS Date
    } else if (typeof event.date === "string") {
      const [year, month, day] = event.date.split("-").map(Number);
      date = new Date(year, month - 1, day);
    }

    if (event.time && event.time instanceof Timestamp) {
      const time = event.time.toDate();
      date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    } else if (
      typeof event.time === "object" &&
      event.time.hours !== undefined
    ) {
      const { hours, minutes } = event.time;
      date.setHours(hours, minutes, 0, 0);
    }

    return date || new Date(); // Return the parsed date or the current date as a fallback
  };

  // Utility function to get only the date portion of a JavaScript Date object
  const getDateOnly = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Render each reminder item
  const renderReminderItem = (item, index) => {
    const eventTime = getDateTime(item);
    const isValidDate = eventTime && !isNaN(eventTime.getTime());

    const formattedDateAndTime = isValidDate
      ? eventTime.toLocaleString([], {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "No Date Available";

    return (
      <View
        style={[
          styles.reminderItem,
          index != 1
            ? {
                borderBottomWidth: 1,
                borderBottomColor: colors.primaryLightest,
              }
            : null,
        ]}
        key={item.id}
      >
        <Text style={styles.reminderTitle}>{item.title}</Text>
        <Text style={styles.reminderTime}>Date: {formattedDateAndTime}</Text>

        {item.relatedPetsNames && item.relatedPetsNames.length > 0 && (
          <Text style={styles.reminderNotes}>
            Pets: {item.relatedPetsNames.join(", ")}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading reminders...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      {events.length === 0 ? (
        <>
          <Text style={styles.subHeader}>Reminders</Text>
          <Text style={styles.noRemindersText}>
            No upcoming reminders. Please create reminders in the Calendar page.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.replace("Dashboard", {
                initialScreen: "Calendar",
                previousScreen: "Home",
                openAddEventModal: true,
              })
            }
          >
            <Text style={styles.buttonText}>Add Event</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.subHeader}>Upcoming Reminders</Text>
          </View>
          {events
            .slice(0, 2)
            .map((item, index) => renderReminderItem(item, index))}
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.push("Dashboard", {
                initialScreen: "Calendar",
                previousScreen: "Home",
                openAddEventModal: true,
              })
            }
          >
            <Text style={styles.buttonText}>Add Event</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    marginHorizontal: 15,
    marginTop: 2,
    borderRadius: 20,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.accent,
    marginTop: 15,
    marginBottom: 5,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.primary,
  },
  noRemindersText: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: 10,
    marginBottom: 20,
  },
  reminderItem: {
    borderColor: colors.primaryLightest,
    paddingVertical: 10,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  reminderTime: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: 5,
  },
  reminderType: {
    fontSize: 16,
    color: colors.accent,
    marginTop: 5,
  },
  reminderNotes: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: 5,
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 7,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ReminderPage;
