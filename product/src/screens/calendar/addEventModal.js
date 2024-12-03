import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import { colors } from "../../styles/Theme";

const AddEventModal = ({
  isVisible,
  setIsVisible,
  newEvent,
  setNewEvent,
  selectedPets,
  setSelectedPets,
  petNames,
  addEvent,
  loading,
}) => {
  const [recurrence, setRecurrence] = useState("none"); // Default to non-recurring
  const [endDate, setEndDate] = useState(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const resetNewEvent = () => {
    setNewEvent((prev) => {
      if (Object.keys(prev).length === 0) {
        return {
          title: "",
          time: new Date(new Date().setHours(0, 0, 0, 0)),
          notes: "",
          appointment: false,
        };
      }
      return prev; // Don't overwrite if `newEvent` is already set
    });
    setSelectedPets((prev) => (prev.length === 0 ? [] : prev));
    setRecurrence("none"); // Reset recurrence to default
    setEndDate(null); // Reset end date
  };

  useEffect(() => {
    if (isVisible) {
      if (Object.keys(newEvent).length === 0) {
        resetNewEvent(); // Only reset if `newEvent` is empty
      }
    }
  }, [isVisible, newEvent]);

  const handleTextInputChange = (field, value) => {
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      [field]: value,
    }));
  };

  const togglePetSelection = (petName) => {
    setSelectedPets((prevSelected) =>
      prevSelected.includes(petName)
        ? prevSelected.filter((pet) => pet !== petName)
        : [...prevSelected, petName]
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => setIsVisible(false)}
      style={styles.modalContainer}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContent}>
          <View style={styles.scrollViewContent}>
            <Text style={styles.modalHeader}>Add New Event</Text>

            {/* Event Title */}
            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor={colors.primaryLighter}
              value={newEvent.title}
              onChangeText={(text) => handleTextInputChange("title", text)}
            />

            {/* Event Time */}
            <View style={styles.datePickerContainer}>
              <Text style={{ color: colors.primaryLighter }}>Event Time</Text>
              <DateTimePicker
                mode="time"
                value={
                  newEvent.time && newEvent.time instanceof Date
                    ? newEvent.time
                    : new Date()
                }
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setNewEvent((prevEvent) => ({
                      ...prevEvent,
                      time: selectedTime,
                    }));
                  }
                }}
                is24Hour={false} // Use AM/PM format
              />
            </View>

            {/* Notes */}
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notes"
              placeholderTextColor={colors.primaryLighter}
              value={newEvent.notes}
              onChangeText={(text) => handleTextInputChange("notes", text)}
              multiline
            />

            {/* Recurrence */}
            <View>
              <Text style={styles.label}>Repeat</Text>
              <DropDownPicker
                open={open}
                value={value}
                items={[
                  { label: "None", value: "none" },
                  { label: "Every Day", value: "daily" },
                  { label: "Every Week", value: "weekly" },
                  { label: "Every Two Weeks", value: "biweekly" },
                  { label: "Every Month", value: "monthly" },
                  { label: "Every Year", value: "yearly" },
                ]}
                setOpen={setOpen}
                setValue={setValue}
                onChangeValue={(itemValue) => {
                  setRecurrence(itemValue);
                  if (itemValue === "none") setEndDate(null); // Reset end date for non-recurring
                }}
                style={styles.picker} // Use the same picker style or customize it further
                dropDownDirection="BOTTOM" // Open dropdown below
              />
              {/* End Date */}
              {recurrence !== "none" && (
                <View style={styles.datePickerContainer}>
                  <Text style={{ color: colors.primaryLighter }}>End Date</Text>
                  <DateTimePicker
                    mode="date"
                    value={endDate || new Date()}
                    onChange={(event, selectedDate) => {
                      if (selectedDate) setEndDate(selectedDate);
                    }}
                  />
                </View>
              )}
            </View>

            {/* Pet Selection */}
            <Text style={styles.petsSelectionHeader}>Select Pets</Text>
            <View style={styles.petButtonsContainer}>
              {petNames.map((item) => (
                <TouchableOpacity
                  key={item}
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
              ))}
            </View>

            {/* Appointment Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                setNewEvent((prevEvent) => ({
                  ...prevEvent,
                  appointment: !prevEvent.appointment,
                }))
              }
            >
              <View
                style={[
                  styles.checkbox,
                  newEvent.appointment && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.checkboxLabel}>Vet Appointment</Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsVisible(false);
                  Keyboard.dismiss(); // Dismiss keyboard on cancel
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  Keyboard.dismiss(); // Dismiss keyboard on save
                  addEvent({
                    ...newEvent,
                    recurrence,
                    endDate,
                  }); // Pass recurrence data
                }}
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
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
    alignSelf: "center",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
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
  label: {
    fontSize: 16,
    color: colors.primary,
    marginVertical: 10,
  },
  picker: {
    width: "100%",
    backgroundColor: colors.background,
    borderRadius: 8,
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
  },
  cancelButton: {
    backgroundColor: colors.primary,
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  petButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
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
  petsSelectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 10,
    borderRadius: 4,
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.primary,
  },
});
export default AddEventModal;
