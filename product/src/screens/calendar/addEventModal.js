import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  const resetNewEvent = () => {
    setNewEvent({
      title: "",
      time: new Date(new Date().setHours(0, 0, 0, 0)),
      notes: "",
    });
    setSelectedPets([]);
  };

  const togglePetSelection = (petName) => {
    setSelectedPets((prevSelected) =>
      prevSelected.includes(petName)
        ? prevSelected.filter((pet) => pet !== petName)
        : [...prevSelected, petName]
    );
  };

  useEffect(() => {
    if (isVisible) {
      resetNewEvent();
    }
  }, [isVisible]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => setIsVisible(false)}
      style={styles.modalContainer}
      useNativeDriver={true}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notes"
              placeholderTextColor={colors.primaryLighter}
              value={newEvent.notes}
              onChangeText={(text) => setNewEvent({ ...newEvent, notes: text })}
              multiline
            />
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

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  addEvent();
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
          </ScrollView>
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
});

export default AddEventModal;
