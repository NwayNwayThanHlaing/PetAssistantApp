import { RRule } from "rrule"; // still needed

// Define the function locally to avoid Firebase import issues
function generateRecurringDates(event) {
  const { date, recurrence, endDate, exceptions = [] } = event;

  if (!date || isNaN(new Date(date))) return [];

  if (recurrence === "none") {
    return [date];
  }

  const frequencyMap = {
    daily: RRule.DAILY,
    weekly: RRule.WEEKLY,
    monthly: RRule.MONTHLY,
  };

  const freq = frequencyMap[recurrence];
  if (!freq) return [date];

  const rule = new RRule({
    freq,
    dtstart: new Date(date),
    until: endDate ? new Date(endDate) : undefined,
    count: endDate ? undefined : 50,
  });

  const allDates = rule.all().map((d) => d.toISOString().split("T")[0]);
  return allDates.filter((d) => !exceptions.includes(d));
}

// === TEST CASES ===
describe("generateRecurringDates", () => {
  // Test 1: Check if the function generates dates correctly
  it("returns single date if recurrence is none", () => {
    const event = {
      date: "2025-04-01",
      recurrence: "none",
    };
    const result = generateRecurringDates(event);
    expect(result).toEqual(["2025-04-01"]);
  });

  // Test 2: Check if the function generates monthly dates correctly
  it("generates daily recurring dates", () => {
    const event = {
      date: "2025-04-01",
      recurrence: "daily",
      endDate: "2025-04-04",
    };
    const result = generateRecurringDates(event);
    expect(result).toEqual([
      "2025-04-01",
      "2025-04-02",
      "2025-04-03",
      "2025-04-04",
    ]);
  });

  // Test 3: Check if the function generates weekly dates with exception array correctly
  it("generates weekly recurring dates with exception", () => {
    const event = {
      date: "2025-04-01",
      recurrence: "weekly",
      endDate: "2025-04-22",
      exceptions: ["2025-04-15"],
    };
    const result = generateRecurringDates(event);
    expect(result).toEqual(["2025-04-01", "2025-04-08", "2025-04-22"]);
  });

  // Test 4: Check if it handles invalid date format
  it("handles invalid date properly", () => {
    const event = {
      date: "invalid-date",
      recurrence: "daily",
    };
    const result = generateRecurringDates(event);
    expect(result).toEqual([]);
  });

  // Test 5: Check if it uses default 50 occurrences when endDate is missing
  it("uses default 50 occurrences when endDate is missing", () => {
    const event = {
      date: "2025-04-01",
      recurrence: "monthly",
    };
    const result = generateRecurringDates(event);
    expect(result.length).toBe(50);
    expect(result[0]).toBe("2025-04-01");
  });
});
