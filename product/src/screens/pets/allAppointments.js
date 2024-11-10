import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { firestore, auth } from "../../auth/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { colors } from "../../styles/Theme";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { SafeAreaView } from "react-native-safe-area-context";

const AllAppointments = () => {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState({}); // Using an object to store pet data by id for easy lookup

  useEffect(() => {
    const fetchPetsAndAppointments = async () => {
      setLoading(true);
      try {
        const userId = auth.currentUser.uid;
        const petsCollectionRef = collection(firestore, `users/${userId}/pets`);
        const appointmentsCollectionRef = collection(
          firestore,
          `users/${userId}/appointments`
        );

        // Fetch pets
        const petDocs = await getDocs(petsCollectionRef);
        const fetchedPets = {};
        petDocs.forEach((doc) => {
          fetchedPets[doc.id] = doc.data();
        });
        setPets(fetchedPets);

        // Fetch appointments
        const appointmentDocs = await getDocs(appointmentsCollectionRef);
        const fetchedAppointments = appointmentDocs.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((appointment) => dayjs(appointment.date).isAfter(dayjs())) // Filter to include only upcoming appointments
          .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()); // Sort by date in ascending order

        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPetsAndAppointments();
  }, []);

  const renderAppointment = (appointment) => {
    return (
      <View key={appointment.id} style={styles.appointmentContainer}>
        <Text style={styles.appointmentTitle}>
          Appointment with {appointment.vetName}
        </Text>
        <Text style={styles.appointmentDetails}>Date: {appointment.date}</Text>
        <Text style={styles.appointmentDetails}>Time: {appointment.time}</Text>
        <Text style={styles.appointmentDetails}>
          Location: {appointment.location}
        </Text>
        <Text style={styles.appointmentDetails}>
          Notes: {appointment.notes || "None"}
        </Text>
        <Text style={styles.appointmentDetails}>
          Pet: {pets[appointment.petId]?.name || "Unknown"}
        </Text>
      </View>
    );
  };

  const groupAppointmentsByDate = (appointments) => {
    return appointments.reduce((groups, appointment) => {
      const date = dayjs(appointment.date).format("YYYY-MM-DD");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
      return groups;
    }, {});
  };

  const groupedAppointments = groupAppointmentsByDate(appointments);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.header}>All Appointments</Text>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView>
            {Object.keys(groupedAppointments).length > 0 ? (
              Object.keys(groupedAppointments).map((date) => (
                <View key={date} style={styles.dateSection}>
                  <Text style={styles.dateHeader}>{date}</Text>
                  {groupedAppointments[date].map((appointment) =>
                    renderAppointment(appointment)
                  )}
                </View>
              ))
            ) : (
              <View style={styles.noAppointmentsContainer}>
                <Text style={styles.noAppointmentsText}>
                  No appointments available.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 15,
    textDecorationLine: "underline",
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appointmentContainer: {
    padding: 15,
    backgroundColor: colors.primaryLightest,
    borderRadius: 10,
    marginBottom: 15,
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
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  noAppointmentsText: {
    fontSize: 16,
    color: colors.primary,
  },
  dateSection: {
    marginBottom: 15,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.accent,
    marginBottom: 10,
  },
  back: {
    borderRadius: 8,
    marginTop: 10,
    marginLeft: 10,
    color: colors.accent,
    width: 100,
    alignSelf: "flex-start",
  },
});

export default AllAppointments;
