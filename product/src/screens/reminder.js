import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { colors } from "../styles/Theme";
import {
  fetchUserEvents,
  fetchUserVetAppointments,
} from "../actions/userActions";
import { getAuth } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const ReminderPage = () => {
  const navigation = useNavigation();

  const [events, setEvents] = useState([]);
  const [vetAppointments, setVetAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  // Fetch all events and vet appointments for a user
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

        // Sort events by date and time
        updatedEventsData.sort((a, b) => {
          const dateA = getDateTime(a);
          const dateB = getDateTime(b);
          return dateA - dateB;
        });

        setEvents(updatedEventsData);

        // Fetch Vet Appointments
        const vetData = await fetchUserVetAppointments(userId);

        // Sort vet appointments by date and time
        vetData.sort((a, b) => {
          const dateA = getDateTime(a);
          const dateB = getDateTime(b);
          return dateA - dateB;
        });

        setVetAppointments(vetData);
      } catch (error) {
        console.error("Failed to fetch events or vet appointments:", error);
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

  const renderReminderItem = (item) => {
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
      <View style={styles.reminderItem} key={item.id}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.reminderTitle}>
            {item.type === "vet" ? "Vet Appointment" : item.title}
          </Text>
          <Text style={styles.reminderTime}>{formattedDateAndTime}</Text>
        </View>
        {item.type === "vet" && item.petName && (
          <>
            <Text style={styles.reminderType}>Vet: {item.vetName}</Text>
            <Text style={styles.reminderNotes}>Pet: {item.petName}</Text>
          </>
        )}
        {item.relatedPetsNames && item.relatedPetsNames.length > 0 && (
          <Text style={styles.reminderNotes}>
            Pets: {item.relatedPetsNames.join(", ")}
          </Text>
        )}
        {item.notes && (
          <Text style={styles.reminderNotes}>
            Note: {item.notes.replace(/\n{2,}/g, "\n").trim()}
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
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Upcoming Reminders</Text>
      {events.length === 0 && vetAppointments.length === 0 ? (
        <Text style={styles.noRemindersText}>No upcoming reminders.</Text>
      ) : (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.subHeader}>Events</Text>

            {events.length > 3 && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Dashboard", { screen: "CalendarPage" })
                }
              >
                <Text style={styles.showAll}>Show All</Text>
              </TouchableOpacity>
            )}
          </View>
          {events.slice(0, 3).map((item) => renderReminderItem(item))}
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.subHeader}>Vet Appointments</Text>

            {vetAppointments.length > 3 && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Dashboard", { screen: "Vet" })
                }
              >
                <Text style={styles.showAll}>Show All</Text>
              </TouchableOpacity>
            )}
          </View>
          {vetAppointments.slice(0, 3).map((item) => renderReminderItem(item))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.accent,
    marginTop: 20,
    marginBottom: 10,
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
    fontSize: 18,
    color: colors.secondary,
    textAlign: "center",
    marginTop: 20,
  },
  reminderItem: {
    backgroundColor: colors.primaryLightest,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
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
    fontSize: 14,
    color: colors.accent,
    marginTop: 5,
  },
  reminderNotes: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 5,
  },
  showAll: {
    color: colors.accent,
    textDecorationLine: "underline",
    fontSize: 16,
  },
});

export default ReminderPage;
