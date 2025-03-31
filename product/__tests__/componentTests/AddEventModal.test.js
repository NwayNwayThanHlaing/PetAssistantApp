import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import AddEventModal from "../../src/screens/calendar/addEventModal";

// === MOCKS AND SETUP ===
// Mock react-native-modal to simplify rendering (removes animation wrappers)
jest.mock("react-native-modal", () => {
  return ({ children }) => children;
});

// === TEST CASES ===
describe("AddEventModal", () => {
  // Mock functions to track interactions
  const mockSetIsVisible = jest.fn();
  const mockSetNewEvent = jest.fn();
  const mockSetSelectedPets = jest.fn();
  const mockAddEvent = jest.fn();

  // Reusable default props for the component
  const defaultProps = {
    isVisible: true, // Ensures the modal is visible
    setIsVisible: mockSetIsVisible,
    newEvent: {
      title: "",
      date: new Date(),
      time: { hours: 10, minutes: 30 },
      notes: "",
      appointment: false,
      recurrence: "none",
      endDate: null,
    },
    setNewEvent: mockSetNewEvent,
    selectedPets: [],
    setSelectedPets: mockSetSelectedPets,
    petNames: ["Buddy", "Milo"],
    addEvent: mockAddEvent,
    loading: false,
  };

  // Test 1: Modal renders all basic input fields and buttons
  it("renders the modal with initial elements", () => {
    const { getByPlaceholderText, getByText } = render(
      <AddEventModal {...defaultProps} />
    );

    expect(getByPlaceholderText("Event Title")).toBeTruthy(); // Title input
    expect(getByPlaceholderText("Notes")).toBeTruthy(); // Notes input
    expect(getByText("Select Pets")).toBeTruthy(); // Pets dropdown label
  });

  // Test 2: Typing in the event title input calls setNewEvent()
  it("calls setNewEvent when typing in title input", () => {
    const { getByPlaceholderText } = render(
      <AddEventModal {...defaultProps} />
    );
    const input = getByPlaceholderText("Event Title");

    fireEvent.changeText(input, "Vet Visit"); // Simulate typing

    expect(mockSetNewEvent).toHaveBeenCalled(); // Ensure state update triggered
  });
});
