import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CalendarPage from "../../src/screens/calendar/calendar";

// === MOCKS AND SETUP ===

// Mock `react-native-modal` so it renders children directly without animation wrappers
jest.mock("react-native-modal", () => {
  return ({ children }) => children;
});

// Suppress act() warnings in test output, but still log other errors
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation((message) => {
    if (message.includes("act")) return;
    console.error(message);
  });
});

afterAll(() => {
  console.error.mockRestore();
});

// Mock navigation to prevent errors from useRoute or useNavigation
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock Firestore service functions used in the CalendarPage
jest.mock("../../src/screens/calendar/firestoreService", () => ({
  fetchPetNames: jest.fn(() => Promise.resolve(["Buddy", "Milo"])),
  fetchEvents: jest.fn(() => Promise.resolve({})),
  addEvent: jest.fn(() => Promise.resolve()),
  updateEvent: jest.fn(() => Promise.resolve()),
  updateOneOccurrence: jest.fn(() => Promise.resolve()),
  updateFutureOccurrences: jest.fn(() => Promise.resolve()),
  deleteEvent: jest.fn(() => Promise.resolve()),
  deleteOneOccurrence: jest.fn(() => Promise.resolve()),
  deleteFutureOccurrences: jest.fn(() => Promise.resolve()),
}));

// Mock child components to keep tests focused on CalendarPage
jest.mock("../../src/screens/calendar/addEventModal", () => {
  return () => null; // Renders nothing
});
jest.mock("../../src/screens/calendar/updateEventModal", () => {
  return () => null;
});
jest.mock("../../src/screens/calendar/eventList", () => {
  return () => null;
});

// === TEST CASES ===
describe("CalendarPage", () => {
  // Check that important UI buttons render
  it("renders 'Today' and '+ Add' buttons", () => {
    const { getByText } = render(<CalendarPage />);
    expect(getByText("Today")).toBeTruthy();
    expect(getByText("+ Add")).toBeTruthy();
  });

  // Ensure pressing '+ Add' does not crash
  it("pressing '+ Add' does not crash", () => {
    const { getByText } = render(<CalendarPage />);
    fireEvent.press(getByText("+ Add"));
    expect(true).toBe(true); // Placeholder assertion
  });

  // Ensure pressing 'Today' does not crash
  it("pressing 'Today' does not crash", () => {
    const { getByText } = render(<CalendarPage />);
    fireEvent.press(getByText("Today"));
    expect(true).toBe(true); // Placeholder assertion
  });

  // Check that the calendar header displays the current month and year
  it("renders calendar month and year header correctly", () => {
    const { getByText } = render(<CalendarPage />);

    const today = new Date();
    const expectedMonth = today.toLocaleString("default", { month: "long" });
    const expectedYear = today.getFullYear().toString();

    // Check if both are rendered independently
    expect(getByText(expectedMonth)).toBeTruthy();
    expect(getByText(expectedYear)).toBeTruthy();
  });

  // Check that the calendar displays the current date
  it("shows event section title with selected date", async () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    const { getByText } = render(<CalendarPage />);
    await waitFor(() => {
      expect(getByText(`Events on ${formattedDate}`)).toBeTruthy();
    });
  });

  // Check that the calendar container renders without crashing
  it("renders calendar without crashing", async () => {
    const { getByTestId } = render(<CalendarPage />);
    expect(getByTestId("calendar-container")).toBeTruthy();
  });
});
