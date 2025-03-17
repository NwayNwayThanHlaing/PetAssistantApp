import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../styles/Theme";

const EventList = ({ events = {}, selectedDate, onEventPress }) => {
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedDate || !events) {
      setTodayEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const foundEvents = events[selectedDate] || [];

    // Sort events by time object {hours, minutes}
    const sortedEvents = foundEvents.sort((a, b) => {
      const aHours = a.time?.hours || 0;
      const aMinutes = a.time?.minutes || 0;
      const bHours = b.time?.hours || 0;
      const bMinutes = b.time?.minutes || 0;

      return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
    });

    setTodayEvents(sortedEvents);
    setLoading(false);
  }, [selectedDate, events]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!todayEvents.length) {
    return <Text style={styles.noEventsText}>No events for this day.</Text>;
  }

  return (
    <View>
      {todayEvents.map((item, index) => (
        <TouchableOpacity
          key={`${item.id || index}-${index}`}
          onPress={() => onEventPress(item)}
        >
          <View style={styles.eventItem}>
            <View style={styles.eventRow}>
              <Text style={styles.eventTitle}>{item.title}</Text>

              <Text style={styles.eventTime}>{formatTime(item.time)}</Text>
            </View>

            {item.appointment && <Text style={styles.vet}>(Appointment)</Text>}

            {item.relatedPets && item.relatedPets.length > 0 && (
              <Text style={styles.petsText}>
                Pets: {item.relatedPets.join(", ")}
              </Text>
            )}

            {item.notes && item.notes.trim() !== "" && (
              <Text style={styles.petsText}>
                Note: {item.notes.replace(/\n{2,}/g, "\n").trim()}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Helper to format time consistently
const formatTime = (time) => {
  if (
    !time ||
    typeof time.hours !== "number" ||
    typeof time.minutes !== "number"
  ) {
    return "00:00 AM";
  }

  const hours12 = ((time.hours + 11) % 12) + 1;
  const minutes = time.minutes.toString().padStart(2, "0");
  const ampm = time.hours >= 12 ? "PM" : "AM";

  return `${hours12}:${minutes} ${ampm}`;
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
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryLightest,
    marginBottom: 10,
  },
  eventRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  petsText: {
    marginTop: 5,
    fontSize: 14,
    color: colors.primary,
  },
  vet: {
    marginTop: 5,
    fontSize: 14,
    color: colors.accent,
  },
});

export default EventList;
