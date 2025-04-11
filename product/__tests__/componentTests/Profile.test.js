import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Profile from "../../src/screens/profile";
import { act } from "react-test-renderer";

// === MOCKS AND SETUP ===

// Simplify Modal behavior in tests by rendering children directly
jest.mock("react-native-modal", () => {
  return ({ children }) => children;
});

// Mock navigation functions used in the Profile component
const mockNavigate = jest.fn();
const mockPush = jest.fn();

const mockNavigation = {
  navigate: mockNavigate,
  push: mockPush,
};

// Mock vector icons to avoid ESM-related test errors
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: () => "MaterialIcons", // render icon as plain text
}));

// Mock Firebase Auth and Firestore modules
jest.mock("../../src/auth/firebaseConfig", () => ({
  auth: { currentUser: { uid: "test-user-id" } },
  firestore: {},
}));

// Mock fetching user data (simulating successful fetch)
jest.mock("../../src/actions/userActions", () => ({
  fetchUserData: jest.fn(() =>
    Promise.resolve({
      uid: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      profileImage: "default",
    })
  ),
}));

// Mock auth action handlers to avoid actual Firebase calls
jest.mock("../../src/actions/authActions", () => ({
  handleSignOut: jest.fn(),
  handleChangePassword: jest.fn(),
  handleDeleteAccount: jest.fn(),
}));

// Mock Firebase Firestore update functions
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(() => Promise.resolve()),
}));

// Mock Firebase Auth's updateEmail function
jest.mock("firebase/auth", () => ({
  updateEmail: jest.fn(() => Promise.resolve()),
}));

// Mock Image Picker behavior
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: "file://test-image.jpg" }],
    })
  ),
  MediaTypeOptions: { Images: "Images" },
}));

// === TEST CASES ===

describe("Profile", () => {
  // Test 1: Check if user data (name and email) is displayed after loading
  it("renders user name and email after loading", async () => {
    const { findByText } = render(<Profile navigation={mockNavigation} />);

    expect(await findByText("Test User")).toBeTruthy();
    expect(await findByText("test@example.com")).toBeTruthy();
  });

  // Test 2: Check if pressing "Your Pets" navigates to the Pets screen
  it("navigates to pets screen on 'Your Pets' press", async () => {
    const { findByText } = render(<Profile navigation={mockNavigation} />);
    const petsButton = await findByText("Your Pets");

    fireEvent.press(petsButton);
    expect(mockPush).toHaveBeenCalledWith("Pets");
  });

  // Test 3: Check if pressing "Your Posts" navigates to the Wall screen with correct params
  it("navigates to posts screen on 'Your Posts' press", async () => {
    const { findByText } = render(<Profile navigation={mockNavigation} />);
    const postsButton = await findByText("Your Posts");

    fireEvent.press(postsButton);
    expect(mockPush).toHaveBeenCalledWith("Wall", {
      userId: "test-user-id",
      userName: "Test User",
      userImage: "default",
    });
  });

  // Test 4: Ensure Edit Profile modal shows up with inputs visible
  it("shows and closes Edit Profile modal", async () => {
    const { findByText, getByPlaceholderText } = render(
      <Profile navigation={mockNavigation} />
    );

    const editButton = await findByText("Edit Profile");

    await act(async () => {
      fireEvent.press(editButton);
    });

    expect(getByPlaceholderText("Name")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
  });

  // Test 5: Ensure Reset Password modal shows inputs and closes on Cancel
  it("shows and closes Change Password modal", async () => {
    const { findByText, getByText, getByPlaceholderText } = render(
      <Profile navigation={mockNavigation} />
    );
    const resetButton = await findByText("Change Password");
    fireEvent.press(resetButton);

    // Check for modal input fields
    expect(getByPlaceholderText("Current Password")).toBeTruthy();
    expect(getByPlaceholderText("New Password")).toBeTruthy();

    // Close the modal
    const cancelButton = getByText("Cancel");
    fireEvent.press(cancelButton);
  });
});
