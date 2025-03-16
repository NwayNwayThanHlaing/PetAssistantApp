import { RRule } from "rrule";

const recurrenceMap = {
  daily: RRule.DAILY,
  weekly: RRule.WEEKLY,
  monthly: RRule.MONTHLY,
  yearly: RRule.YEARLY,
};

export const generateRecurringDates = (event) => {
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
    } else {
      untilDate = new Date(event.endDate);
    }

    if (isNaN(untilDate.getTime())) {
      console.warn("Invalid untilDate:", event.endDate);
      untilDate = undefined; // fallback
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
    ruleOptions.count = 50; // prevent infinite
  }

  const rule = new RRule(ruleOptions);
  const dates = rule.all().map((date) => date.toISOString().split("T")[0]);

  const exceptions = Array.isArray(event.exceptions) ? event.exceptions : [];
  const filteredDates = dates.filter((date) => !exceptions.includes(date));

  return filteredDates;
};
