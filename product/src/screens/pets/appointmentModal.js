import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
} from "react-native";
import { colors } from "../../styles/Theme";

const AppointmentModal = ({
  isVisible, // Correct naming for compatibility
  setIsVisible, // Correct naming for compatibility
  currentAppointment,
  setCurrentAppointment,
  handleSaveAppointment,
  pets, // Accept pets as a prop
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  // Date Picker Handler
  const handleDateChange = (event, selectedDate) => {
    setDatePickerVisibility(false);
    if (selectedDate) {
      setCurrentAppointment({
        ...currentAppointment,
        date: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  // Time Picker Handler
  const handleTimeChange = (event, selectedTime) => {
    setTimePickerVisibility(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, "0");
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
      setCurrentAppointment({
        ...currentAppointment,
        time: `${hours}:${minutes}`,
      });
    }
  };

  // Toggle pet selection
  const togglePetSelection = (petId) => {
    const isSelected = currentAppointment.selectedPets.includes(petId);
    const updatedSelectedPets = isSelected
      ? currentAppointment.selectedPets.filter((id) => id !== petId)
      : [...currentAppointment.selectedPets, petId];

    setCurrentAppointment({
      ...currentAppointment,
      selectedPets: updatedSelectedPets,
    });
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={() => setIsVisible(false)}
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {currentAppointment.id ? "Edit Appointment" : "New Appointment"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Vet Name"
            value={currentAppointment.vetName}
            onChangeText={(text) =>
              setCurrentAppointment({ ...currentAppointment, vetName: text })
            }
          />

          {/* Date Picker */}
          <TouchableOpacity
            onPress={() => setDatePickerVisibility(true)}
            style={styles.datePickerButton}
          >
            <Text style={styles.datePickerText}>
              {currentAppointment.date
                ? `Date: ${currentAppointment.date}`
                : "Select Date"}
            </Text>
          </TouchableOpacity>
          {isDatePickerVisible && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Time Picker */}
          <TouchableOpacity
            onPress={() => setTimePickerVisibility(true)}
            style={styles.datePickerButton}
          >
            <Text style={styles.datePickerText}>
              {currentAppointment.time
                ? `Time: ${currentAppointment.time}`
                : "Select Time"}
            </Text>
          </TouchableOpacity>
          {isTimePickerVisible && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Location"
            value={currentAppointment.location}
            onChangeText={(text) =>
              setCurrentAppointment({ ...currentAppointment, location: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Notes"
            value={currentAppointment.notes}
            onChangeText={(text) =>
              setCurrentAppointment({ ...currentAppointment, notes: text })
            }
          />

          {/* Pet Selection */}
          <Text style={styles.modalSubtitle}>Select Pets</Text>
          <ScrollView style={styles.petSelectionContainer}>
            {pets && pets.length > 0 ? (
              pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  onPress={() => togglePetSelection(pet.id)}
                  style={[
                    styles.petButton,
                    currentAppointment.selectedPets.includes(pet.id)
                      ? styles.petSelected
                      : null,
                  ]}
                >
                  <Text
                    style={
                      currentAppointment.selectedPets.includes(pet.id)
                        ? styles.petSelectedText
                        : styles.petText
                    }
                  >
                    {pet.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noPetsText}>No pets available</Text>
            )}
          </ScrollView>

          <Button title="Save" onPress={handleSaveAppointment} />
          <Button
            title="Cancel"
            color="red"
            onPress={() => setIsVisible(false)}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    marginBottom: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  datePickerButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  datePickerText: {
    color: colors.primary,
  },
  petSelectionContainer: {
    maxHeight: 150,
    marginBottom: 15,
  },
  petButton: {
    backgroundColor: colors.primaryLightest,
    padding: 10,
    borderRadius: 8,
    marginRight: 5,
    marginBottom: 5,
  },
  petSelected: {
    backgroundColor: colors.accent,
  },
  petText: {
    color: colors.primary,
    fontSize: 14,
  },
  petSelectedText: {
    color: "white",
    fontWeight: "bold",
  },
  noPetsText: {
    textAlign: "center",
    color: colors.primary,
    marginBottom: 10,
  },
});

export default AppointmentModal;
