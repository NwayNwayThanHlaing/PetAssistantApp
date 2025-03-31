// tests/sortNotifications.test.js
import { sortNotifications } from "../src/actions/utils"; // Adjust the path if needed

describe("sortNotifications", () => {
  it("should sort notifications by date in descending order", () => {
    const notifications = [
      { date: "2024-03-01", time: { hours: 10, minutes: 0 } },
      { date: "2024-03-05", time: { hours: 9, minutes: 0 } },
    ];
    const sorted = sortNotifications(notifications);
    expect(sorted[0].date).toBe("2024-03-01");
    expect(sorted[1].date).toBe("2024-03-05");
  });

  //   it("should sort notifications by both date and time in descending order", () => {
  //     const notifications = [
  //       { date: "2024-03-05", time: { hours: 9, minutes: 0 } },
  //       { date: "2024-03-05", time: { hours: 15, minutes: 30 } },
  //       { date: "2024-03-01", time: { hours: 10, minutes: 0 } },
  //     ];
  //     const sorted = sortNotifications(notifications);
  //     expect(
  //       sorted.map((n) => `${n.date}-${n.time.hours}:${n.time.minutes}`)
  //     ).toEqual(["2024-03-05-15:30", "2024-03-05-9:0", "2024-03-01-10:0"]);
  //   });

  //   it("should return an empty array if input is empty", () => {
  //     const sorted = sortNotifications([]);
  //     expect(sorted).toEqual([]);
  //   });
});
