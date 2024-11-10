import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
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
  return (
    <Modal isVisible={isVisible} onBackdropPress={() => setIsVisible(false)}>
      {selectedEvent ? (
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Event Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            placeholderTextColor={colors.primaryLighter}
            value={selectedEvent.title}
            onChangeText={(text) =>
              setSelectedEvent({ ...selectedEvent, title: text })
            }
          />
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Notes"
            placeholderTextColor={colors.primaryLighter}
            value={selectedEvent.notes}
            onChangeText={(text) =>
              setSelectedEvent({ ...selectedEvent, notes: text })
            }
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
                  selectedEvent.pets.includes(item) && styles.petSelected,
                ]}
                onPress={() => {
                  setSelectedEvent((prevEvent) => ({
                    ...prevEvent,
                    pets: prevEvent.pets.includes(item)
                      ? prevEvent.pets.filter((pet) => pet !== item)
                      : [...prevEvent.pets, item],
                  }));
                }}
              >
                <Text
                  style={[
                    styles.petText,
                    selectedEvent.pets.includes(item) && styles.petSelectedText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.flatListContainer}
          />
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
        </View>
      ) : (
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>No Event Selected</Text>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setIsVisible(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
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
  petsSelectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 20,
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
  flatListContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
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
});

export default EventModal;
