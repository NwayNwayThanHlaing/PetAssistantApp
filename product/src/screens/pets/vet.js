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
  Alert,
} from "react-native";
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
import NewAppointmentModal from "./newAppointmentModal"; // Importing the NewAppointmentModal

const Vet = () => {
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState({
    vetName: "",
    date: new Date().toISOString().split("T")[0], // Set default date to today in 'yyyy-mm-dd' format
    time: { hours: 0, minutes: 0 }, // Set default time to midnight (12:00 AM)
    location: "",
    notes: "",
    selectedPets: [],
  });
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
        // Handle both string date or Timestamp
        let date = data.date;
        if (data.date instanceof Timestamp) {
          date = data.date.toDate();
        } else if (typeof data.date === "string") {
          const [year, month, day] = data.date.split("-").map(Number);
          date = new Date(year, month - 1, day);
        }

        return {
          id: doc.id,
          ...data,
          date: date, // Correctly assign the Date object
          time: data.time || { hours: 12, minutes: 0 },
        };
      });
      // Sort appointments by both date and time
      const sortedAppointments = fetchedAppointments.sort((a, b) => {
        // Handle potential null values for date to prevent crashes
        if (!a.date || !b.date) {
          return !a.date ? 1 : -1;
        }

        // Create Date objects that combine date and time for each appointment
        const aDateTime = new Date(
          a.date.getFullYear(),
          a.date.getMonth(),
          a.date.getDate(),
          a.time.hours,
          a.time.minutes
        );
        const bDateTime = new Date(
          b.date.getFullYear(),
          b.date.getMonth(),
          b.date.getDate(),
          b.time.hours,
          b.time.minutes
        );

        // Sort in ascending order by date and time
        return aDateTime - bDateTime;
      });
      setAppointments(sortedAppointments);
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
      const userId = auth.currentUser?.uid;

      if (!userId) {
        throw new Error("No user ID found");
      }

      const appointmentsRef = collection(
        firestore,
        `users/${userId}/appointments`
      );

      // Ensure the `date` is always in 'yyyy-mm-dd' format
      const updatedDate =
        typeof currentAppointment.date === "string"
          ? currentAppointment.date
          : currentAppointment.date.toISOString().split("T")[0];

      // Extract hours and minutes from `currentAppointment.time`
      const { hours, minutes } = currentAppointment.time;

      // Prepare the appointment data
      const appointmentData = {
        vetName: currentAppointment.vetName || "",
        location: currentAppointment.location || "",
        notes: currentAppointment.notes || "",
        petId: selectedPetId,
        relatedPets: currentAppointment.selectedPets || [],
        updatedAt: Timestamp.now(),
        time: { hours, minutes }, // Keep time as an object
        date: updatedDate, // Always store the date in 'yyyy-mm-dd' format
      };

      if (currentAppointment.id) {
        // Update existing appointment
        const appointmentDocRef = doc(
          firestore,
          `users/${userId}/appointments`,
          currentAppointment.id
        );
        await updateDoc(appointmentDocRef, appointmentData);
      } else {
        // Add new appointment
        await addDoc(appointmentsRef, {
          ...appointmentData,
          createdAt: Timestamp.now(),
        });
      }

      // Close the modal and reset the appointment form
      setIsModalVisible(false);
      setCurrentAppointment({
        vetName: "",
        date: new Date().toISOString().split("T")[0], // Reset date to today in 'yyyy-mm-dd' format
        time: { hours: 0, minutes: 0 },
        location: "",
        notes: "",
        selectedPets: [],
      });
      // Initialize currentAppointment state

      // Fetch updated appointments list
      fetchAppointments(selectedPetId);
    } catch (error) {
      console.error("Error saving appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Updated handleDeleteAppointment function
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

              console.log(
                `Appointment with id: ${appointmentId} deleted successfully.`
              );
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
            : item.date}
        </Text>
        <Text style={styles.appointmentDetails}>
          Time:{" "}
          {item.time
            ? `${
                item.time.hours % 12 === 0 ? 12 : item.time.hours % 12
              }:${item.time.minutes.toString().padStart(2, "0")} ${
                item.time.hours >= 12 ? "PM" : "AM"
              }`
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
              date:
                item.date instanceof Date
                  ? item.date.toISOString().split("T")[0] // Ensure date is in "yyyy-mm-dd" format
                  : item.date,
              time: item.time || { hours: 0, minutes: 0 },
              selectedPets: item.selectedPets || [],
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          <FlatList
            data={pets}
            renderItem={({ item }) => renderPetProfile(item)}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={styles.petListContent}
            showsHorizontalScrollIndicator={false}
          />
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
                  time: { hours: 0, minutes: 0 },
                  location: "",
                  notes: "",
                  selectedPets: [],
                });
                setIsModalVisible(true);
              }}
            >
              <Text style={styles.addAppointmentButtonText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {appointments.length === 0 ? (
            <Text
              style={{
                fontSize: 18,
                color: colors.secondary,
                textAlign: "center",
                marginTop: 30,
              }}
            >
              No appointments found.
            </Text>
          ) : (
            appointments.map(renderAppointment)
          )}
        </>
      )}

      <NewAppointmentModal
        isVisible={isModalVisible}
        setIsVisible={setIsModalVisible}
        currentAppointment={currentAppointment}
        setCurrentAppointment={setCurrentAppointment}
        handleSaveAppointment={handleSaveAppointment}
        pets={pets}
        loading={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 10,
    paddingBottom: 80,
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
  petListContent: {
    paddingRight: 10,
  },
  actionsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.primaryLightest,
    paddingTop: 10,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: "red",
    paddingVertical: 5,
    paddingHorizontal: 10,
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
