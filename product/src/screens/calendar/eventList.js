import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../styles/Theme";
const EventList = ({ todayEvents, onEventPress }) => {
  if (!todayEvents || todayEvents.length === 0) {
    return <Text style={styles.noEventsText}>No events for this day.</Text>;
  }

  return (
    <View>
      {todayEvents.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => onEventPress(item)}>
          <View style={styles.eventItem}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventTime}>
                {item.time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            {item.notes.trim() !== "" && (
              <Text style={styles.eventNotes}>
                {item.notes.replace(/\n{2,}/g, "\n")}
              </Text>
            )}
            {item.pets.length > 0 && (
              <Text style={styles.petsText}>Pets: {item.pets.join(", ")}</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 10,
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
