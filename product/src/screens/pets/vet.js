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
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import EventModal from "../calendar/updateEventModal";
import nothing from "../../../assets/nothing.png";
import dog from "../../../assets/dog.png";
import { colors } from "../../styles/Theme";
import { useNavigation } from "@react-navigation/native";

const Vet = () => {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigation = useNavigation();

  // Fetch pets
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

  // Fetch events for the selected pet
  const fetchAppointments = async (petName) => {
    try {
      setLoading(true);
      const userId = auth.currentUser.uid;
      const eventsRef = collection(firestore, `users/${userId}/events`);

      const q = query(
        eventsRef,
        where("relatedPets", "array-contains", petName),
        where("appointment", "==", true)
      );

      const eventDocs = await getDocs(q);
      const today = new Date(); // Get today's date
      today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison

      const fetchedEvents = eventDocs.docs.map((doc) => {
        const data = doc.data();
        const date = new Date(data.date);
        return {
          id: doc.id,
          ...data,
          date,
          time: data.time || { hours: 12, minutes: 0 },
        };
      });

      // Filter out past events and sort by date
      const upcomingEvents = fetchedEvents
        .filter((event) => event.date >= today) // Only include events from today or later
        .sort((a, b) => a.date - b.date); // Sort by date

      setAppointments(upcomingEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPetId) {
      const selectedPet = pets.find((pet) => pet.id === selectedPetId);
      if (selectedPet) {
        fetchAppointments(selectedPet.name);
      }
    }
  }, [selectedPetId]);

  // Update an event
  const updateEvent = async () => {
    if (!selectedEvent?.title) {
      alert("Event title is required.");
      return;
    }

    setUpdateLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const eventDocRef = doc(
        firestore,
        `users/${userId}/events`,
        selectedEvent.id
      );

      await updateDoc(eventDocRef, {
        ...selectedEvent,
        updatedAt: Timestamp.now(),
      });

      setIsModalVisible(false);
      fetchAppointments(pets.find((pet) => pet.id === selectedPetId)?.name);
    } catch (error) {
      console.error("Error updating event:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Delete an event
  const deleteEvent = async () => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleteLoading(true);
          try {
            const userId = auth.currentUser.uid;
            const eventDocRef = doc(
              firestore,
              `users/${userId}/events`,
              selectedEvent.id
            );

            await deleteDoc(eventDocRef);
            setIsModalVisible(false);
            fetchAppointments(
              pets.find((pet) => pet.id === selectedPetId)?.name
            );
          } catch (error) {
            console.error("Error deleting event:", error);
          } finally {
            setDeleteLoading(false);
          }
        },
      },
    ]);
  };

  // Render pet profile
  const renderPetProfile = (pet) => (
    <TouchableOpacity
      key={pet.id}
      onPress={() => setSelectedPetId(pet.id)}
      style={styles.petProfileContainer}
    >
      <Image
        source={{ uri: pet.imageUrl || dog }}
        style={[
          styles.petImage,
          selectedPetId === pet.id && styles.selectedPet,
        ]}
      />
      <Text style={styles.petName}>{pet.name}</Text>
    </TouchableOpacity>
  );

  // Render appointment
  const renderAppointment = (appointment) => {
    // Format date as dd/mm/yyyy
    const formattedDate =
      appointment.date instanceof Date
        ? appointment.date.toLocaleDateString("en-GB") // en-GB outputs dd/mm/yyyy
        : new Date(appointment.date).toLocaleDateString("en-GB");

    // Format time as hh:mm AM/PM
    const hours = appointment.time.hours;
    const minutes = appointment.time.minutes.toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = (((hours + 11) % 12) + 1)
      .toString()
      .padStart(2, "0"); // Convert to 12-hour format
    const formattedTime = `${formattedHours}:${minutes} ${period}`;

    return (
      <View key={appointment.id} style={styles.appointmentContainer}>
        <View>
          <Text style={styles.appointmentTitle}>{appointment.title}</Text>
          <Text style={styles.appointmentDetails}>Date: {formattedDate}</Text>
          <Text style={styles.appointmentDetails}>Time: {formattedTime}</Text>
        </View>

        <View style={{ flexDirection: "column" }}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setSelectedEvent({
                ...appointment,
                date:
                  appointment.date instanceof Date
                    ? appointment.date
                    : new Date(appointment.date),
                time: appointment.time || { hours: 12, minutes: 0 },
                selectedPets: appointment.selectedPets || [],
              });
              setIsModalVisible(true);
            }}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteAppointment(appointment.id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {pets.length === 0 ? (
            <>
              <Image
                source={nothing}
                style={{
                  width: 250,
                  height: 250,
                  alignSelf: "center",
                  marginTop: 70,
                  marginBottom: 40,
                }}
              />
              <Text
                style={{
                  fontSize: 18,
                  color: colors.secondary,
                  textAlign: "center",
                }}
              >
                No results found for appointments! {"\n"} Add a pet to get
                started.
              </Text>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    paddingVertical: 15,
                    marginTop: 40,
                  },
                ]}
                onPress={() => navigation.navigate("AddPet")}
              >
                <Text style={styles.addButtonText}>Add a Pet</Text>
              </TouchableOpacity>
            </>
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
            </>
          )}
          {appointments.map(renderAppointment)}
        </>
      )}

      <EventModal
        isVisible={isModalVisible}
        setIsVisible={setIsModalVisible}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        petNames={pets.map((pet) => pet.name)}
        updateEvent={updateEvent}
        deleteEvent={deleteEvent}
        updateLoading={updateLoading}
        deleteLoading={deleteLoading}
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
  addButton: {
    backgroundColor: colors.accent,
    padding: 5,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 15,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Vet;
