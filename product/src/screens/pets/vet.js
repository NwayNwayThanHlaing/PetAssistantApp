import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { firestore, auth } from "../../auth/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { colors } from "../../styles/Theme";

const Vet = () => {
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState({
    vetName: "",
    date: new Date(),
    time: new Date(),
    location: "",
    notes: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Fetch pets from Firestore
  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      try {
        const userId = auth.currentUser.uid;
        const petsCollectionRef = collection(firestore, `users/${userId}/pets`);
        const petDocs = await getDocs(petsCollectionRef);
        const fetchedPets = petDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPets(fetchedPets);
        if (fetchedPets.length > 0) setSelectedPetId(fetchedPets[0].id);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  // Fetch appointments for selected pet
  const fetchAppointments = async (petId) => {
    setLoading(true);
    try {
      const appointmentsRef = collection(
        firestore,
        `users/${auth.currentUser.uid}/appointments`
      );
      const q = query(appointmentsRef, where("petId", "==", petId));
      const appointmentDocs = await getDocs(q);
      const fetchedAppointments = appointmentDocs.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date:
            data.date && data.date.seconds
              ? new Date(data.date.seconds * 1000)
              : new Date(),
          time:
            data.time && data.time.seconds
              ? new Date(data.time.seconds * 1000)
              : new Date(),
        };
      });
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPetId) {
      fetchAppointments(selectedPetId);
    }
  }, [selectedPetId]);

  // Handle Save Appointment (new or update)
  const handleSaveAppointment = async () => {
    if (!currentAppointment.vetName.trim()) {
      alert("Vet name is required.");
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const appointmentsRef = collection(
        firestore,
        `users/${userId}/appointments`
      );

      if (currentAppointment.id) {
        // Update existing appointment
        const appointmentDocRef = doc(
          firestore,
          `users/${userId}/appointments`,
          currentAppointment.id
        );
        await updateDoc(appointmentDocRef, {
          ...currentAppointment,
          petId: selectedPetId,
          updatedAt: Timestamp.now(),
        });
      } else {
        // Add new appointment
        await addDoc(appointmentsRef, {
          ...currentAppointment,
          petId: selectedPetId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
      setIsModalVisible(false);
      setCurrentAppointment({
        vetName: "",
        date: new Date(),
        time: new Date(),
        location: "",
        notes: "",
      });

      // Fetch updated appointments list
      fetchAppointments(selectedPetId);
    } catch (error) {
      console.error("Error saving appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Appointment
  const handleDeleteAppointment = async (appointmentId) => {
    Alert.alert(
      "Delete Appointment",
      "Are you sure you want to delete this appointment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const userId = auth.currentUser.uid;
              const appointmentDocRef = doc(
                firestore,
                `users/${userId}/appointments`,
                appointmentId
              );
              await deleteDoc(appointmentDocRef);
              setAppointments((prev) =>
                prev.filter((item) => item.id !== appointmentId)
              );

              // Fetch updated appointments list
              fetchAppointments(selectedPetId);
            } catch (error) {
              console.error("Error deleting appointment:", error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Render Pet Profile
  const renderPetProfile = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedPetId(item.id)}
      style={styles.petProfileContainer}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={[
          styles.petImage,
          selectedPetId === item.id && styles.selectedPet,
        ]}
      />
      <Text style={styles.petName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render Appointment
  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentContainer}>
      <View>
        <Text style={styles.appointmentTitle}>
          Appointment with {item.vetName}
        </Text>
        <Text style={styles.appointmentDetails}>
          Date:{" "}
          {item.date instanceof Date
            ? item.date.toLocaleDateString()
            : "Invalid Date"}
        </Text>
        <Text style={styles.appointmentDetails}>
          Time:{" "}
          {item.time instanceof Date
            ? item.time.toLocaleTimeString()
            : "Invalid Time"}
        </Text>
        <Text style={styles.appointmentDetails}>Location: {item.location}</Text>
        <Text style={styles.appointmentDetails}>
          Notes: {item.notes || "None"}
        </Text>
      </View>
      <View style={styles.appointmentActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setCurrentAppointment({
              ...item,
              date: item.date instanceof Date ? item.date : new Date(),
              time: item.time instanceof Date ? item.time : new Date(),
            });
            setIsModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAppointment(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Modal for Adding or Editing Appointments
  const renderModal = () => (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      onRequestClose={() => setIsModalVisible(false)}
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
              setCurrentAppointment((prev) => ({
                ...prev,
                vetName: text,
              }))
            }
          />
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.input}
          >
            <Text>
              Date:{" "}
              {currentAppointment.date instanceof Date
                ? currentAppointment.date.toLocaleDateString()
                : ""}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={
                currentAppointment.date instanceof Date
                  ? currentAppointment.date
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setCurrentAppointment((prev) => ({
                    ...prev,
                    date: selectedDate,
                  }));
                }
              }}
            />
          )}
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            style={styles.input}
          >
            <Text>
              Time:{" "}
              {currentAppointment.time instanceof Date
                ? currentAppointment.time.toLocaleTimeString()
                : ""}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={
                currentAppointment.time instanceof Date
                  ? currentAppointment.time
                  : new Date()
              }
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  setCurrentAppointment((prev) => ({
                    ...prev,
                    time: selectedTime,
                  }));
                }
              }}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={currentAppointment.location}
            onChangeText={(text) =>
              setCurrentAppointment((prev) => ({
                ...prev,
                location: text,
              }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Notes"
            value={currentAppointment.notes}
            onChangeText={(text) =>
              setCurrentAppointment((prev) => ({
                ...prev,
                notes: text,
              }))
            }
          />
          <Button title="Save" onPress={handleSaveAppointment} />
          <Button
            title="Cancel"
            color="red"
            onPress={() => setIsModalVisible(false)}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View
      style={{
        padding: 10,
      }}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <>
              <FlatList
                data={pets}
                renderItem={renderPetProfile}
                keyExtractor={(item) => item.id}
                horizontal
                style={styles.petList}
                contentContainerStyle={styles.petListContent}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderTopWidth: 1,
                  borderTopColor: colors.primaryLightest,
                  paddingTop: 10,
                  marginBottom: 10,
                }}
              >
                <TouchableOpacity
                  style={styles.addAppointmentButton}
                  onPress={() => navigation.navigate("AllAppointments")}
                >
                  <Text style={styles.addAppointmentButtonText}>View All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addAppointmentButton}
                  onPress={() => {
                    setCurrentAppointment({
                      vetName: "",
                      date: new Date(),
                      time: new Date(),
                      location: "",
                      notes: "",
                    });
                    setIsModalVisible(true);
                  }}
                >
                  <Text style={styles.addAppointmentButtonText}>+ Add New</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        />
      )}
      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  addAppointmentButton: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
  },
  addAppointmentButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  petProfileContainer: {
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
    height: 90,
  },
  selectedPet: {
    borderColor: colors.accent,
    borderWidth: 3,
    height: 70,
    borderRadius: 100,
  },
  petImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  petName: {
    marginTop: 5,
    fontSize: 12,
    color: colors.primary,
  },
  petList: {
    maxHeight: 100,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: "red",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  appointmentContainer: {
    padding: 15,
    backgroundColor: colors.primaryLightest,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    marginBottom: 10,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  appointmentDetails: {
    fontSize: 14,
    color: colors.primary,
  },
  appointmentActions: {
    marginTop: 10,
    alignSelf: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
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
  pickerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default Vet;
