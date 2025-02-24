import { Alert } from "react-native";
import { firestore } from "../auth/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  getFirestore,
} from "firebase/firestore";

// Fetch events from Firestore
export const fetchUserEvents = async (userId) => {
  try {
    const eventsCollection = collection(firestore, `users/${userId}/events`);
    const eventsSnapshot = await getDocs(eventsCollection);

    if (eventsSnapshot.empty) {
      return [];
    }

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

// Fetch user data from Firestore
export const fetchUserData = async (userId) => {
  if (!userId) {
    console.warn("Invalid user ID provided. Cannot fetch user data.");
    return null;
  }

  try {
    const userDoc = doc(firestore, `users/${userId}`);
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      Alert.alert("Error", "No user data found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
    Alert.alert("Error fetching user data", error.message);
    return null;
  }
};

const db = getFirestore();

export const updateEventReadStatus = async (userId, eventId, readStatus) => {
  try {
    const eventRef = doc(db, "users", userId, "events", eventId);
    await updateDoc(eventRef, { read: readStatus });
  } catch (error) {
    console.error("Error updating read status:", error);
  }
};
