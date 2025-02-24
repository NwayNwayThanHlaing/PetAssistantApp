import React, { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  TouchableWithoutFeedback,
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
import { Picker } from "@react-native-picker/picker";
import Svg, { Path } from "react-native-svg";

const CalendarPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: selectedDate,
    time: { hours: 0, minutes: 0 },
    notes: "",
    pets: [],
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPets, setSelectedPets] = useState([]);
  const [petNames, setPetNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Month and Year Selectors States
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString()
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  // Define arrays for months and years
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
    const year = new Date().getFullYear() - 15 + index;
    return year.toString();
  });

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
  }, [newEvent]);

  // Open Add Event Modal when the route params change from Home Page
  useEffect(() => {
    if (route.params?.openAddEventModal) {
      setIsAddingEvent(true);
      navigation.setParams({ openAddEventModal: false });
    }
  }, [route.params?.openAddEventModal, navigation]);

  // Update markedDates whenever events or selectedDate changes
  useEffect(() => {
    setMarkedDates(prepareMarkedDates());
  }, [selectedDate, events]);

  // Set today's date by default
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  // Update month and year when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const [year, month] = selectedDate.split("-");
      setSelectedMonth(month);
      setSelectedYear(year);
    }
  }, [selectedDate]);

  useEffect(() => {
    // Check if navigation came from Notifications and set the selected date
    if (route.params?.selectedDate) {
      setSelectedDate(route.params.selectedDate);
    } else {
      // Default to today's date if no selectedDate is provided
      const today = new Date().toISOString().split("T")[0];
      setSelectedDate(today);
    }
  }, [route.params?.selectedDate]);

  // Prepare marked dates for the calendar
  const prepareMarkedDates = () => {
    const newMarkedDates = {};

    Object.keys(events).forEach((date) => {
      if (events[date] && events[date].length > 0) {
        newMarkedDates[date] = {
          marked: true,
          dots: [{ color: colors.accent }],
        };
      }
    });

    if (selectedDate) {
      newMarkedDates[selectedDate] = {
        ...newMarkedDates[selectedDate],
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return newMarkedDates;
  };

  // Function to handle arrow clicks and update month and year
  const handleArrowClick = (direction) => {
    let newMonth = parseInt(selectedMonth);
    let newYear = parseInt(selectedYear);

    if (direction === "left") {
      if (newMonth === 1) {
        newMonth = 12;
        newYear -= 1;
      } else {
        newMonth -= 1;
      }
    } else if (direction === "right") {
      if (newMonth === 12) {
        newMonth = 1;
        newYear += 1;
      } else {
        newMonth += 1;
      }
    }

    setSelectedMonth(newMonth.toString());
    setSelectedYear(newYear.toString());
  };

  // Set the current date based on selected month and year
  const getFormattedDate = (year, month) => {
    const monthString = month < 10 ? `0${month}` : month;
    return `${year}-${monthString}-01`;
  };

  const formattedDate = getFormattedDate(selectedYear, selectedMonth);

  // Go to today's date
  const goToToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    setSelectedMonth((new Date().getMonth() + 1).toString());
    setSelectedYear(new Date().getFullYear().toString());
  };

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
      const formattedDate = new Date(selectedDate).toISOString().split("T")[0];

      const updatedEvent = {
        ...newEvent,
        date: formattedDate,
        pets: selectedPets,
        read: false,
      };

      const docId = await addEvent(updatedEvent, selectedPets);
      updatedEvent.id = docId;

      setEvents((prevEvents) => ({
        ...prevEvents,
        [formattedDate]: [...(prevEvents[formattedDate] || []), updatedEvent],
      }));
    } catch (error) {
      console.error("Error adding event:", error);
    } finally {
      setLoading(false);
      setIsAddingEvent(false);
      setNewEvent({
        title: "",
        time: { hours: 0, minutes: 0 },
        notes: "",
        read: false,
        pets: [],
      });
      setSelectedPets([]);
    }
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
              padding: 5,
              paddingVertical: 10,
              marginHorizontal: 10,
            }}
          >
            <Calendar
              key={formattedDate}
              current={formattedDate}
              onDayPress={(day) => {
                setSelectedDate(day.dateString),
                  setNewEvent({
                    ...newEvent,
                    date: day.dateString,
                  });
              }}
              markedDates={markedDates}
              markingType={"multi-dot"}
              theme={{
                textDayHeaderFontWeight: "bold",
              }}
              renderHeader={(date) => (
                <View style={styles.header}>
                  {/* Left arrow */}
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
                    {/* Touchable month selector */}
                    <TouchableOpacity onPress={() => setShowMonthModal(true)}>
                      <View
                        style={[
                          styles.headerItem,
                          {
                            marginRight: 5,
                          },
                        ]}
                      >
                        <Text style={styles.headerText}>
                          {months[parseInt(selectedMonth) - 1].label}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Touchable year selector */}
                    <TouchableOpacity onPress={() => setShowYearModal(true)}>
                      <View style={styles.headerItem}>
                        <Text style={styles.headerText}>{selectedYear}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  {/* Right arrow */}
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
              hideArrows={true}
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

        {/* Month Picker Modal */}
        <Modal
          visible={showMonthModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMonthModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowMonthModal(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedMonth}
                    onValueChange={(itemValue) => {
                      setSelectedMonth(itemValue);
                      setShowMonthModal(false);
                    }}
                  >
                    {months.map((month) => (
                      <Picker.Item
                        label={month.label}
                        value={month.value}
                        key={month.value}
                      />
                    ))}
                  </Picker>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Year Picker Modal */}
        <Modal
          visible={showYearModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowYearModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowYearModal(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedYear}
                    onValueChange={(itemValue) => {
                      setSelectedYear(itemValue);
                      setShowYearModal(false);
                    }}
                  >
                    {years.map((year) => (
                      <Picker.Item label={year} value={year} key={year} />
                    ))}
                  </Picker>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    width: "100%",
  },
  headerItem: {
    paddingVertical: 5,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    width: "80%",
    padding: 20,
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
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  addEventButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CalendarPage;
