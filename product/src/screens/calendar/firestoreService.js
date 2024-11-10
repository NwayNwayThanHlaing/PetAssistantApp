import { firestore, auth } from "../../auth/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import dayjs from "dayjs";

// Utility function to get the current user ID
const getUserId = () => {
  if (auth.currentUser) {
    return auth.currentUser.uid;
  } else {
    throw new Error("No user authenticated");
  }
};

// Function to fetch pet names
export const fetchPetNames = async () => {
  try {
    const userId = getUserId();
    const petRef = collection(firestore, "users", userId, "pets");
    const petSnapshot = await getDocs(petRef);
    return petSnapshot.docs.map((doc) => doc.data().name);
  } catch (error) {
    console.error("Error fetching pet names: ", error);
    throw error;
  }
};

// Function to fetch events
export const fetchEvents = async () => {
  try {
    const userId = getUserId();
    const eventsRef = collection(firestore, "users", userId, "events");
    const eventsSnapshot = await getDocs(eventsRef);

    const eventsData = {};
    eventsSnapshot.forEach((doc) => {
      const data = doc.data();
      const eventDate = dayjs(data.date).format("YYYY-MM-DD");
      if (!eventsData[eventDate]) {
        eventsData[eventDate] = [];
      }

      eventsData[eventDate].push({
        id: doc.id,
        title: data.title,
        time: data.time.toDate(),
        notes: data.notes,
        pets: data.relatedPets || [],
      });
    });

    return eventsData;
  } catch (error) {
    console.error("Error fetching events from Firestore: ", error);
    throw error;
  }
};

// Function to add a new event
export const addEvent = async (newEvent, selectedDate, selectedPets) => {
  try {
    const userId = getUserId();
    const eventRef = collection(firestore, "users", userId, "events");
    const docRef = await addDoc(eventRef, {
      title: newEvent.title,
      time: Timestamp.fromDate(newEvent.time),
      notes: newEvent.notes,
      relatedPets: selectedPets,
      date: selectedDate,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id; // Return the document ID for further use
  } catch (error) {
    console.error("Error adding event to Firestore: ", error);
    throw error;
  }
};

// Function to update an event
export const updateEvent = async (selectedEvent) => {
  try {
    const userId = getUserId();
    const eventDocRef = doc(
      firestore,
      "users",
      userId,
      "events",
      selectedEvent.id
    );
    await updateDoc(eventDocRef, {
      title: selectedEvent.title,
      time: Timestamp.fromDate(selectedEvent.time),
      notes: selectedEvent.notes,
      relatedPets: selectedEvent.pets || [],
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating event: ", error);
    throw error;
  }
};

// Function to delete an event
export const deleteEvent = async (eventId) => {
  try {
    const userId = getUserId();
    const eventDocRef = doc(firestore, "users", userId, "events", eventId);
    await deleteDoc(eventDocRef);
  } catch (error) {
    console.error("Error deleting event: ", error);
    throw error;
  }
};
