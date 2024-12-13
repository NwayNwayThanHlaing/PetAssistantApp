import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { firestore, auth } from "../../auth/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import nothing from "../../../assets/nothing.png";
import dog from "../../../assets/dog.png";
import { colors } from "../../styles/Theme";
import { useNavigation } from "@react-navigation/native";
import { updateEvent, deleteEvent } from "../calendar/firestoreService";
import EventModal from "../calendar/updateEventModal";
const Booking = () => {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("all");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [petsLoading, setPetsLoading] = useState(true);
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch pets
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setPetsLoading(true);
        const userId = auth.currentUser.uid;
        const petsCollectionRef = collection(firestore, `users/${userId}/pets`);
        const petDocs = await getDocs(petsCollectionRef);
        const fetchedPets = petDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPets(fetchedPets);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setPetsLoading(false);
      }
    };
    fetchPets();
  }, []);

  // Fetch events for the selected pet
  const fetchAppointments = async (petIdentifier) => {
    try {
      setLoading(true);
      const userId = auth.currentUser.uid;
      const eventsRef = collection(firestore, `users/${userId}/events`);
      let q;

      // Check if the request is for "all" or a specific pet
      if (petIdentifier === "all") {
        // Fetch all appointments
        q = query(eventsRef, where("appointment", "==", true));
      } else {
        // Fetch appointments for a specific pet
        const selectedPet = pets.find((pet) => pet.id === petIdentifier);
        if (selectedPet) {
          q = query(
            eventsRef,
            where("relatedPets", "array-contains", selectedPet.name),
            where("appointment", "==", true)
          );
        } else {
          return; // If the selected pet doesn't exist, exit
        }
      }

      const eventDocs = await getDocs(q);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const fetchedEvents = eventDocs.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
          date: new Date(doc.data().date),
          time: doc.data().time || { hours: 12, minutes: 0 },
        };
      });

      const upcomingEvents = fetchedEvents
        .filter((event) => event.date >= today)
        .sort((a, b) => {
          // Compare dates first
          const dateComparison = a.date - b.date; // Compare the date part first
          if (dateComparison !== 0) {
            return dateComparison; // If dates are different, sort by date
          }

          // If the dates are the same, compare the time
          const aTimeInMinutes = a.time.hours * 60 + a.time.minutes;
          const bTimeInMinutes = b.time.hours * 60 + b.time.minutes;

          return aTimeInMinutes - bTimeInMinutes; // Sort by time within the same date
        });

      setAppointments(upcomingEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPetId) {
      fetchAppointments(selectedPetId);
    }
  }, [selectedPetId, pets]);

  // Render pet profiles
  const renderPetProfile = (pet) => {
    const imageSource = pet.imageUrl ? { uri: pet.imageUrl } : dog;

    return (
      <TouchableOpacity
        key={pet.id}
        onPress={() => setSelectedPetId(pet.id)}
        style={styles.petProfileContainer}
      >
        <Image
          source={imageSource}
          style={[
            styles.petImage,
            selectedPetId === pet.id && styles.selectedPet,
          ]}
        />
        <Text style={styles.petName}>{pet.name}</Text>
      </TouchableOpacity>
    );
  };

  // Render appointment
  const renderAppointment = (appointment) => {
    const formattedDate =
      appointment.date instanceof Date
        ? `${appointment.date.getDate()}/${
            appointment.date.getMonth() + 1
          }/${appointment.date.getFullYear().toString().slice(-2)}`
        : `${new Date(appointment.date).getDate()}/${
            new Date(appointment.date).getMonth() + 1
          }/${new Date(appointment.date).getFullYear().toString().slice(-2)}`;

    const hours = appointment.time.hours;
    const minutes = appointment.time.minutes.toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = (((hours + 11) % 12) + 1).toString();
    const formattedTime = `${formattedHours}:${minutes} ${period}`;

    return (
      <TouchableOpacity
        key={appointment.id}
        style={styles.appointmentContainer}
        onPress={() => {
          setSelectedEvent(appointment);
          setIsModalVisible(true);
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <View>
            <Text style={styles.appointmentTitle}>{appointment.title}</Text>

            {appointment.relatedPets && (
              <Text style={styles.appointmentDetails}>
                Pets: {appointment.relatedPets.join(", ")}
              </Text>
            )}
            {appointment.notes && (
              <Text style={styles.appointmentDetails}>
                Notes: {appointment.notes}
              </Text>
            )}
          </View>

          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <Text style={styles.appointmentDetails}>
              {formattedDate}, {formattedTime}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {petsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : pets.length === 0 ? (
        <>
          <Image
            source={nothing}
            style={{
              width: 150,
              height: 150,
              alignSelf: "center",
              marginTop: 100,
              marginBottom: 30,
            }}
          />
          <Text
            style={{
              fontSize: 18,
              color: colors.secondary,
              textAlign: "center",
            }}
          >
            No results found for appointments! {"\n"} Add a pet to get started.
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
            data={[{ id: "all", name: "All" }, ...pets]}
            renderItem={({ item }) =>
              item.id === "all" ? (
                <TouchableOpacity
                  onPress={() => setSelectedPetId("all")}
                  style={styles.petProfileContainer}
                >
                  <Image
                    source={dog}
                    style={[
                      styles.petImage,
                      selectedPetId === "all" && styles.selectedPet,
                    ]}
                  />
                  <Text style={styles.petName}>All</Text>
                </TouchableOpacity>
              ) : (
                renderPetProfile(item)
              )
            }
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={styles.petListContent}
            showsHorizontalScrollIndicator={false}
          />
        </>
      )}
      {appointments.map(renderAppointment)}
      <EventModal
        isVisible={isModalVisible}
        setIsVisible={setIsModalVisible}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        petNames={pets.map((pet) => pet.name)} // Provide pet names for selection
        updateEvent={async () => {
          if (selectedEvent) {
            try {
              setLoading(true);
              await updateEvent(selectedEvent); // Use the imported updateEvent function
              setIsModalVisible(false); // Close the modal first to avoid intermediate issues
              await fetchAppointments(selectedPetId); // Fetch appointments for selected pet or all
            } catch (error) {
              console.error("Error updating event:", error);
            } finally {
              setSelectedEvent(null); // Clear the selected event after fetching
              setLoading(false);
            }
          }
        }}
        deleteEvent={() => {
          if (selectedEvent && selectedEvent.id) {
            Alert.alert(
              "Confirm Deletion",
              "Are you sure you want to delete this appointment?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => console.log("Delete cancelled"),
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      setLoading(true);
                      await deleteEvent(selectedEvent.id);
                      setIsModalVisible(false);
                      await fetchAppointments(selectedPetId);
                    } catch (error) {
                      console.error("Error deleting event:", error);
                    } finally {
                      setSelectedEvent(null);
                      setLoading(false);
                    }
                  },
                },
              ],
              { cancelable: true }
            );
          }
        }}
        updateLoading={loading}
        deleteLoading={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 10,
    paddingHorizontal: 15,
    paddingBottom: 80,
    backgroundColor: colors.background,
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
    height: 80,
  },
  selectedPet: {
    borderColor: colors.accent,
    borderWidth: 3,
    height: 60,
    borderRadius: 100,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 35,
  },
  petName: {
    marginTop: 5,
    fontSize: 14,
    color: colors.primary,
  },
  petListContent: {
    paddingRight: 10,
  },
  appointmentContainer: {
    padding: 15,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.primaryLightest,
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
    marginBottom: 3,
  },
  addButton: {
    backgroundColor: colors.accent,
    padding: 5,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 15,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAllContainer: {
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
    height: 90,
  },

  viewAllImage: {
    width: 60,
    height: 60,
    padding: 10,
    borderRadius: 35,
  },
});

export default Booking;
