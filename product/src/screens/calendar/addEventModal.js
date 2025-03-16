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
  const [open, setOpen] = useState(false);
  const [recurrence, setRecurrence] = useState("none");
  const [endDate, setEndDate] = useState(null);
  const resetNewEvent = () => {
    setNewEvent((prev) => ({
      title: prev.title || "",
      date: prev.date instanceof Date ? prev.date : new Date(),
      time: prev.time || { hours: 0, minutes: 0 },
      notes: prev.notes || "",
      appointment: prev.appointment || false,
      recurrence: prev.recurrence || "none",
      endDate: prev.endDate || null,
    }));
    setSelectedPets((prev) => (prev.length === 0 ? [] : prev));
    setRecurrence("none");
    setEndDate(null);
  };

  useEffect(() => {
    if (!isVisible) {
      resetNewEvent();
    }
  }, [isVisible]);

  const handleTextInputChange = (field, value) => {
    setNewEvent((prevEvent) => {
      if (prevEvent[field] !== value) {
        return {
          ...prevEvent,
          [field]: value,
        };
      }
      return prevEvent;
    });
  };

  const togglePetSelection = (petName) => {
    setSelectedPets((prevSelected) =>
      prevSelected.includes(petName)
        ? prevSelected.filter((pet) => pet !== petName)
        : [...prevSelected, petName]
    );
  };

  const getTimeAsDate = (timeObj) => {
    const now = new Date();
    now.setHours(timeObj?.hours ?? 0);
    now.setMinutes(timeObj?.minutes ?? 0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now;
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
            {/* Notes */}
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notes"
              placeholderTextColor={colors.primaryLighter}
              value={newEvent.notes}
              onChangeText={(text) => handleTextInputChange("notes", text)}
              multiline
            />
            {/* Event Date */}
            <View style={styles.datePickerContainer}>
              <Text style={{ color: colors.primary }}>Event Date</Text>
              <DateTimePicker
                value={newEvent.date ? new Date(newEvent.date) : new Date()}
                mode="date"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    // Format the date as YYYY-MM-DD inline
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(
                      2,
                      "0"
                    );
                    const day = String(selectedDate.getDate()).padStart(2, "0");
                    const formattedDate = `${year}-${month}-${day}`;

                    setNewEvent((prevEvent) => ({
                      ...prevEvent,
                      date: formattedDate,
                    }));
                  }
                }}
              />
            </View>
            {/* Event Time */}
            <View style={styles.datePickerContainer}>
              <Text style={{ color: colors.primary }}>Event Time</Text>
              <DateTimePicker
                mode="time"
                value={
                  newEvent.time ? getTimeAsDate(newEvent.time) : new Date()
                }
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setNewEvent((prevEvent) => ({
                      ...prevEvent,
                      time: {
                        hours: selectedTime.getHours(),
                        minutes: selectedTime.getMinutes(),
                      },
                    }));
                  }
                }}
                is24Hour={false}
              />
            </View>

            <Text style={styles.label}>Repeat</Text>
            <DropDownPicker
              open={open}
              value={recurrence} // Use recurrence state
              items={[
                { label: "None", value: "none" },
                { label: "Daily", value: "daily" },
                { label: "Weekly", value: "weekly" },
                { label: "Monthly", value: "monthly" },
                { label: "Yearly", value: "yearly" },
              ]}
              setOpen={setOpen}
              setValue={(val) => {
                setRecurrence(val);
                if (val === "none") {
                  setEndDate(null);
                } else {
                  setEndDate(newEvent.endDate || new Date()); // Set default end date
                }
              }}
              onChangeValue={(val) => {
                setRecurrence(val);
                if (val === "none") {
                  setEndDate(null);
                }
              }}
              placeholder="Repeat"
              style={styles.picker}
              dropDownContainerStyle={[
                styles.dropdownContainer,
                { zIndex: 1000 },
              ]}
            />
            {recurrence !== "none" && (
              <Text style={{ color: colors.primaryLight, marginTop: 5 }}>
                Repeats {recurrence}
                {endDate ? ` until ${endDate.toDateString()}` : ""}
              </Text>
            )}
            {recurrence !== "none" && (
              <View style={styles.datePickerContainer}>
                <Text style={{ color: colors.primary }}>End Date</Text>
                <DateTimePicker
                  mode="date"
                  value={endDate instanceof Date ? endDate : new Date(endDate)}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setEndDate(selectedDate);
                  }}
                />
              </View>
            )}

            {/* Select Pets */}
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
              <Text style={styles.checkboxLabel}>Appointment</Text>
            </TouchableOpacity>
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsVisible(false);
                  Keyboard.dismiss();
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  Keyboard.dismiss();
                  addEvent({
                    ...newEvent,
                    recurrence,
                    endDate,
                  });
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
    borderColor: colors.primaryLightest,
    borderWidth: 1,
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
  picker: {
    backgroundColor: colors.background,
    borderColor: colors.primaryLightest,
    borderRadius: 8,
    marginBottom: 10,
    zIndex: 1000,
  },
  dropdownContainer: {
    backgroundColor: colors.background,
    borderColor: colors.primaryLightest,
    borderRadius: 8,
    zIndex: 1000,
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
