// EventList Component
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../styles/Theme";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const EventList = ({ onEventPress, selectedDate }) => {
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        const firestore = getFirestore();
        const eventsRef = collection(firestore, "users", user.uid, "events");

        // Ensure the selected date is in the correct format: 'YYYY-MM-DD'
        const selectedDateString = selectedDate;

        console.log("Selected Date for Query: ", selectedDateString);

        // Query Firestore to get events where the date matches the selected date
        const eventsQuery = query(
          eventsRef,
          where("date", "==", selectedDateString)
        );

        // Set up real-time listener
        unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
          if (snapshot.empty) {
            console.log(
              "No events found for the selected date: ",
              selectedDateString
            );
            setTodayEvents([]);
          } else {
            // Extract events data from Firestore snapshot
            const eventsData = snapshot.docs.map((doc) => {
              const eventData = doc.data();
              console.log("Fetched Event: ", eventData); // Log each event fetched
              return { id: doc.id, ...eventData };
            });
            setTodayEvents(eventsData);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching events: ", error);
        setTodayEvents([]);
        setLoading(false);
      }
    };

    if (selectedDate) {
      fetchEvents();
    } else {
      setTodayEvents([]);
      setLoading(false);
    }

    // Cleanup listener when component unmounts or dependencies change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedDate]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!todayEvents || todayEvents.length === 0) {
    return <Text style={styles.noEventsText}>No events for this day.</Text>;
  }

  return (
    <View>
      {todayEvents.map((item) => (
        <TouchableOpacity key={item.id} onPress={() => onEventPress(item)}>
          <View style={styles.eventItem}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventTime}>
                {item.time &&
                typeof item.time.hours === "number" &&
                typeof item.time.minutes === "number"
                  ? `${((item.time.hours + 11) % 12) + 1}:${item.time.minutes
                      .toString()
                      .padStart(2, "0")} ${item.time.hours >= 12 ? "PM" : "AM"}`
                  : "00:00 AM"}
              </Text>
            </View>
            {item.relatedPets && item.relatedPets.length > 0 && (
              <Text style={styles.petsText}>
                Pets: {item.relatedPets.join(", ")}
              </Text>
            )}
            {item.notes && item.notes.trim() !== "" && (
              <Text style={styles.eventNotes}>
                Note: {item.notes.replace(/\n{2,}/g, "\n").trim()}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEventsText: {
    fontSize: 16,
    color: colors.primaryLight,
    textAlign: "center",
    marginVertical: 20,
  },
  eventItem: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryLightest,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  eventTime: {
    fontSize: 16,
    color: colors.primary,
  },
  eventNotes: {
    marginTop: 3,
    fontSize: 14,
    color: colors.primary,
  },
  petsText: {
    marginTop: 5,
    fontSize: 14,
    color: colors.primary,
  },
});

export default EventList;
