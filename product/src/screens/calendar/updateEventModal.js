import React from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import Modal from "react-native-modal";
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
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showTimePicker, setShowTimePicker] = React.useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const updatedDate = new Date(selectedEvent.dateTime || new Date());
      updatedDate.setFullYear(selectedDate.getFullYear());
      updatedDate.setMonth(selectedDate.getMonth());
      updatedDate.setDate(selectedDate.getDate());

      setSelectedEvent({
        ...selectedEvent,
        dateTime: updatedDate,
      });
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      const updatedDate = new Date(selectedEvent.dateTime || new Date());
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());

      setSelectedEvent({
        ...selectedEvent,
        dateTime: updatedDate,
      });
      console.log(
        "Selected Time: ",
        updatedDate.getHours(),
        updatedDate.getMinutes()
      );
    }
  };

  // Handle update action
  const handleUpdate = async () => {
    // Ensure we have the latest state before proceeding
    if (selectedEvent?.id) {
      try {
        console.log("Attempting to update event with data: ", selectedEvent);
        await updateEvent(selectedEvent);
        console.log("Event updated successfully.");
        setIsVisible(false); // Close the modal if update is successful
      } catch (error) {
        console.error("Error updating event: ", error);
      }
    } else {
      console.error("Cannot update: selectedEvent does not have a valid ID");
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => setIsVisible(false)}
      style={styles.modalContainer}
      backdropColor="rgba(0, 0, 0, 0.5)"
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
                    ? new Date(selectedEvent.dateTime).toLocaleDateString([], {
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
                  value={
                    selectedEvent?.dateTime
                      ? new Date(selectedEvent.dateTime)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) =>
                    handleDateChange(event, selectedDate || new Date())
                  }
                />
              )}

              {/* Time Picker */}
              <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                <Text style={styles.timeText}>
                  Time:{" "}
                  {selectedEvent?.dateTime
                    ? `${
                        ((new Date(selectedEvent.dateTime).getHours() + 11) %
                          12) +
                        1
                      }:${String(
                        new Date(selectedEvent.dateTime).getMinutes()
                      ).padStart(2, "0")} ${
                        new Date(selectedEvent.dateTime).getHours() >= 12
                          ? "PM"
                          : "AM"
                      }`
                    : "Select Time"}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={
                    selectedEvent?.dateTime
                      ? new Date(selectedEvent.dateTime)
                      : new Date()
                  }
                  mode="time"
                  display="default"
                  is24Hour={false}
                  onChange={(event, selectedTime) =>
                    handleTimeChange(event, selectedTime || new Date())
                  }
                />
              )}

              {/* Pet Selection */}
              <Text style={styles.petsSelectionHeader}>Select Pets</Text>
              <View style={styles.petButtonsContainer}>
                {petNames.map((item, index) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.petButton,
                      selectedEvent.pets?.includes(item) && styles.petSelected,
                      index === petNames.length - 1 && styles.lastPetButton,
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
                      style={[
                        styles.petText,
                        selectedEvent.pets?.includes(item) &&
                          styles.petSelectedText,
                      ]}
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
                  onPress={handleUpdate}
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
    width: "90%",
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
    borderWidth: 1,
    borderColor: colors.primaryLighter,
  },
  petSelectedText: {
    fontWeight: "bold",
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
