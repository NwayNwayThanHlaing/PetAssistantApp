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
} from "react-native";
import { firestore, auth } from "../../auth/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import nothing from "../../../assets/nothing.png";
import dog from "../../../assets/dog.png";
import { colors } from "../../styles/Theme";
import { useNavigation } from "@react-navigation/native";

const Vet = () => {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [petsLoading, setPetsLoading] = useState(true); // New state
  const navigation = useNavigation();

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
        if (fetchedPets.length > 0) setSelectedPetId(fetchedPets[0].id);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setPetsLoading(false);
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const fetchedEvents = eventDocs.docs.map((doc) => {
        const data = doc.data();
        const date = new Date(data.date);
        return {
          id: doc.id, // Ensure ID is included
          ...doc.data(),
          date: new Date(doc.data().date), // Ensure date is a Date object
          time: doc.data().time || { hours: 12, minutes: 0 },
        };
      });

      const upcomingEvents = fetchedEvents
        .filter((event) => event.date >= today)
        .sort((a, b) => a.date - b.date);

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

  // Render pet profile
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
        ? appointment.date.toLocaleDateString("en-GB")
        : new Date(appointment.date).toLocaleDateString("en-GB");

    const hours = appointment.time.hours;
    const minutes = appointment.time.minutes.toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = (((hours + 11) % 12) + 1)
      .toString()
      .padStart(2, "0");
    const formattedTime = `${formattedHours}:${minutes} ${period}`;

    return (
      <View key={appointment.id} style={styles.appointmentContainer}>
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Text style={styles.appointmentTitle}>{appointment.title}</Text>

            <Text style={styles.appointmentDetails}>
              {formattedDate}, {formattedTime}
            </Text>
          </View>
          {appointment.notes && (
            <Text style={styles.appointmentDetails}>
              Notes: {appointment.notes}
            </Text>
          )}
        </View>
      </View>
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
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      {appointments.map(renderAppointment)}
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
  viewAllText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
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
    fontSize: 14,
    color: colors.primary,
  },
  petListContent: {
    paddingRight: 10,
  },
  actionsWrapper: {
    borderTopWidth: 1,
    borderTopColor: colors.primaryLightest,
    paddingTop: 10,
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
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  appointmentDetails: {
    fontSize: 16,
    color: colors.primary,
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
});

export default Vet;
