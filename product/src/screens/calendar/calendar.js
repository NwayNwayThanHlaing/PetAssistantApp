import React, { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
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
  updateOneOccurrence,
  updateFutureOccurrences,
  deleteEvent,
  deleteOneOccurrence,
  deleteFutureOccurrences,
} from "./firestoreService";
import EventList from "./eventList";
import EventModal from "./updateEventModal";
import AddEventModal from "./addEventModal";
import Svg, { Path } from "react-native-svg";
import { generateRecurringDates } from "../../actions/recurrenceUtils";

const CalendarPage = () => {
  const route = useRoute();

  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: { hours: 0, minutes: 0 },
    notes: "",
    pets: [],
    appointment: false,
    read: false,
    recurrence: "none",
    endDate: null,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPets, setSelectedPets] = useState([]);
  const [petNames, setPetNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString()
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  const months = [
    { label: "January", value: "1" },
    { label: "February", value: "2" },
    { label: "March", value: "3" },
    { label: "April", value: "4" },
    { label: "May", value: "5" },
    { label: "June", value: "6" },
    { label: "July", value: "7" },
    { label: "August", value: "8" },
    { label: "September", value: "9" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  const years = Array.from({ length: 30 }, (_, index) => {
    return (new Date().getFullYear() - 15 + index).toString();
  });

  // FETCH DATA ===================================================================
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

  const fetchAndSetEvents = async () => {
    try {
      const eventsData = await fetchEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  useEffect(() => {
    fetchAndSetEvents();
  }, []);

  // UPDATES WHEN EVENTS OR DATE CHANGE ==========================================
  useEffect(() => {
    setMarkedDates(prepareMarkedDates());
  }, [selectedDate, events]);

  // SET TODAY'S DATE ============================================================
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const [year, month] = selectedDate.split("-");
      setSelectedYear(year);
      setSelectedMonth(month);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (route.params?.selectedDate) {
      setSelectedDate(route.params.selectedDate);
    }
  }, [route.params?.selectedDate]);

  // MARKED DATES =================================================================
  const prepareMarkedDates = () => {
    const newMarkedDates = {};

    Object.keys(events).forEach((date) => {
      const eventsOnDate = events[date];

      if (eventsOnDate && eventsOnDate.length > 0) {
        newMarkedDates[date] = {
          marked: true,
          dots: [{ color: colors.accent }],
        };
      }
    });

    if (selectedDate) {
      const existingMark = newMarkedDates[selectedDate];

      newMarkedDates[selectedDate] = {
        ...(existingMark || {}),
        marked: true, // ensures dot shows up
        dots:
          existingMark?.dots ||
          (events[selectedDate]?.length ? [{ color: colors.accent }] : []),
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return newMarkedDates;
  };

  // HANDLE ADD EVENT =============================================================
  const handleAddEvent = async (eventWithRecurrence) => {
    if (!eventWithRecurrence.title.trim()) {
      alert("Event title is required.");
      return;
    }

    setLoading(true);

    try {
      const formattedDate = new Date(selectedDate).toISOString().split("T")[0];

      const updatedEvent = {
        ...eventWithRecurrence,
        date: formattedDate,
        pets: selectedPets,
        read: false,
      };

      await addEvent(updatedEvent, selectedPets);

      // After adding, refetch events
      await fetchAndSetEvents();
    } catch (error) {
      console.error("Error adding event:", error);
    } finally {
      setLoading(false);
      setIsAddingEvent(false);
      resetNewEvent();
    }
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: "",
      time: data.time
        ? { hours: data.time.hours, minutes: data.time.minutes }
        : { hours: 0, minutes: 0 },
      notes: "",
      read: false,
      pets: [],
      recurrence: "none",
      endDate: null,
    });
    setSelectedPets([]);
  };

  const updateNonRecurringEvent = async (updatedFields) => {
    setUpdateLoading(true);
    try {
      await updateEvent({
        ...selectedEvent,
        ...updatedFields,
      });
      await fetchAndSetEvents();
      setIsEventModalVisible(false);
    } catch (error) {
      console.error("Error updating event:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateEvent = (updatedFields) => {
    if (!selectedEvent || !selectedEvent.id) {
      alert("No event selected!");
      return;
    }

    const isRecurring =
      selectedEvent.recurrence && selectedEvent.recurrence !== "none";

    if (!isRecurring) {
      // Non-recurring event directly update
      updateNonRecurringEvent(updatedFields);
      return;
    }

    // Show options if recurring
    Alert.alert("Update Event", "What would you like to update?", [
      { text: "Cancel", style: "cancel" },

      {
        text: "This occurrence only",
        onPress: async () => {
          setUpdateLoading(true);
          try {
            await updateOneOccurrence(
              selectedEvent,
              selectedDate,
              updatedFields
            );
            await fetchAndSetEvents();
            setIsEventModalVisible(false);
          } catch (error) {
            console.error("Error updating one occurrence:", error);
          } finally {
            setUpdateLoading(false);
          }
        },
      },

      {
        text: "This and future occurrences",
        onPress: async () => {
          setUpdateLoading(true);
          try {
            await updateFutureOccurrences(
              selectedEvent,
              selectedDate,
              updatedFields
            );
            await fetchAndSetEvents();
            setIsEventModalVisible(false);
          } catch (error) {
            console.error("Error updating future occurrences:", error);
          } finally {
            setUpdateLoading(false);
          }
        },
      },

      {
        text: "Entire series",
        onPress: async () => {
          setUpdateLoading(true);
          try {
            await updateEvent({
              ...selectedEvent,
              ...updatedFields,
            });
            await fetchAndSetEvents();
            setIsEventModalVisible(false);
          } catch (error) {
            console.error("Error updating entire series:", error);
          } finally {
            setUpdateLoading(false);
          }
        },
      },
    ]);
  };

  // HANDLE DELETE EVENT ==========================================================
  const handleDeleteEvent = () => {
    if (!selectedEvent || !selectedEvent.id) {
      console.error("No event selected for deletion");
      return;
    }

    const isRecurring =
      selectedEvent.recurrence && selectedEvent.recurrence !== "none";

    if (!isRecurring) {
      // Delete the whole event directly
      Alert.alert(
        "Delete Event",
        "Are you sure you want to delete this event?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setDeleteLoading(true);
              try {
                await deleteEvent(selectedEvent.id);
                await fetchAndSetEvents();
                setIsEventModalVisible(false);
              } catch (error) {
                console.error("Error deleting event:", error);
              } finally {
                setDeleteLoading(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
      return;
    }

    // Show advanced delete options for recurring events
    Alert.alert("Delete Event", "What would you like to delete?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "This occurrence only",
        onPress: async () => {
          setDeleteLoading(true);
          try {
            const deleted = await deleteOneOccurrence(
              selectedEvent.id,
              selectedDate
            );
            if (deleted) {
              await fetchAndSetEvents();
              setIsEventModalVisible(false);
            }
          } catch (error) {
            console.error("Error excluding occurrence:", error);
          } finally {
            setDeleteLoading(false);
          }
        },
      },
      {
        text: "This and future occurrences",
        onPress: async () => {
          setDeleteLoading(true);
          try {
            const truncated = await deleteFutureOccurrences(
              selectedEvent,
              selectedDate
            );
            if (truncated) {
              await fetchAndSetEvents();
              setIsEventModalVisible(false);
            }
          } catch (error) {
            console.error("Error deleting future occurrences:", error);
          } finally {
            setDeleteLoading(false);
          }
        },
      },
      {
        text: "Entire series",
        style: "destructive",
        onPress: async () => {
          setDeleteLoading(true);
          try {
            await deleteEvent(selectedEvent.id);
            await fetchAndSetEvents();
            setIsEventModalVisible(false);
          } catch (error) {
            console.error("Error deleting event:", error);
          } finally {
            setDeleteLoading(false);
          }
        },
      },
    ]);
  };

  // NAVIGATION HELPERS ============================================================
  const handleArrowClick = (direction) => {
    let newMonth = parseInt(selectedMonth);
    let newYear = parseInt(selectedYear);

    if (direction === "left") {
      newMonth = newMonth === 1 ? 12 : newMonth - 1;
      if (newMonth === 12) newYear -= 1;
    } else {
      newMonth = newMonth === 12 ? 1 : newMonth + 1;
      if (newMonth === 1) newYear += 1;
    }

    setSelectedMonth(newMonth.toString());
    setSelectedYear(newYear.toString());
  };

  const goToToday = () => {
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    setSelectedDate(formattedToday);
    setSelectedMonth((today.getMonth() + 1).toString());
    setSelectedYear(today.getFullYear().toString());
  };

  const formattedDate = `${selectedYear}-${selectedMonth.padStart(2, "0")}-01`;

  // RENDER ======================================================================
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          {/* Top Buttons */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.addEventButton} onPress={goToToday}>
              <Text style={styles.addEventButtonText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addEventButton}
              onPress={() => {
                const now = new Date();
                setNewEvent((prevEvent) => ({
                  title: "",
                  date: selectedDate, // or default to today
                  time: { hours: now.getHours(), minutes: now.getMinutes() },
                  notes: "",
                  pets: [],
                  appointment: false,
                  read: false,
                  recurrence: "none",
                  endDate: null,
                }));

                setIsAddingEvent(true);
              }}
            >
              <Text style={styles.addEventButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <Calendar
              key={formattedDate}
              current={formattedDate}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);

                // Update the newEvent state so the Add Event Modal shows the correct date
                setNewEvent((prevEvent) => ({
                  ...prevEvent,
                  date: day.dateString,
                }));
              }}
              markedDates={markedDates}
              markingType="multi-dot"
              theme={{ textDayHeaderFontWeight: "bold" }}
              renderHeader={() => (
                <View style={styles.header}>
                  <TouchableOpacity onPress={() => handleArrowClick("left")}>
                    <Svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M15 18l-6-6 6-6"
                        stroke={colors.accent}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </TouchableOpacity>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => setShowMonthModal(true)}>
                      <View style={styles.headerItem}>
                        <Text style={styles.headerText}>
                          {months[parseInt(selectedMonth) - 1].label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowYearModal(true)}>
                      <View style={styles.headerItem}>
                        <Text style={styles.headerText}>{selectedYear}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => handleArrowClick("right")}>
                    <Svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M9 18l6-6-6-6"
                        stroke={colors.accent}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>
              )}
              hideArrows
            />
          </View>

          {/* Events */}
          <View style={styles.eventsContainer}>
            <Text style={styles.selectedDateText}>
              Events on {selectedDate}
            </Text>
            <EventList
              selectedDate={selectedDate}
              events={events}
              onEventPress={(event) => {
                setSelectedEvent(event);
                setIsEventModalVisible(true);
              }}
            />
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
          isRecurring={
            selectedEvent?.recurrence && selectedEvent.recurrence !== "none"
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },
  addEventButton: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 10,
  },
  addEventButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  headerItem: {
    padding: 5,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  headerText: { fontWeight: "bold", color: colors.primary },
  eventsContainer: { padding: 15, paddingBottom: 80 },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.accent,
    marginBottom: 10,
  },
});

export default CalendarPage;
