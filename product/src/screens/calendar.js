import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
} from "react-native";
import { Calendar, CalendarList } from "react-native-calendars";
import Modal from "react-native-modal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../styles/Theme";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showYearView, setShowYearView] = useState(true);
  const [events, setEvents] = useState({});
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    time: new Date(),
    notes: "",
  });
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [calendarKey, setCalendarKey] = useState(0); // Initialize key for re-rendering

  // Toggle between year and month view
  const toggleView = () => setShowYearView(!showYearView);

  // Set current date and navigate to today's month
  const goToToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    setCurrentDate(today);
    setCalendarKey((prevKey) => prevKey + 1); // Force Calendar re-render
    if (showYearView) setShowYearView(false); // Go to month view if in year view
  };

  // Add new event
  const addEvent = () => {
    const eventDate = selectedDate;
    setEvents((prevEvents) => ({
      ...prevEvents,
      [eventDate]: [...(prevEvents[eventDate] || []), newEvent],
    }));
    setIsAddingEvent(false);
    setNewEvent({ title: "", time: new Date(), notes: "" });
  };

  // Render events for the selected day
  const renderEventList = () => {
    const todayEvents = events[selectedDate] || [];
    return (
      <View style={styles.eventListContainer}>
        {todayEvents.length === 0 ? (
          <Text style={styles.noEventsText}>No events for this day.</Text>
        ) : (
          <FlatList
            data={todayEvents}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.eventItem}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventTime}>
                  {item.time.toLocaleTimeString()}
                </Text>
                <Text style={styles.eventNotes}>{item.notes}</Text>
              </View>
            )}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={toggleView}>
          <Text style={styles.navText}>
            {showYearView ? "Yearly View" : "Monthly View"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToToday}>
          <Text style={styles.navText}>Today</Text>
        </TouchableOpacity>
      </View>

      {showYearView ? (
        <CalendarList
          current={currentDate}
          pastScrollRange={50}
          futureScrollRange={50}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setShowYearView(false);
          }}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: colors.primary },
          }}
          theme={{
            selectedDayBackgroundColor: colors.primary,
            todayTextColor: colors.accent,
          }}
        />
      ) : (
        <Calendar
          key={calendarKey} // Force re-render with updated key
          current={currentDate} // Set to today’s date
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: colors.primary },
          }}
          theme={{
            selectedDayBackgroundColor: colors.primary,
            todayTextColor: colors.accent,
          }}
        />
      )}

      <View style={styles.eventsContainer}>
        {selectedDate && (
          <>
            <Text style={styles.selectedDateText}>
              Events on {selectedDate}
            </Text>
            {renderEventList()}
            <TouchableOpacity
              style={styles.addEventButton}
              onPress={() => setIsAddingEvent(true)}
            >
              <Text style={styles.addEventButtonText}>Add Event</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Modal
        isVisible={isAddingEvent}
        onBackdropPress={() => setIsAddingEvent(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Add New Event</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            placeholderTextColor={colors.secondary}
            value={newEvent.title}
            onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
          />
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              mode="time"
              value={newEvent.time}
              onChange={(event, date) =>
                setNewEvent({ ...newEvent, time: date || newEvent.time })
              }
            />
          </View>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Notes"
            placeholderTextColor={colors.secondary}
            value={newEvent.notes}
            onChangeText={(text) => setNewEvent({ ...newEvent, notes: text })}
            multiline
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={addEvent}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsAddingEvent(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: colors.primary,
  },
  navText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  eventsContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: "white",
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  eventListContainer: {
    flex: 1,
    padding: 10,
  },
  noEventsText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: "center",
    marginTop: 20,
  },
  eventItem: {
    backgroundColor: colors.primaryLightest,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  eventTime: {
    fontSize: 14,
    color: colors.primary,
  },
  eventNotes: {
    fontSize: 14,
    color: colors.primary,
  },
  addEventButton: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  addEventButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    paddingBottom: 30,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: colors.primary,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.primaryLightest,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  notesInput: {
    height: 60,
  },
  datePickerContainer: {
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: colors.accent,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CalendarPage;
