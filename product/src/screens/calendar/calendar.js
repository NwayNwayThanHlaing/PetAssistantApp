// CalendarPage Component
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
import EventModal from "./updateEventModal";
import AddEventModal from "./addEventModal";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    time: { hours: 0, minutes: 0 },
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
        setLoading(true);
        const eventsData = await fetchEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update markedDates whenever events or selectedDate changes
  useEffect(() => {
    setMarkedDates(prepareMarkedDates());
  }, [events, selectedDate, selectedEvent]);

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
    setNewEvent({
      title: "",
      time: { hours: 0, minutes: 0 },
      notes: "",
      pets: [],
    });
    setSelectedPets([]);
  };
  // Prepare marked dates for the calendar
  const prepareMarkedDates = () => {
    const newMarkedDates = {};

    // Iterate over all event dates
    Object.keys(events).forEach((date) => {
      if (events[date] && events[date].length > 0) {
        newMarkedDates[date] = {
          marked: true,
          dots: [{ color: colors.accent }], // Ensure only one dot is displayed
        };
      }
    });

    // Ensure the selected date is highlighted, even if it has no events
    if (selectedDate) {
      newMarkedDates[selectedDate] = {
        ...newMarkedDates[selectedDate], // Retain existing dots if any
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return newMarkedDates;
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
        const previousDate = selectedEvent.previousDate || selectedDate;

        // Remove the event from the previous date if the date changed
        if (previousDate !== selectedEvent.date) {
          if (updatedEvents[previousDate]) {
            updatedEvents[previousDate] = updatedEvents[previousDate].filter(
              (event) => event.id !== selectedEvent.id
            );
            if (updatedEvents[previousDate].length === 0) {
              delete updatedEvents[previousDate];
            }
          }
        }

        // Add the event to the new date
        if (selectedEvent.date) {
          if (!updatedEvents[selectedEvent.date]) {
            updatedEvents[selectedEvent.date] = [];
          }

          const eventIndex = updatedEvents[selectedEvent.date].findIndex(
            (event) => event.id === selectedEvent.id
          );

          if (eventIndex > -1) {
            updatedEvents[selectedEvent.date][eventIndex] = selectedEvent;
          } else {
            updatedEvents[selectedEvent.date].push(selectedEvent);
          }
        }

        return updatedEvents;
      });

      // Update marked dates after updating events
      setMarkedDates(prepareMarkedDates());
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

            // Update marked dates after deleting events
            setMarkedDates(prepareMarkedDates());
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
        <ScrollView style={styles.container}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 15,
              paddingVertical: 10,
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
          <View
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.2,
              shadowRadius: 3.84,
              borderRadius: 20,
              backgroundColor: "white",
              margin: 15,
              padding: 10,
            }}
          >
            <Calendar
              current={currentDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              markingType={"multi-dot"}
              theme={{
                selectedDayBackgroundColor: colors.primary,
                todayTextColor: colors.accent,
                arrowColor: colors.accent,
                textMonthFontWeight: "bold",
                textMonthFontSize: 20,
                textDayFontSize: 17,
                textDayHeaderFontSize: 14,
                textSectionTitleColor: colors.primary,
                textDayHeaderFontWeight: "bold",
              }}
            />
          </View>
          <View style={styles.eventsContainer}>
            {selectedDate && (
              <>
                <Text style={styles.selectedDateText}>
                  Events on {selectedDate}
                </Text>
                <EventList
                  selectedDate={selectedDate}
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
    flex: 1,
  },
  today: {
    color: colors.primary,
    textDecorationLine: "underline",
    fontSize: 18,
    fontWeight: "600",
    alignSelf: "flex-end",
  },
  eventsContainer: {
    padding: 15,
    paddingTop: 20,
    paddingBottom: 80,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.accent,
    marginBottom: 10,
  },
  addEventButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  addEventButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CalendarPage;
