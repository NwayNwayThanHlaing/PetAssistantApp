import { generateRecurringDates } from "../../src/actions/recurrenceUtils";

describe("generateRecurringDates", () => {
  it("returns single date if recurrence is none", () => {
    const event = {
      date: "2025-04-01",
      recurrence: "none",
    };
    const result = generateRecurringDates(event);
    expect(result).toEqual(["2025-04-01"]);
  });

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

  it("handles invalid date gracefully", () => {
    const event = {
      date: "invalid-date",
      recurrence: "daily",
    };
    const result = generateRecurringDates(event);
    expect(result).toEqual([]);
  });

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
