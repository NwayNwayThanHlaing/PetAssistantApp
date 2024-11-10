import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { colors } from "../../styles/Theme";
import {
  fetchPetNames,
  fetchEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} from "./firestoreService";
import EventList from "./eventList";
import EventModal from "./eventModal";
import AddEventModal from "./addEventModal";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState({});
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    time: new Date(),
    notes: "",
    pets: [],
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPets, setSelectedPets] = useState([]);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [petNames, setPetNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch pet names from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const petList = await fetchPetNames();
        setPetNames(petList);
      } catch (error) {
        console.error("Failed to fetch pet names:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch events from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await fetchEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchData();
  }, []);

  // Set today's date by default
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  // Go to today's date
  const goToToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    setCurrentDate(today);
  };

  // Prepare marked dates for the calendar
  const prepareMarkedDates = () => {
    const markedDates = {};
    Object.keys(events).forEach((date) => {
      if (events[date]) {
        markedDates[date] = {
          marked: true,
          dots: Array(Math.min(events[date].length, 3)).fill({
            color: colors.accent,
          }),
          selected: date === selectedDate,
          selectedColor: colors.primary,
        };
      }
    });
    return markedDates;
  };

  // Add new event
  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) {
      alert("Event title is required.");
      return;
    }
    if (!newEvent.time) {
      alert("Event time is required.");
      return;
    }

    setLoading(true);
    try {
      const docId = await addEvent(newEvent, selectedDate, selectedPets);

      const updatedEvent = {
        ...newEvent,
        pets: selectedPets,
        id: docId,
      };

      setEvents((prevEvents) => ({
        ...prevEvents,
        [selectedDate]: [...(prevEvents[selectedDate] || []), updatedEvent],
      }));
    } catch (error) {
      console.error("Error adding event:", error);
    }
    setLoading(false);
    setIsAddingEvent(false);
    setNewEvent({ title: "", time: new Date(), notes: "", pets: [] });
    setSelectedPets([]);
  };

  // Update Event
  const handleUpdateEvent = async () => {
    if (!selectedEvent || !selectedEvent.title.trim()) {
      alert("Event title is required.");
      return;
    }

    setUpdateLoading(true);
    try {
      await updateEvent(selectedEvent);

      // Update local state
      setEvents((prevEvents) => {
        const updatedEvents = { ...prevEvents };
        if (updatedEvents[selectedDate]) {
          updatedEvents[selectedDate] = updatedEvents[selectedDate].map(
            (event) => (event.id === selectedEvent.id ? selectedEvent : event)
          );
        }
        return updatedEvents;
      });
      setIsEventModalVisible(false);
    } catch (error) {
      console.error("Error updating event:", error);
    }
    setUpdateLoading(false);
  };

  // Delete Event
  const handleDeleteEvent = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      console.error("No event selected for deletion");
      return;
    }
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleteLoading(true);
          try {
            await deleteEvent(selectedEvent.id);

            // Update local state
            setEvents((prevEvents) => {
              const updatedEvents = { ...prevEvents };
              if (updatedEvents[selectedDate]) {
                updatedEvents[selectedDate] = updatedEvents[
                  selectedDate
                ].filter((event) => event.id !== selectedEvent.id);
                if (updatedEvents[selectedDate].length === 0) {
                  delete updatedEvents[selectedDate];
                }
              }
              return updatedEvents;
            });
            setSelectedEvent(null);
            setIsEventModalVisible(false);
          } catch (error) {
            console.error("Error deleting event:", error);
          }
          setDeleteLoading(false);
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 15,
            paddingVertical: 10,
            backgroundColor: "white",
          }}
        >
          <TouchableOpacity style={styles.addEventButton} onPress={goToToday}>
            <Text style={styles.addEventButtonText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addEventButton}
            onPress={() => setIsAddingEvent(true)}
          >
            <Text style={styles.addEventButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.container}>
          <Calendar
            current={currentDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={prepareMarkedDates()}
            markingType={"multi-dot"}
            theme={{
              selectedDayBackgroundColor: colors.primary,
              todayTextColor: colors.accent,
            }}
          />
          <View style={styles.eventsContainer}>
            {selectedDate && (
              <>
                <Text style={styles.selectedDateText}>
                  Events on {selectedDate}
                </Text>
                <EventList
                  todayEvents={events[selectedDate] || []}
                  onEventPress={(event) => {
                    setSelectedEvent(event);
                    setIsEventModalVisible(true);
                  }}
                />
              </>
            )}
          </View>
        </ScrollView>

        {/* Add Event Modal */}
        <AddEventModal
          isVisible={isAddingEvent}
          setIsVisible={setIsAddingEvent}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          selectedPets={selectedPets}
          setSelectedPets={setSelectedPets}
          petNames={petNames}
          addEvent={handleAddEvent}
          loading={loading}
        />

        {/* Event Details Modal */}
        <EventModal
          isVisible={isEventModalVisible}
          setIsVisible={setIsEventModalVisible}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          petNames={petNames}
          updateEvent={handleUpdateEvent}
          deleteEvent={handleDeleteEvent}
          updateLoading={updateLoading}
          deleteLoading={deleteLoading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  today: {
    color: colors.primary,
    textDecorationLine: "underline",
    fontSize: 16,
    fontWeight: "600",
    alignSelf: "flex-end",
  },
  eventsContainer: {
    padding: 15,
    paddingTop: 20,
    backgroundColor: "white",
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  addEventButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  addEventButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CalendarPage;
