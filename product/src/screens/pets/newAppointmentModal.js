import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../../styles/Theme";

const NewAppointmentModal = ({
  isVisible,
  setIsVisible,
  currentAppointment,
  setCurrentAppointment,
  handleSaveAppointment,
  loading,
}) => {
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => setIsVisible(false)}
      style={styles.modalContainer}
      useNativeDriver={true}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <Text style={styles.modalHeader}>
              {currentAppointment.id ? "Edit Appointment" : "New Appointment"}
            </Text>

            {/* Vet Name Input */}
            <TextInput
              style={styles.input}
              placeholder="Vet Name"
              placeholderTextColor={colors.primaryLighter}
              value={currentAppointment.vetName}
              onChangeText={(text) =>
                setCurrentAppointment({ ...currentAppointment, vetName: text })
              }
            />
            {/* Date Picker */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 5,
                marginLeft: 5,
              }}
            >
              <Text style={styles.datePickerText}>Appointment Date: </Text>

              <DateTimePicker
                value={
                  currentAppointment.date
                    ? new Date(currentAppointment.date)
                    : new Date()
                }
                mode="date"
                display="default"
                style={{ marginBottom: 10 }}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setCurrentAppointment((prev) => ({
                      ...prev,
                      date: formatDate(selectedDate),
                    }));
                  }
                }}
              />
            </View>

            {/* Time Picker */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 5,
                marginLeft: 5,
              }}
            >
              <Text style={styles.datePickerText}>Appointment Time: </Text>

              <DateTimePicker
                value={
                  currentAppointment.time
                    ? new Date(
                        0,
                        0,
                        0,
                        currentAppointment.time.hours,
                        currentAppointment.time.minutes
                      )
                    : new Date()
                }
                mode="time"
                display="default"
                style={{ marginBottom: 10 }}
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setCurrentAppointment((prev) => ({
                      ...prev,
                      time: {
                        hours: selectedTime.getHours(),
                        minutes: selectedTime.getMinutes(),
                      },
                    }));
                  }
                }}
              />
            </View>

            {/* Location Input */}
            <TextInput
              style={styles.input}
              placeholder="Location"
              placeholderTextColor={colors.primaryLighter}
              value={currentAppointment.location}
              onChangeText={(text) =>
                setCurrentAppointment((prev) => ({
                  ...prev,
                  location: text,
                }))
              }
            />

            {/* Notes Input */}
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notes"
              placeholderTextColor={colors.primaryLighter}
              value={currentAppointment.notes}
              onChangeText={(text) =>
                setCurrentAppointment((prev) => ({
                  ...prev,
                  notes: text,
                }))
              }
              multiline
            />

            {/* Save and Cancel Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveAppointment}
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
  datePickerText: {
    color: colors.primary,
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
});

export default NewAppointmentModal;
