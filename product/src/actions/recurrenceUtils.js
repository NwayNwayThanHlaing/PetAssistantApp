import { RRule } from "rrule";

const recurrenceMap = {
  daily: RRule.DAILY,
  weekly: RRule.WEEKLY,
  monthly: RRule.MONTHLY,
  yearly: RRule.YEARLY,
};

export const generateRecurringDates = (event) => {
  if (!event.recurrence || event.recurrence === "none") {
    return [event.date];
  }

  const rule = new RRule({
    freq: recurrenceMap[event.recurrence],
    dtstart: new Date(event.date),
    until: event.endDate ? new Date(event.endDate) : undefined,
    count: event.endDate ? undefined : 50,
  });

  const dates = rule.all();

  return dates.map((date) => date.toISOString().split("T")[0]);
};
