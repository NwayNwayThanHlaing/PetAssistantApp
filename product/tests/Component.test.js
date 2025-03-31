import { formatTime } from "./calendar/eventList";

describe("formatTime", () => {
  it("formats 0:0 as 12:00 AM", () => {
    expect(formatTime({ hours: 0, minutes: 0 })).toBe("12:00 AM");
  });

  it("formats 13:5 as 1:05 PM", () => {
    expect(formatTime({ hours: 13, minutes: 5 })).toBe("1:05 PM");
  });

  it("formats 23:59 as 11:59 PM", () => {
    expect(formatTime({ hours: 23, minutes: 59 })).toBe("11:59 PM");
  });
});
