import { isWithinLastTwoWeeks } from "../../src/actions/utils";

// === TEST CASES ===
describe("isWithinLastTwoWeeks", () => {
  // Test 1: Check if the function returns true for dates within last 14 days
  it("should return true for dates within last 14 days", () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const time = { hours: now.getHours(), minutes: now.getMinutes() };
    expect(isWithinLastTwoWeeks(dateStr, time)).toBe(true);
  });

  // Test 2: Check if the function returns false for dates older than 14 days
  it("should return false for old dates", () => {
    const oldDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000); // 20 days ago
    const dateStr = oldDate.toISOString().split("T")[0];
    const time = { hours: oldDate.getHours(), minutes: oldDate.getMinutes() };
    expect(isWithinLastTwoWeeks(dateStr, time)).toBe(false);
  });

  // Test 3: Check if the function returns false for dates in the future
  it("should return false for future dates", () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days in future
    const dateStr = futureDate.toISOString().split("T")[0];
    const time = {
      hours: futureDate.getHours(),
      minutes: futureDate.getMinutes(),
    };
    expect(isWithinLastTwoWeeks(dateStr, time)).toBe(false);
  });

  // Test 4: Check if the function returns false for the date just over 14 days ago
  it("should return false for just over 14 days ago", () => {
    const overLimitDate = new Date(
      Date.now() - (14 * 24 * 60 * 60 * 1000 + 60000)
    ); // 14 days + 1 minute ago
    const dateStr = overLimitDate.toISOString().split("T")[0];
    const time = {
      hours: overLimitDate.getHours(),
      minutes: overLimitDate.getMinutes(),
    };
    expect(isWithinLastTwoWeeks(dateStr, time)).toBe(false);
  });

  // Test 5: Check if it returns false if the date is invalid
  it("should return false if date is missing", () => {
    const time = { hours: 12, minutes: 30 };
    expect(isWithinLastTwoWeeks(null, time)).toBe(false);
  });

  // Test 6: Check if it returns false if the time is invalid
  it("should return false if time is missing", () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    expect(isWithinLastTwoWeeks(dateStr, null)).toBe(false);
  });

  // Test 7: Check if it returns false if both date and time are invalid
  it("should return false if both date and time are missing", () => {
    expect(isWithinLastTwoWeeks(null, null)).toBe(false);
  });

  // Test 8: Check if it handles single-digit months and days correctly
  it("should handle single-digit months and days correctly", () => {
    const dateStr = "2025-03-01";
    const testDate = new Date("2025-03-01T08:15:00");
    const currentDate = new Date("2025-03-15T08:15:00");
    const time = { hours: testDate.getHours(), minutes: testDate.getMinutes() };

    // Temporarily override Date to simulate current date
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor(...args) {
        return args.length ? new RealDate(...args) : currentDate;
      }
    };

    expect(isWithinLastTwoWeeks(dateStr, time)).toBe(true);

    global.Date = RealDate; // restore original Date
  });
});
