import { formatTime } from "../../src/actions/utils";

describe("formatTime", () => {
  it("formats morning time correctly", () => {
    const time = { hours: 9, minutes: 5 };
    expect(formatTime(time)).toBe("9:05 AM");
  });

  it("formats evening time correctly", () => {
    const time = { hours: 18, minutes: 30 };
    expect(formatTime(time)).toBe("6:30 PM");
  });

  it("returns fallback for invalid input", () => {
    expect(formatTime(null)).toBe("00:00 AM");
  });
});
