import { Alert } from "react-native";
import { firestore } from "../auth/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

// Fetch user events from Firestore
export const fetchUserEvents = async (userId) => {
  try {
    const eventsCollection = collection(firestore, "users", userId, "events");
    const eventsSnapshot = await getDocs(eventsCollection);
    const events = eventsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return events;
  } catch (error) {
    console.error("Error fetching user events: ", error);
    Alert.alert("Error fetching user events", error.message);
    return [];
  }
};

export const fetchUserVetAppointments = async (userId) => {
  try {
    const appointmentsCollection = collection(
      firestore,
      "users",
      userId,
      "appointments"
    );
    const appointmentsSnapshot = await getDocs(appointmentsCollection);
    const appointments = await Promise.all(
      appointmentsSnapshot.docs.map(async (appointmentDoc) => {
        const data = appointmentDoc.data();
        const petId = data.petId;
        let petName = "Unknown pet";
        if (petId) {
          try {
            const petDocRef = doc(firestore, "users", userId, "pets", petId);
            const petDoc = await getDoc(petDocRef);
            if (petDoc.exists()) {
              petName = petDoc.data().name;
            }
          } catch (error) {
            console.error("Error fetching pet name: ", error);
          }
        }
        return { id: appointmentDoc.id, type: "vet", petName, ...data };
      })
    );
    return appointments;
  } catch (error) {
    console.error("Error fetching vet appointments: ", error);
    Alert.alert("Error fetching vet appointments", error.message);
    return [];
  }
};

// Fetch user data
export const fetchUserData = async (userId) => {
  try {
    const userDoc = doc(firestore, "users", userId);
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      Alert.alert("Error", "No user data found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
    Alert.alert("Error fetching user data", error.message);
    return null;
  }
};
