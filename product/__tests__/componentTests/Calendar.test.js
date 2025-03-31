import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CalendarPage from "../../src/screens/calendar/calendar";

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

// Begin test suite
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
});
