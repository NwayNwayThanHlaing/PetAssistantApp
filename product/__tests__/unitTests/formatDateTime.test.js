// tests/formatDateTime.test.js
import { formatDateTime } from "../../src/actions/utils";

describe("formatDateTime", () => {
  it("should format PM time correctly", () => {
    const date = "2024-03-15";
    const time = { hours: 13, minutes: 5 };
    expect(formatDateTime(date, time)).toBe("15/03/2024 1:05PM");
  });

  it("should format AM time correctly", () => {
    const date = "2024-03-15";
    const time = { hours: 9, minutes: 30 };
    expect(formatDateTime(date, time)).toBe("15/03/2024 9:30AM");
  });

  it("should format midnight (0:00) as 12:00AM", () => {
    const date = "2024-03-15";
    const time = { hours: 0, minutes: 0 };
    expect(formatDateTime(date, time)).toBe("15/03/2024 12:00AM");
  });

  it("should format noon (12:00) as 12:00PM", () => {
    const date = "2024-03-15";
    const time = { hours: 12, minutes: 0 };
    expect(formatDateTime(date, time)).toBe("15/03/2024 12:00PM");
  });

  it("should return fallback for null inputs", () => {
    expect(formatDateTime(null, null)).toBe("No Date Provided");
  });

  it("should return fallback for missing time", () => {
    expect(formatDateTime("2024-03-15", null)).toBe("No Date Provided");
  });

  it("should format time with leading zero in minutes", () => {
    const date = "2024-03-15";
    const time = { hours: 10, minutes: 9 };
    expect(formatDateTime(date, time)).toBe("15/03/2024 10:09AM");
  });
});
