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
      const eventDate = data.date; // This should be in 'YYYY-MM-DD' format
      if (!eventsData[eventDate]) {
        eventsData[eventDate] = [];
      }

      eventsData[eventDate].push({
        id: doc.id,
        title: data.title || "",
        time: data.time ? `${data.time.hours}:${data.time.minutes}` : "00:00",
        notes: data.notes || "",
        pets: data.relatedPets || [],
      });
    });

    return eventsData;
  } catch (error) {
    console.error("Error fetching events from Firestore: ", error);
    throw error;
  }
};

export const addEvent = async (newEvent, selectedDate, selectedPets) => {
  try {
    // Get the user ID
    const userId = getUserId();
    const eventRef = collection(firestore, "users", userId, "events");

    // Ensure date and time values are properly provided
    const dateTime = newEvent.time instanceof Date ? newEvent.time : new Date();

    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();

    // Validate the selectedDate format (ensure it's 'YYYY-MM-DD')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      throw new Error("Invalid date format. Expected 'YYYY-MM-DD'.");
    }

    // Add the new event to Firestore
    const docRef = await addDoc(eventRef, {
      title: newEvent.title?.trim() || "Untitled Event", // Use title if provided, otherwise use default
      time: { hours, minutes }, // Store time as hours and minutes
      notes: newEvent.notes?.trim() || "", // Use notes if provided, otherwise use empty string
      relatedPets: Array.isArray(selectedPets) ? selectedPets : [], // Ensure relatedPets is an array
      date: selectedDate, // Must be in 'YYYY-MM-DD' format
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

    if (!selectedEvent.id) {
      throw new Error("No event ID provided for update");
    }

    const eventDocRef = doc(
      firestore,
      "users",
      userId,
      "events",
      selectedEvent.id
    );

    let hours, minutes;

    if (selectedEvent.dateTime instanceof Date) {
      // Extract hours and minutes if dateTime is a valid Date object
      hours = selectedEvent.dateTime.getHours();
      minutes = selectedEvent.dateTime.getMinutes();
    } else if (selectedEvent.time) {
      // If time is provided as an object, use those values
      hours = selectedEvent.time.hours || 0;
      minutes = selectedEvent.time.minutes || 0;
    } else {
      // Default values
      hours = 0;
      minutes = 0;
    }

    // Convert dateTime to a format suitable for Firestore
    const updatedDate = selectedEvent.dateTime
      ? selectedEvent.dateTime.toISOString().split("T")[0] // Get the 'YYYY-MM-DD' format for the date
      : selectedEvent.date;

    const updatedData = {
      title: selectedEvent.title || "",
      notes: selectedEvent.notes || "",
      relatedPets: selectedEvent.relatedPets || [],
      updatedAt: Timestamp.now(),
      time: { hours, minutes },
      date: updatedDate, // Update the date here to Firestore in 'YYYY-MM-DD' format
    };

    // Ensure all fields are updated correctly
    await updateDoc(eventDocRef, updatedData);
  } catch (error) {
    console.error("Error updating event: ", error);
    throw error;
  }
};

// Function to delete an event
export const deleteEvent = async (eventId) => {
  try {
    const userId = getUserId();
    if (!eventId) {
      throw new Error("No event ID provided for deletion");
    }
    const eventDocRef = doc(firestore, "users", userId, "events", eventId);
    await deleteDoc(eventDocRef);
  } catch (error) {
    console.error("Error deleting event: ", error);
    throw error;
  }
};
