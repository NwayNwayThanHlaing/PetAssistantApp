import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { colors } from "../styles/Theme";
import {
  fetchUserEvents,
  fetchUserVetAppointments,
} from "../actions/userActions";
import { getAuth } from "firebase/auth";
import { Timestamp, doc, getDoc } from "firebase/firestore";
import { firestore } from "../auth/firebaseConfig";

const ReminderPage = () => {
  const [events, setEvents] = useState([]);
  const [vetAppointments, setVetAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  console.log("Current User ID:", userId); // Debug Log

  // Fetch all events and vet appointments for a user
  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Events
        const eventsData = await fetchUserEvents(userId);

        // Fetch related pets for events
        const updatedEventsData = await Promise.all(
          eventsData.map(async (event) => {
            if (event.relatedPets && event.relatedPets.length > 0) {
              const petNames = await Promise.all(
                event.relatedPets.map(async (petId) => {
                  try {
                    const petDocRef = doc(
                      firestore,
                      "users",
                      userId,
                      "pets",
                      petId
                    );
                    const petDoc = await getDoc(petDocRef);
                    if (petDoc.exists()) {
                      return petDoc.data().name;
                    } else {
                      console.warn(`Pet with ID/Name "${petId}" not found.`);
                      return petId; // Display petId as fallback, assuming it could be the pet name.
                    }
                  } catch (error) {
                    console.error("Error fetching pet name: ", error);
                    return "Unknown pet";
                  }
                })
              );
              event.relatedPetsNames = petNames;
            } else {
              event.relatedPetsNames = [];
            }
            return event;
          })
        );
        setEvents(updatedEventsData);

        // Fetch Vet Appointments
        const vetData = await fetchUserVetAppointments(userId);
        console.log("Fetched Vet Data:", vetData); // Debug Log
        setVetAppointments(vetData);
      } catch (error) {
        console.error("Failed to fetch events or vet appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Utility function to parse Firestore date fields
  const getDateFromFirestoreField = (timeField) => {
    if (timeField instanceof Timestamp) {
      return timeField.toDate(); // Convert Firestore Timestamp to JavaScript Date
    } else if (typeof timeField === "string" || timeField instanceof Date) {
      return new Date(timeField); // Handle string or Date type
    } else {
      console.warn("Invalid date field detected:", timeField);
      return null; // Handle invalid or missing date field
    }
  };

  // Combine and sort events and vet appointments
  const combinedReminders = [...events, ...vetAppointments].sort((a, b) => {
    const dateA = getDateFromFirestoreField(a.time);
    const dateB = getDateFromFirestoreField(b.time);
    return dateA - dateB;
  });
  console.log("Combined Reminders:", combinedReminders); // Debug Log

  const renderReminderItem = (item) => {
    const eventTime = getDateFromFirestoreField(item.time);
    const isValidDate = eventTime && !isNaN(eventTime.getTime());

    return (
      <View style={styles.reminderItem} key={item.id}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.reminderTitle}>
            {item.type === "vet" ? "Vet Appointment" : item.title}
          </Text>
          <Text style={styles.reminderTime}>
            {item.type === "vet" ? (
              <Text style={styles.reminderTime}>
                {isValidDate
                  ? eventTime.toLocaleString([], {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "No Date Available"}
              </Text>
            ) : (
              <Text style={styles.reminderTime}>
                {item.date && item.time
                  ? `${item.date.split("-").reverse().join("/")}, ${
                      item.time.hours % 12 || 12
                    }:${String(item.time.minutes).padStart(2, "0")} ${
                      item.time.hours >= 12 ? "PM" : "AM"
                    }`
                  : "No Date Available"}
              </Text>
            )}
          </Text>
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
      {combinedReminders.length === 0 ? (
        <Text style={styles.noRemindersText}>No upcoming reminders.</Text>
      ) : (
        combinedReminders.map((item) => renderReminderItem(item))
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
  listContainer: {
    paddingBottom: 30,
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
});

export default ReminderPage;
