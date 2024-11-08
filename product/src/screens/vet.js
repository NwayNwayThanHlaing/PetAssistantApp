import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { firestore, auth } from "../auth/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { colors } from "../styles/Theme";

const Vet = () => {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (selectedPetId) {
      const fetchAppointments = async () => {
        setLoading(true);
        try {
          const appointmentsRef = collection(
            firestore,
            `users/${auth.currentUser.uid}/appointments`
          );
          const q = query(appointmentsRef, where("petId", "==", selectedPetId));
          const appointmentDocs = await getDocs(q);
          const fetchedAppointments = appointmentDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAppointments(fetchedAppointments);
        } catch (error) {
          console.error("Error fetching appointments:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAppointments();
    }
  }, [selectedPetId]);

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

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentContainer}>
      <Text style={styles.appointmentTitle}>
        Appointment with {item.vetName}
      </Text>
      <Text style={styles.appointmentDetails}>Date: {item.date}</Text>
      <Text style={styles.appointmentDetails}>Time: {item.time}</Text>
      <Text style={styles.appointmentDetails}>Location: {item.location}</Text>
      <Text style={styles.appointmentDetails}>
        Notes: {item.notes || "None"}
      </Text>
    </View>
  );
  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {/* Horizontal list of pets */}
          <FlatList
            data={pets}
            renderItem={renderPetProfile}
            keyExtractor={(item) => item.id}
            horizontal
            style={styles.petList}
            contentContainerStyle={styles.petListContent}
            showsHorizontalScrollIndicator={false}
          />

          {/* Conditionally show appointments or "No Appointments" message */}
          {appointments.length > 0 ? (
            <FlatList
              data={appointments}
              renderItem={renderAppointment}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.appointmentList}
              style={styles.appointmentsContainer}
            />
          ) : (
            <View style={styles.noAppointmentsContainer}>
              <Text style={styles.noAppointmentsText}>
                No appointments for this pet.
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: 10,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  petList: {
    marginBottom: 15,
  },
  petProfileContainer: {
    alignItems: "center",
    marginRight: 10,
    paddingVertical: 5,
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
  appointmentList: {
    flex: 1,
  },
  appointmentContainer: {
    padding: 15,
    backgroundColor: colors.accent,
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
  noAppointmentsContainer: {
    backgroundColor: colors.primaryLightest,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  noAppointmentsText: {
    fontSize: 16,
    color: colors.primary,
  },
});

export default Vet;
