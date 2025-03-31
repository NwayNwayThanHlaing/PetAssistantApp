// React and Testing Library imports
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ChatInbox from "../../src/screens/chatInbox";

// === MOCKS AND SETUP ===

// Mock react-native-modal to avoid animation/rendering issues in test environment
jest.mock("react-native-modal", () => {
  return ({ children }) => children;
});

// Suppress only act() warnings to keep test output clean, but preserve other console errors
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation((message) => {
    if (message.includes("act")) return; // silence act() warning
    console.error(message); // log other errors normally
  });
});

afterAll(() => {
  console.error.mockRestore(); // restore console.error after tests
});

// Mock navigation functions for testing navigation logic
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
};

// Mock vector icons (MaterialIcons) used in header – avoids import failures during test
jest.mock("@expo/vector-icons", () => {
  return {
    MaterialIcons: "MaterialIcons", // mock as a simple string placeholder
  };
});

// Mock Firebase Auth and Firestore config
jest.mock("../../src/auth/firebaseConfig", () => ({
  auth: {
    currentUser: { uid: "testUserId" }, // mock current user
  },
  firestore: {}, // dummy firestore placeholder
}));

// Mock Firestore functions
jest.mock("firebase/firestore", () => {
  return {
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    doc: jest.fn(),

    // Mock getDoc to return a user profile
    getDoc: jest.fn(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({ name: "Buddy", profileImage: "default" }),
      })
    ),

    // Simulate a real-time listener returning one chat document
    onSnapshot: (q, callback) => {
      callback({
        docs: [
          {
            id: "chat1",
            data: () => ({
              participants: ["testUserId", "friendId"],
              lastMessage: "Hey!",
              lastSenderId: "friendId",
              updatedAt: {
                toDate: () => new Date("2024-01-01T12:00:00Z"),
              },
            }),
          },
        ],
      });
      return jest.fn(); // mock unsubscribe function
    },
  };
});

// === TEST CASES ===

describe("ChatInbox", () => {
  // Test 1: Basic rendering test: should show header title
  it("renders header with title", () => {
    const { getByText } = render(<ChatInbox navigation={mockNavigation} />);
    expect(getByText("Chats")).toBeTruthy();
  });

  // Test 2: Renders a chat fetched from mocked Firestore
  it("renders a chat item from Firestore", async () => {
    const { findByText } = render(<ChatInbox navigation={mockNavigation} />);

    // Wait for name and message to appear in UI
    expect(await findByText("Buddy")).toBeTruthy();
    expect(await findByText("Hey!")).toBeTruthy();
  });

  // Test 3: Simulates navigation to chat when user taps on chat item
  it("navigates to Chat screen on chat press", async () => {
    const { findByText } = render(<ChatInbox navigation={mockNavigation} />);

    const chatItem = await findByText("Buddy");
    fireEvent.press(chatItem);

    expect(mockNavigate).toHaveBeenCalledWith("Chat", {
      chatId: "chat1",
      friendId: "friendId",
    });
  });

  // Test 4: Simulates pressing the back button in the header
  it("calls goBack when back button is pressed", () => {
    const { getByTestId } = render(<ChatInbox navigation={mockNavigation} />);

    const backButton = getByTestId("back-button");
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });
});
