import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
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
  const [loading, setLoading] = useState(false);
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
      }
    };
    fetchPets();
  }, []);

  // Fetch appointments for selected pet
  const fetchAppointments = async (petId) => {
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

  // Render Pet Profile
  const renderPetProfile = (item) => (
    <TouchableOpacity
      key={item.id}
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
  const renderAppointment = (item) => (
    <View key={item.id} style={styles.appointmentContainer}>
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
        {item.location && (
          <Text style={styles.appointmentDetails}>
            Location: {item.location}
          </Text>
        )}
        {item.notes && (
          <Text style={styles.appointmentDetails}>Notes: {item.notes}</Text>
        )}
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          <View style={styles.petListWrapper}>
            <FlatList
              data={pets}
              renderItem={({ item }) => renderPetProfile(item)}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={styles.petListContent}
              showsHorizontalScrollIndicator={false}
            />
          </View>
          {appointments.length === 0 ? (
            <Text
              style={{
                fontSize: 18,
                color: colors.secondary,
                textAlign: "center",
                marginTop: 10,
              }}
            >
              No appointments found.
            </Text>
          ) : (
            <View style={styles.actionsWrapper}>
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
          )}
          {appointments.map(renderAppointment)}
        </>
      )}
      {renderModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: colors.background,
  },
  addAppointmentButton: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "center",
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
  petListWrapper: {
    marginBottom: 10,
  },
  petListContent: {
    paddingRight: 10,
  },
  actionsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.primaryLightest,
    paddingTop: 10,
    marginBottom: 10,
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
});

export default Vet;
