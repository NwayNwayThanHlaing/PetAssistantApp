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
import { RRule } from "rrule";

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

// Maps recurrence strings to RRule frequencies
const recurrenceMap = {
  daily: RRule.DAILY,
  weekly: RRule.WEEKLY,
  monthly: RRule.MONTHLY,
  yearly: RRule.YEARLY,
};

// Function that generates the recurring dates for an event
const generateRecurringDates = (event) => {
  if (!event.recurrence || event.recurrence === "none") {
    return [event.date]; // No recurrence, return single date
  }

  const rule = new RRule({
    freq: recurrenceMap[event.recurrence],
    dtstart: new Date(event.date),
    until: event.endDate
      ? new Date(event.endDate.toDate ? event.endDate.toDate() : event.endDate)
      : undefined,
    count: event.endDate ? undefined : 50, // Limit recurrences to avoid infinite loops
  });

  const dates = rule.all();
  return dates.map((date) => date.toISOString().split("T")[0]);
};

// Function to fetch events
export const fetchEvents = async () => {
  try {
    const userId = getUserId();
    const eventsRef = collection(firestore, "users", userId, "events");
    const eventsSnapshot = await getDocs(eventsRef);

    const eventsData = {};

    eventsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const eventId = docSnap.id;

      // Generate the recurring dates
      const recurrenceDates = generateRecurringDates({
        date: data.date,
        recurrence: data.recurrence || "none",
        endDate: data.endDate || null,
      });

      // Add the event to each recurrence date
      recurrenceDates.forEach((date) => {
        if (!eventsData[date]) {
          eventsData[date] = [];
        }

        eventsData[date].push({
          id: eventId,
          title: data.title || "",
          time: data.time ? `${data.time.hours}:${data.time.minutes}` : "00:00",
          notes: data.notes || "",
          pets: data.relatedPets || [],
          appointment: data.appointment || false,
          recurrence: data.recurrence || "none",
          endDate: data.endDate || null,
          originalDate: data.date, // optional: store the original date
        });
      });
    });

    return eventsData;
  } catch (error) {
    console.error("Error fetching events from Firestore: ", error);
    throw error;
  }
};

export const addEvent = async (newEvent, selectedPets) => {
  try {
    // Get the user ID
    const userId = getUserId();
    const eventRef = collection(firestore, "users", userId, "events");

    // Ensure time values are properly provided
    const dateTime = newEvent.time instanceof Date ? newEvent.time : new Date();

    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();

    // Validate the selectedDate format (ensure it's 'YYYY-MM-DD')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newEvent.date)) {
      throw new Error("Invalid date format. Expected 'YYYY-MM-DD'.");
    }

    // Prepare recurrence and endDate
    const recurrence = newEvent.recurrence || "none";
    const endDate = newEvent.endDate
      ? newEvent.endDate instanceof Date
        ? Timestamp.fromDate(newEvent.endDate)
        : Timestamp.fromDate(new Date(newEvent.endDate)) // handles string date
      : null;

    // Add the new event to Firestore
    const docRef = await addDoc(eventRef, {
      title: newEvent.title?.trim() || "Untitled Event",
      date: newEvent.date,
      time: { hours, minutes },
      notes: newEvent.notes?.trim() || "",
      relatedPets: Array.isArray(selectedPets) ? selectedPets : [],
      appointment: newEvent.appointment || false,
      recurrence: recurrence,
      endDate: endDate,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      read: false,
    });

    console.log("Event added successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding event to Firestore:", error);
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
      appointment: selectedEvent.appointment || false,
      recurrence: selectedEvent.recurrence || "none",
      endDate: selectedEvent.endDate
        ? Timestamp.fromDate(
            selectedEvent.endDate instanceof Date
              ? selectedEvent.endDate
              : new Date(selectedEvent.endDate)
          )
        : null,
    };
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
