import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Profile from "../../src/screens/profile";

// === MOCKS AND SETUP ===
// Mock react-native-modal to simplify rendering (removes animation wrappers)
jest.mock("react-native-modal", () => {
  return ({ children }) => children;
});

// Mock navigation
const mockNavigate = jest.fn();
const mockPush = jest.fn();

const mockNavigation = {
  navigate: mockNavigate,
  push: mockPush,
};

// Mock vector icons to avoid ESM import issues during tests
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: () => "MaterialIcons",
}));

// Mock Firebase Auth & Firestore
jest.mock("../../src/auth/firebaseConfig", () => ({
  auth: { currentUser: { uid: "test-user-id" } },
  firestore: {},
}));

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

jest.mock("../../src/actions/authActions", () => ({
  handleSignOut: jest.fn(),
  handleChangePassword: jest.fn(),
  handleDeleteAccount: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(() => Promise.resolve()),
}));

jest.mock("firebase/auth", () => ({
  updateEmail: jest.fn(() => Promise.resolve()),
}));

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
  it("renders user name and email after loading", async () => {
    const { findByText } = render(<Profile navigation={mockNavigation} />);

    expect(await findByText("Test User")).toBeTruthy();
    expect(await findByText("test@example.com")).toBeTruthy();
  });

  it("navigates to pets screen on 'Your Pets' press", async () => {
    const { findByText } = render(<Profile navigation={mockNavigation} />);
    const petsButton = await findByText("Your Pets");

    fireEvent.press(petsButton);
    expect(mockPush).toHaveBeenCalledWith("Pets");
  });

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
  it("shows and closes Edit Profile modal", async () => {
    const { findByText, getByPlaceholderText } = render(
      <Profile navigation={mockNavigation} />
    );
    const editButton = await findByText("Edit Profile");
    fireEvent.press(editButton);

    expect(getByPlaceholderText("Name")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
  });

  it("shows and closes Reset Password modal", async () => {
    const { findByText, getByText, getByPlaceholderText } = render(
      <Profile navigation={mockNavigation} />
    );
    const resetButton = await findByText("Reset Password");
    fireEvent.press(resetButton);

    expect(getByPlaceholderText("Current Password")).toBeTruthy();
    expect(getByPlaceholderText("New Password")).toBeTruthy();

    const cancelButton = getByText("Cancel");
    fireEvent.press(cancelButton);
  });
});
