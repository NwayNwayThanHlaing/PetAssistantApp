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
import { collection, getDocs, query, where } from "firebase/firestore";
import { colors } from "../../styles/Theme";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { SafeAreaView } from "react-native-safe-area-context";

const AllAppointments = () => {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState({});

  useEffect(() => {
    const fetchPetsAndAppointments = async () => {
      try {
        setLoading(true);
        const userId = auth.currentUser.uid;
        const petsCollectionRef = collection(firestore, `users/${userId}/pets`);
        const eventsCollectionRef = collection(
          firestore,
          `users/${userId}/events`
        );

        // Fetch pets
        const petDocs = await getDocs(petsCollectionRef);
        const fetchedPets = {};
        petDocs.forEach((doc) => {
          fetchedPets[doc.id] = doc.data();
        });
        setPets(fetchedPets);

        // Fetch events where appointment is true
        const eventsQuery = query(
          eventsCollectionRef,
          where("appointment", "==", true)
        );
        const eventDocs = await getDocs(eventsQuery);

        const fetchedAppointments = eventDocs.docs.map((doc) => {
          const data = doc.data();

          // Date is directly from Firestore as a string in "YYYY-MM-DD" format
          const date = data.date;

          // Extract `hours` and `minutes` from `time` and create a formatted time string
          const time =
            data.time &&
            typeof data.time.hours === "number" &&
            typeof data.time.minutes === "number"
              ? `${
                  data.time.hours % 12 === 0 ? 12 : data.time.hours % 12
                }:${data.time.minutes.toString().padStart(2, "0")} ${
                  data.time.hours >= 12 ? "PM" : "AM"
                }`
              : "12:00 AM";

          return {
            id: doc.id,
            ...data,
            date: date, // Use the string directly
            time: time, // Use the formatted time string
          };
        });

        // Today's date in "YYYY-MM-DD" format for comparison
        const today = dayjs().format("YYYY-MM-DD");

        // Filter and sort appointments to include future appointments or today
        const upcomingAppointments = fetchedAppointments
          .filter((appointment) => appointment.date >= today)
          .sort((a, b) => {
            if (a.date === b.date) {
              // If dates are the same, sort by time
              const [aHours, aMinutes] = a.time.split(/[:\s]/);
              const [bHours, bMinutes] = b.time.split(/[:\s]/);
              const aAmPm = a.time.includes("AM") ? "AM" : "PM";
              const bAmPm = b.time.includes("AM") ? "AM" : "PM";

              const aTotalMinutes =
                (parseInt(aHours) % 12) * 60 +
                parseInt(aMinutes) +
                (aAmPm === "PM" ? 720 : 0);
              const bTotalMinutes =
                (parseInt(bHours) % 12) * 60 +
                parseInt(bMinutes) +
                (bAmPm === "PM" ? 720 : 0);

              return aTotalMinutes - bTotalMinutes;
            }
            return a.date > b.date ? 1 : -1;
          });

        setAppointments(upcomingAppointments);
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
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.appointmentTitle}>
            {appointment.title || "Appointment"}
          </Text>

          <Text style={styles.appointmentDetails}>{appointment.time}</Text>
        </View>
        {appointment.notes && (
          <Text style={styles.appointmentDetails}>
            Notes: {appointment.notes}
          </Text>
        )}
        <Text style={styles.appointmentDetails}>
          Pets: {appointment.relatedPets?.join(", ") || "No pets"}
        </Text>
      </View>
    );
  };

  const groupAppointmentsByDate = (appointments) => {
    return appointments.reduce((groups, appointment) => {
      const date = appointment.date; // Already formatted as `YYYY-MM-DD`
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
      return groups;
    }, {});
  };

  const groupedAppointments = groupAppointmentsByDate(appointments);
  const formatDateWithDay = (dateString) => {
    const date = new Date(dateString); // Convert to Date object
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" }); // Get full day name
    const formattedDate = dateString.split("-").reverse().join("/"); // Format as dd/mm/yyyy
    return `${formattedDate}, ${dayName}`; // Combine day name and formatted date
  };

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
                  {/* Format the date with the day name */}
                  <Text style={styles.dateHeader}>
                    {formatDateWithDay(date)}
                  </Text>

                  {/* Render appointments for the date */}
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
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    padding: 10,
    textDecorationLine: "underline",
    width: "100%",
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
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  appointmentDetails: {
    fontSize: 16,
    color: colors.primary,
  },
  noAppointmentsContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },
  noAppointmentsText: {
    fontSize: 16,
    color: colors.primary,
  },
  dateSection: {
    marginBottom: 15,
    marginHorizontal: 10,
  },
  dateHeader: {
    fontSize: 18,
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
