import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Modal from "react-native-modal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../../styles/Theme";

const EventModal = ({
  isVisible,
  setIsVisible,
  selectedEvent,
  setSelectedEvent,
  petNames,
  updateEvent,
  deleteEvent,
  updateLoading,
  deleteLoading,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (isVisible && selectedEvent) {
      // Ensure dateTime is properly set when the modal is shown
      if (!selectedEvent.dateTime) {
        const date = selectedEvent.date
          ? new Date(selectedEvent.date)
          : new Date();
        const hours = selectedEvent.time?.hours || 0;
        const minutes = selectedEvent.time?.minutes || 0;
        date.setHours(hours);
        date.setMinutes(minutes);
        setSelectedEvent((prevEvent) => ({
          ...prevEvent,
          dateTime: date,
          pets: selectedEvent.pets || [],
        }));
      }
    }
  }, [isVisible, selectedEvent]);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setSelectedEvent((prevEvent) => ({
        ...prevEvent,
        dateTime: new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          prevEvent.dateTime?.getHours() || 0,
          prevEvent.dateTime?.getMinutes() || 0
        ),
      }));
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedEvent((prevEvent) => ({
        ...prevEvent,
        dateTime: new Date(
          prevEvent.dateTime?.getFullYear() || 1970,
          prevEvent.dateTime?.getMonth() || 0,
          prevEvent.dateTime?.getDate() || 1,
          selectedTime.getHours(),
          selectedTime.getMinutes()
        ),
      }));
    }
    setShowTimePicker(false);
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => setIsVisible(false)}
      style={styles.modalContainer}
      useNativeDriver={true}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <Text style={styles.modalHeader}>Event Details</Text>
              <TextInput
                style={styles.input}
                placeholder="Event Title.."
                placeholderTextColor={colors.primaryLighter}
                value={selectedEvent?.title || ""}
                onChangeText={(text) =>
                  setSelectedEvent({ ...selectedEvent, title: text })
                }
              />
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Notes.."
                placeholderTextColor={colors.primaryLighter}
                value={selectedEvent?.notes || ""}
                onChangeText={(text) =>
                  setSelectedEvent({ ...selectedEvent, notes: text })
                }
                multiline
              />

              {/* Date Picker */}
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>
                  Date:{" "}
                  {selectedEvent?.dateTime
                    ? selectedEvent.dateTime.toLocaleDateString([], {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Select Date"}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedEvent?.dateTime || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              {/* Time Picker */}
              <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                <Text style={styles.timeText}>
                  Time:{" "}
                  {selectedEvent?.dateTime
                    ? `${
                        ((selectedEvent.dateTime.getHours() + 11) % 12) + 1
                      }:${String(selectedEvent.dateTime.getMinutes()).padStart(
                        2,
                        "0"
                      )} ${
                        selectedEvent.dateTime.getHours() >= 12 ? "PM" : "AM"
                      }`
                    : "Select Time"}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={selectedEvent?.dateTime || new Date()}
                  mode="time"
                  display="default"
                  is24Hour={false}
                  onChange={handleTimeChange}
                />
              )}

              {/* Pet Selection */}
              <Text style={styles.petsSelectionHeader}>Select Pets</Text>
              <View style={styles.petButtonsContainer}>
                {petNames.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.petButton,
                      selectedEvent?.pets?.includes(item) && styles.petSelected,
                    ]}
                    onPress={() => {
                      setSelectedEvent((prevEvent) => ({
                        ...prevEvent,
                        pets: prevEvent.pets?.includes(item)
                          ? prevEvent.pets.filter((pet) => pet !== item)
                          : [...(prevEvent.pets || []), item],
                      }));
                    }}
                  >
                    <Text
                      style={
                        selectedEvent?.pets?.includes(item)
                          ? [styles.petText, styles.petSelectedText]
                          : styles.petText
                      }
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Buttons for Update, Delete, and Cancel */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={deleteEvent}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Delete</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={updateEvent}
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
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
    fontSize: 16,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    maxHeight: "90%",
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  petsSelectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 20,
  },
  petButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  petButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: colors.primaryLightest,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  petText: {
    fontSize: 16,
    color: colors.primary,
  },
  petSelected: {
    backgroundColor: colors.accent,
  },
  petSelectedText: {
    fontWeight: "bold",
    color: "white",
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
  },
  cancelButton: {
    backgroundColor: colors.primary,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "red",
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dateText: {
    marginTop: 20,
    fontSize: 16,
    color: colors.primary,
    marginBottom: 10,
  },
  timeText: {
    marginTop: 20,
    fontSize: 16,
    color: colors.primary,
    marginBottom: 10,
  },
});

export default EventModal;
