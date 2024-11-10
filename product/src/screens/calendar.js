import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  ScrollView,
  FlatList,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Modal from "react-native-modal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../styles/Theme";
import { firestore, auth } from "../auth/firebaseConfig";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [showYearView, setShowYearView] = useState(true);
  const [events, setEvents] = useState({});
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    time: new Date(),
    notes: "",
    pets: [],
  });
  const [selectedPets, setSelectedPets] = useState([]);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [calendarKey, setCalendarKey] = useState(0);
  const [petNames, setPetNames] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch pet names from Firestore
  useEffect(() => {
    const fetchPetNames = async () => {
      if (!auth.currentUser) {
        console.log("No user authenticated");
        return;
      }

      try {
        const userId = auth.currentUser.uid;
        const petRef = collection(firestore, "users", userId, "pets");
        const petSnapshot = await getDocs(petRef);
        const petList = petSnapshot.docs.map((doc) => doc.data().name);
        setPetNames(petList);
      } catch (error) {
        console.error("Error fetching pet names: ", error);
      }
    };

    fetchPetNames();
  }, []);

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      if (!auth.currentUser) {
        console.log("No user authenticated");
        return;
      }

      try {
        const userId = auth.currentUser.uid;
        const eventsRef = collection(firestore, "users", userId, "events");
        const eventsSnapshot = await getDocs(eventsRef);

        const eventsData = {};
        eventsSnapshot.forEach((doc) => {
          const data = doc.data();
          const eventDate = data.date;
          if (!eventsData[eventDate]) {
            eventsData[eventDate] = [];
          }
          eventsData[eventDate].push({
            title: data.title,
            time: data.time.toDate(),
            notes: data.notes,
            pets: data.relatedPets,
          });
        });

        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events from Firestore: ", error);
      }
    };

    fetchEvents();
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
    setCalendarKey((prevKey) => prevKey + 1); // Trigger re-render of the calendar
    if (showYearView) setShowYearView(false);
  };

  // Add new event
  const addEvent = async () => {
    if (!newEvent.title.trim()) {
      alert("Event title is required.");
      return;
    }
    if (!newEvent.time) {
      alert("Event time is required.");
      return;
    }

    // Prepare event data
    const eventDate = selectedDate;
    const updatedEvent = {
      ...newEvent,
      pets: selectedPets,
    };

    // Update state with new event
    setEvents((prevEvents) => ({
      ...prevEvents,
      [eventDate]: [...(prevEvents[eventDate] || []), updatedEvent],
    }));

    // Store the event in Firestore
    try {
      if (!auth.currentUser) {
        console.log("No user authenticated");
        return;
      }
      setLoading(true);
      const userId = auth.currentUser.uid;
      const eventRef = collection(firestore, "users", userId, "events");

      await addDoc(eventRef, {
        title: newEvent.title,
        time: Timestamp.fromDate(newEvent.time),
        notes: newEvent.notes,
        relatedPets: selectedPets, // Store pet IDs if there are any, otherwise empty
        date: eventDate, // Add event date to Firestore for easier querying
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log("Event added successfully");
    } catch (error) {
      console.error("Error adding event to Firestore: ", error);
    }

    // Close modal and reset form
    setIsAddingEvent(false);
    setNewEvent({ title: "", time: new Date(), notes: "", pets: [] });
    setSelectedPets([]); // Clear selected pets after saving
    setLoading(false);
  };

  // Toggle pet selection
  const togglePetSelection = (petName) => {
    setSelectedPets((prevSelected) =>
      prevSelected.includes(petName)
        ? prevSelected.filter((pet) => pet !== petName)
        : [...prevSelected, petName]
    );
  };

  // Render events for the selected day
  const renderEventList = () => {
    const todayEvents = events[selectedDate] || [];
    return (
      <View>
        {todayEvents.length === 0 ? (
          <Text style={styles.noEventsText}>No events for this day.</Text>
        ) : (
          todayEvents.map((item, index) => (
            <View style={styles.eventItem} key={index}>
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
                <Text style={styles.petsText}>
                  Pets: {item.pets.join(", ")}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
    );
  };

  // Prepare marked dates for the calendar
  const prepareMarkedDates = () => {
    const markedDates = {};
    Object.keys(events).forEach((date) => {
      const eventCount = events[date].length;
      markedDates[date] = {
        marked: true,
        dotColor: colors.accent,
        dots: Array(Math.min(eventCount, 3)).fill({ color: colors.accent }),
        selected: date === selectedDate,
        selectedColor: colors.primary,
      };
    });
    return markedDates;
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
          }}
        >
          <TouchableOpacity onPress={goToToday}>
            <Text style={styles.today}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addEventButton}
            onPress={() => setIsAddingEvent(true)}
          >
            <Text style={styles.addEventButtonText}>+Add</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Calendar
            key={calendarKey}
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
                {renderEventList()}
              </>
            )}
          </View>
        </ScrollView>
        <Modal
          isVisible={isAddingEvent}
          onBackdropPress={() => setIsAddingEvent(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add New Event</Text>
            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor={colors.primaryLighter}
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
            />
            <View style={styles.datePickerContainer}>
              <Text style={{ color: colors.primaryLighter }}>Event Time</Text>

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
              placeholderTextColor={colors.primaryLighter}
              value={newEvent.notes}
              onChangeText={(text) => setNewEvent({ ...newEvent, notes: text })}
              multiline
            />
            <Text style={styles.petsSelectionHeader}>Select Pets</Text>
            <FlatList
              data={petNames}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.petButton,
                    selectedPets.includes(item) && styles.petSelected,
                  ]}
                  onPress={() => togglePetSelection(item)}
                >
                  <Text
                    style={[
                      styles.petText,
                      selectedPets.includes(item) && styles.petSelectedText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.flatListContainer} // Apply content container style to FlatList
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddingEvent(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addEvent}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  petButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primaryLightest,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 5,
  },
  petSelected: {
    backgroundColor: colors.accent,
  },
  petText: {
    fontSize: 16,
    color: colors.primary,
  },
  petSelectedText: {
    fontWeight: "bold",
    color: "white",
  },
  flatListContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  petsSelectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 20,
  },
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

  noEventsText: {
    fontSize: 16,
    color: colors.primaryLight,
    textAlign: "center",
    marginTop: 20,
  },
  eventItem: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primaryLightest,
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
    fontSize: 16,
    color: colors.primary,
  },
  eventNotes: {
    fontSize: 16,
    color: colors.primary,
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
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    flex: 1,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    paddingBottom: 30,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: colors.primary,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
  },
  notesInput: {
    height: 60,
  },
  datePickerContainer: {
    width: "100%",
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background,
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
    marginLeft: 10,
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
