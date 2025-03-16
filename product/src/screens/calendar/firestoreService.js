import { firestore, auth } from "../../auth/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
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
  if (!event.date) {
    console.warn("Missing date on event:", event);
    return [];
  }

  const startDate = new Date(event.date);
  if (isNaN(startDate.getTime())) {
    console.warn("Invalid startDate:", event.date);
    return [];
  }

  let untilDate;
  if (event.endDate) {
    if (typeof event.endDate.toDate === "function") {
      untilDate = event.endDate.toDate();
    } else if (
      event.endDate.seconds !== undefined &&
      event.endDate.nanoseconds !== undefined
    ) {
      untilDate = new Date(event.endDate.seconds * 1000);
    } else if (event.endDate instanceof Date) {
      untilDate = event.endDate;
    } else {
      untilDate = new Date(event.endDate);
    }

    if (isNaN(untilDate.getTime())) {
      console.warn("Invalid endDate:", event.endDate);
      untilDate = undefined;
    }
  }

  if (!event.recurrence || event.recurrence === "none") {
    return [event.date];
  }

  const ruleOptions = {
    freq: recurrenceMap[event.recurrence],
    dtstart: startDate,
  };

  if (untilDate) {
    ruleOptions.until = untilDate;
  } else {
    ruleOptions.count = 50;
  }

  const rule = new RRule(ruleOptions);
  const dates = rule.all().map((date) => date.toISOString().split("T")[0]);

  const exceptions = event.exceptions || [];
  return dates.filter((date) => !exceptions.includes(date));
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

      const recurrenceDates = generateRecurringDates({
        date: data.date,
        recurrence: data.recurrence || "none",
        endDate: data.endDate || null,
        exceptions: data.exceptions || [],
      });

      console.log("Recurrence dates for event", eventId, recurrenceDates);

      recurrenceDates.forEach((date) => {
        if (!eventsData[date]) {
          eventsData[date] = [];
        }

        eventsData[date].push({
          id: eventId,
          userId,
          title: data.title || "",
          date: data.date,
          time: data.time
            ? `${String(data.time.hours).padStart(2, "0")}:${String(
                data.time.minutes
              ).padStart(2, "0")}`
            : "00:00",
          notes: data.notes || "",
          relatedPets: data.relatedPets || [],
          appointment: data.appointment || false,
          recurrence: data.recurrence || "none",
          endDate: data.endDate || null,
          exceptions: data.exceptions || [],
          read: data.read || false,
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
    const userId = getUserId();
    const eventRef = collection(firestore, "users", userId, "events");

    const dateTime = newEvent.time instanceof Date ? newEvent.time : new Date();

    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(newEvent.date)) {
      throw new Error("Invalid date format. Expected 'YYYY-MM-DD'.");
    }

    const recurrence = newEvent.recurrence || "none";
    const endDate = newEvent.endDate
      ? newEvent.endDate instanceof Date
        ? Timestamp.fromDate(newEvent.endDate)
        : Timestamp.fromDate(new Date(newEvent.endDate))
      : null;

    const docRef = await addDoc(eventRef, {
      title: newEvent.title?.trim() || "Untitled Event",
      date: newEvent.date,
      time: { hours, minutes },
      notes: newEvent.notes?.trim() || "",
      relatedPets: Array.isArray(selectedPets) ? selectedPets : [],
      appointment: newEvent.appointment || false,
      recurrence: recurrence,
      endDate: endDate,
      exceptions: [],
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
      hours = selectedEvent.dateTime.getHours();
      minutes = selectedEvent.dateTime.getMinutes();
    } else if (selectedEvent.time) {
      hours = selectedEvent.time.hours || 0;
      minutes = selectedEvent.time.minutes || 0;
    } else {
      hours = 0;
      minutes = 0;
    }

    const updatedDate = selectedEvent.dateTime
      ? selectedEvent.dateTime.toISOString().split("T")[0]
      : selectedEvent.date;

    let formattedEndDate = null;

    if (selectedEvent.endDate) {
      let parsedDate;

      if (selectedEvent.endDate instanceof Date) {
        parsedDate = selectedEvent.endDate;
      } else {
        parsedDate = new Date(selectedEvent.endDate);
      }

      // Check if parsedDate is valid
      if (!isNaN(parsedDate.getTime())) {
        formattedEndDate = Timestamp.fromDate(parsedDate);
      } else {
        console.warn("Invalid endDate provided:", selectedEvent.endDate);
      }
    }

    const updatedData = {
      title: selectedEvent.title || "",
      notes: selectedEvent.notes || "",
      relatedPets: selectedEvent.relatedPets || [],
      updatedAt: Timestamp.now(),
      time: { hours, minutes },
      date: updatedDate,
      appointment: selectedEvent.appointment || false,
      recurrence: selectedEvent.recurrence || "none",
      endDate: formattedEndDate,
      exceptions: selectedEvent.exceptions || [],
    };
    await updateDoc(eventDocRef, updatedData);
  } catch (error) {
    console.error("Error updating event: ", error);
    throw error;
  }
};

export const updateOneOccurrence = async (
  event,
  occurrenceDate,
  updatedFields
) => {
  try {
    const userId = getUserId();
    const eventDocRef = doc(firestore, "users", userId, "events", event.id);

    // Step 1: Add this date to exceptions in the original recurring event
    const docSnap = await getDoc(eventDocRef);
    const data = docSnap.data();

    const updatedExceptions = [...(data.exceptions || []), occurrenceDate];

    await updateDoc(eventDocRef, {
      exceptions: updatedExceptions,
      updatedAt: Timestamp.now(),
    });

    // Step 2: Create a new one-time event on that occurrenceDate
    const eventsRef = collection(firestore, "users", userId, "events");

    const newEvent = {
      ...data,
      ...updatedFields,
      recurrence: "none",
      date: occurrenceDate,
      endDate: null,
      exceptions: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    delete newEvent.id;

    const newDocRef = await addDoc(eventsRef, newEvent);

    console.log(
      `Updated one occurrence. New event created with ID: ${newDocRef.id}`
    );

    return newDocRef.id;
  } catch (error) {
    console.error("Error updating one occurrence:", error);
    throw error;
  }
};

export const updateFutureOccurrences = async (
  event,
  occurrenceDate,
  updatedFields
) => {
  try {
    const eventId = event.id;
    const userId = getUserId();
    const eventDocRef = doc(firestore, "users", userId, "events", eventId);

    const docSnap = await getDoc(eventDocRef);
    const data = docSnap.data();

    if (!data) {
      console.error("Event not found for ID:", eventId);
      return;
    }

    // 1. End the current event one day before the occurrenceDate
    const previousEndDate = new Date(occurrenceDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);

    await updateDoc(eventDocRef, {
      endDate: Timestamp.fromDate(previousEndDate),
      updatedAt: Timestamp.now(),
    });

    // 2. Create a new event starting on occurrenceDate
    const eventsRef = collection(firestore, "users", userId, "events");

    const newEvent = {
      ...data,
      ...updatedFields,
      date: occurrenceDate,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    delete newEvent.id;

    const docRef = await addDoc(eventsRef, newEvent);

    console.log(
      `Future occurrences updated. New event created with ID: ${docRef.id}`
    );

    return docRef.id;
  } catch (error) {
    console.error("Error updating future occurrences:", error);
    throw error;
  }
};

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

export const deleteOccurrence = async (event, occurrenceDate) => {
  try {
    const eventDocRef = doc(
      firestore,
      "users",
      event.userId,
      "events",
      event.id
    );

    const updatedExceptions = Array.isArray(event.exceptions)
      ? [...event.exceptions, occurrenceDate]
      : [occurrenceDate];

    await updateDoc(eventDocRef, {
      exceptions: updatedExceptions,
      updatedAt: Timestamp.now(),
    });

    console.log(`Occurrence on ${occurrenceDate} excluded from recurrence.`);
    return true;
  } catch (error) {
    console.error("Error excluding occurrence:", error);
    return false;
  }
};

export const deleteFutureOccurrences = async (event, cutoffDate) => {
  try {
    const userId = event.userId;
    const eventDocRef = doc(firestore, "users", userId, "events", event.id);

    // Generate future dates after cutoff
    const allDates = generateRecurringDates(event);
    const futureDates = allDates.filter((date) => date >= cutoffDate);

    // Update exceptions array
    const updatedExceptions = [...(event.exceptions || []), ...futureDates];

    // Update endDate if needed
    const newEndDate = new Date(cutoffDate);
    newEndDate.setDate(newEndDate.getDate() - 1);

    // Create updated event data
    const updatedEventData = {
      endDate: newEndDate,
      exceptions: updatedExceptions,
      updatedAt: Timestamp.now(),
    };

    // Check if no remaining dates are left
    const remainingDates = allDates.filter(
      (date) => !updatedExceptions.includes(date) && date <= cutoffDate
    );

    if (remainingDates.length === 0) {
      // Delete entire event if no occurrences remain
      await deleteDoc(eventDocRef);
      console.log("All occurrences deleted. Event removed from database.");
    } else {
      // Update with new endDate and exceptions
      await updateDoc(eventDocRef, updatedEventData);
      console.log("Future occurrences deleted. Updated event in database.");
    }

    return true;
  } catch (error) {
    console.error("Error deleting future occurrences:", error);
    return false;
  }
};
