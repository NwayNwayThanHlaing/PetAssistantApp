// Helper to format time consistently
// Used in eventList.js
export const formatTime = (time) => {
  if (
    !time ||
    typeof time.hours !== "number" ||
    typeof time.minutes !== "number"
  ) {
    return "00:00 AM";
  }

  const hours12 = ((time.hours + 11) % 12) + 1;
  const minutes = time.minutes.toString().padStart(2, "0");
  const ampm = time.hours >= 12 ? "PM" : "AM";

  return `${hours12}:${minutes} ${ampm}`;
};

// Helper function to format date & time as "DD/MM/YYYY HH:MM AM/PM"
// Used in notificationsInbox.js
export const formatDateTime = (dateString, time) => {
  if (!dateString || !time) return "No Date Provided";

  // Convert date from "YYYY-MM-DD" to "DD/MM/YYYY"
  const parts = dateString.split("-"); // Split "YYYY-MM-DD"
  if (parts.length !== 3) return dateString; // Return original if format is incorrect
  const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`; // Convert to "DD/MM/YYYY"

  // Format time to "HH:MM AM/PM"
  let { hours, minutes } = time;
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 24-hour to 12-hour format
  const formattedTime = `${hours}:${minutes
    .toString()
    .padStart(2, "0")}${period}`;

  return `${formattedDate} ${formattedTime}`;
};

// Helper function to check if a date is within the last two weeks
// Used in notificationsInbox.js
export const isWithinLastTwoWeeks = (dateString, time) => {
  if (!dateString || !time) return false;

  // Convert date and time to a JavaScript Date object
  const [year, month, day] = dateString.split("-");
  const notificationDate = new Date(
    year,
    month - 1,
    day,
    time.hours,
    time.minutes
  );
  const currentDate = new Date();
  const differenceInMs = currentDate - notificationDate; // calculate difference in milliseconds

  // Check if the notification is in the past and within the last two weeks
  return differenceInMs > 0 && differenceInMs <= 14 * 24 * 60 * 60 * 1000;
};

// Helper function to sort notifications by date and time
// Used in notificationsInbox.js
export const sortNotifications = (notifications) => {
  return notifications.sort((a, b) => {
    const timeStrA = `${a.time.hours
      .toString()
      .padStart(2, "0")}:${a.time.minutes.toString().padStart(2, "0")}:00`;
    const timeStrB = `${b.time.hours
      .toString()
      .padStart(2, "0")}:${b.time.minutes.toString().padStart(2, "0")}:00`;

    const dateA = new Date(`${a.date}T${timeStrA}`);
    const dateB = new Date(`${b.date}T${timeStrB}`);

    return dateB - dateA;
  });
};
