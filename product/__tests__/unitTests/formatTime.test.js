import { formatTime } from "../../src/actions/utils";

describe("formatTime", () => {
  // Test cases for formatTime function
  // Test 1: Check if the function formats AM time correctly
  it("formats morning time correctly", () => {
    const time = { hours: 9, minutes: 5 };
    expect(formatTime(time)).toBe("9:05 AM");
  });

  // Test 2: Check if the function formats PM time correctly
  it("formats evening time correctly", () => {
    const time = { hours: 18, minutes: 30 };
    expect(formatTime(time)).toBe("6:30 PM");
  });

  // Test 3: Check if it can handle invalid input
  it("returns fallback for invalid input", () => {
    expect(formatTime(null)).toBe("00:00 AM");
  });
});
