import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
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
  const togglePetSelection = (petName) => {
    setSelectedPets((prevSelected) =>
      prevSelected.includes(petName)
        ? prevSelected.filter((pet) => pet !== petName)
        : [...prevSelected, petName]
    );
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={() => setIsVisible(false)}>
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
              style={
                selectedPets.includes(item)
                  ? [styles.petButton, styles.petSelected]
                  : styles.petButton
              }
              onPress={() => togglePetSelection(item)}
            >
              <Text
                style={
                  selectedPets.includes(item)
                    ? [styles.petText, styles.petSelectedText]
                    : styles.petText
                }
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.flatListContainer}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setIsVisible(false)}
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
  );
};

const styles = StyleSheet.create({
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
  flatListContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
});

export default AddEventModal;
