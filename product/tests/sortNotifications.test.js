import { sortNotifications } from "../src/actions/utils";

describe("sortNotifications", () => {
  it("should sort notifications by most recent first", () => {
    const notifications = [
      {
        id: 1,
        date: "2025-03-15",
        time: { hours: 10, minutes: 30 },
      },
      {
        id: 2,
        date: "2025-03-18",
        time: { hours: 9, minutes: 15 },
      },
      {
        id: 3,
        date: "2025-03-18",
        time: { hours: 11, minutes: 45 },
      },
      {
        id: 4,
        date: "2025-03-10",
        time: { hours: 8, minutes: 0 },
      },
    ];

    const sorted = sortNotifications(notifications);

    expect(sorted.map((n) => n.id)).toEqual([3, 2, 1, 4]);
  });

  it("should handle same date and time correctly", () => {
    const notifications = [
      {
        id: "a",
        date: "2025-03-25",
        time: { hours: 12, minutes: 0 },
      },
      {
        id: "b",
        date: "2025-03-25",
        time: { hours: 12, minutes: 0 },
      },
    ];

    const sorted = sortNotifications(notifications);

    // Original order is preserved for exact same datetime
    expect(sorted.map((n) => n.id)).toEqual(["a", "b"]);
  });

  it("should return empty array if input is empty", () => {
    const sorted = sortNotifications([]);
    expect(sorted).toEqual([]);
  });
  it("should handle single-digit hours and minutes correctly", () => {
    const notifications = [
      {
        id: "early",
        date: "2025-03-20",
        time: { hours: 7, minutes: 5 }, // 07:05
      },
      {
        id: "later",
        date: "2025-03-20",
        time: { hours: 9, minutes: 0 }, // 09:00
      },
    ];

    const sorted = sortNotifications(notifications);
    expect(sorted.map((n) => n.id)).toEqual(["later", "early"]);
  });

  it("should correctly sort notifications across different months", () => {
    const notifications = [
      {
        id: "march",
        date: "2025-03-28",
        time: { hours: 14, minutes: 30 },
      },
      {
        id: "april",
        date: "2025-04-01",
        time: { hours: 10, minutes: 15 },
      },
    ];

    const sorted = sortNotifications(notifications);
    expect(sorted.map((n) => n.id)).toEqual(["april", "march"]);
  });
});
