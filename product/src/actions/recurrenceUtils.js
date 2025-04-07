// import { RRule } from "rrule";

// const recurrenceMap = {
//   daily: RRule.DAILY,
//   weekly: RRule.WEEKLY,
//   monthly: RRule.MONTHLY,
//   yearly: RRule.YEARLY,
// };

// export const generateRecurringDates = (event) => {
//   if (!event.date) {
//     return [];
//   }
//   const startDate = new Date(event.date);
//   if (isNaN(startDate.getTime())) {
//     return [];
//   }

//   let untilDate;
//   if (event.endDate) {
//     if (typeof event.endDate.toDate === "function") {
//       untilDate = event.endDate.toDate();
//     } else if (
//       event.endDate.seconds !== undefined &&
//       event.endDate.nanoseconds !== undefined
//     ) {
//       untilDate = new Date(event.endDate.seconds * 1000);
//     } else if (event.endDate instanceof Date) {
//       untilDate = event.endDate;
//     } else {
//       untilDate = new Date(event.endDate);
//     }

//     if (isNaN(untilDate.getTime())) {
//       untilDate = undefined; // fallback
//     }
//   }

//   if (!event.recurrence || event.recurrence === "none") {
//     // No recurrence → single date
//     const singleDate =
//       event.date instanceof Date
//         ? event.date.toISOString().split("T")[0]
//         : event.date;

//     // If it's in exceptions, skip it.
//     const exceptionsArray = normalizeExceptions(event.exceptions);
//     return exceptionsArray.includes(singleDate) ? [] : [singleDate];
//   }

//   const ruleOptions = {
//     freq: recurrenceMap[event.recurrence],
//     dtstart: startDate,
//   };

//   if (untilDate) {
//     ruleOptions.until = untilDate;
//   } else {
//     ruleOptions.count = 50; // Prevent infinite recurrence
//   }

//   const rule = new RRule(ruleOptions);
//   const dates = rule.all().map((date) => date.toISOString().split("T")[0]);

//   // Normalize exceptions before filtering
//   const exceptions = normalizeExceptions(event.exceptions);

//   const filteredDates = dates.filter((date) => !exceptions.includes(date));

//   return filteredDates;
// };

// // Helper to normalize exceptions into YYYY-MM-DD format
// const normalizeExceptions = (exceptions = []) => {
//   return exceptions
//     .map((ex) => {
//       if (typeof ex === "string") {
//         return ex; // Already formatted
//       } else if (ex instanceof Date) {
//         return ex.toISOString().split("T")[0];
//       } else if (
//         ex &&
//         typeof ex.seconds === "number" &&
//         typeof ex.nanoseconds === "number"
//       ) {
//         // Firestore Timestamp
//         return new Date(ex.seconds * 1000).toISOString().split("T")[0];
//       } else {
//         return null;
//       }
//     })
//     .filter((dateStr) => !!dateStr); // Filter out nulls
// };
