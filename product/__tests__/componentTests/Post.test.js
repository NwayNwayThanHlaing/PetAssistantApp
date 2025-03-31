// __tests__/componentTests/CreatePost.test.js
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CreatePost from "../../src/screens/createPost";

// === MOCKS AND SETUP ===

// Mock Firebase Auth and Firestore
jest.mock("../../src/auth/firebaseConfig", () => ({
  auth: { currentUser: { uid: "testUserId" } },
  firestore: {},
}));

jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(() => Promise.resolve()),
  collection: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Mock Image Picker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: "test-image-uri" }],
    })
  ),
  MediaTypeOptions: { Images: "Images" },
}));

// === TEST CASES ===
describe("CreatePost", () => {
  const mockNavigation = { goBack: jest.fn() };

  // Test 1: Renders initial elements
  it("renders initial UI elements", () => {
    const { getByPlaceholderText, getByText } = render(
      <CreatePost navigation={mockNavigation} />
    );

    expect(getByPlaceholderText("What's on your mind?")).toBeTruthy();
    expect(getByText("Pick Images (0/9)"));
    expect(getByText("Post"));
  });

  // Test 2: Allows user to type into the status input
  it("allows user to type status within limit", () => {
    const { getByPlaceholderText } = render(
      <CreatePost navigation={mockNavigation} />
    );

    const input = getByPlaceholderText("What's on your mind?");
    fireEvent.changeText(input, "Hello from test!");

    expect(input.props.value).toBe("Hello from test!");
  });

  // Test 3: Image picker updates UI after selection
  it("handles image picking", async () => {
    const { getByText, findByText } = render(
      <CreatePost navigation={mockNavigation} />
    );

    fireEvent.press(getByText("Pick Images (0/9)"));

    expect(await findByText("Pick Images (1/9)")).toBeTruthy();
  });

  // Test 4: Prevents post submission if empty
  it("prevents post with empty status and no image", () => {
    const { getByText } = render(<CreatePost navigation={mockNavigation} />);
    fireEvent.press(getByText("Post"));
    expect(getByText("Post")).toBeTruthy(); // Button still visible
  });

  // Test 5: Submits post and navigates back
  it("creates a post and resets form", async () => {
    const { getByPlaceholderText, getByText } = render(
      <CreatePost navigation={mockNavigation} />
    );

    fireEvent.changeText(
      getByPlaceholderText("What's on your mind?"),
      "Test post"
    );
    fireEvent.press(getByText("Post"));

    await waitFor(() => {
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  // Test 6: Prevents status input from exceeding max length
  it("limits status input to 100 characters", () => {
    const { getByPlaceholderText } = render(
      <CreatePost navigation={mockNavigation} />
    );

    const input = getByPlaceholderText("What's on your mind?");
    const longText = "x".repeat(150);
    fireEvent.changeText(input, longText);

    expect(input.props.value.length).toBeLessThanOrEqual(100);
  });

  // Test 7: Allows removing a selected image
  it("removes selected image", async () => {
    const { getByText, findByText, getByRole, queryByTestId } = render(
      <CreatePost navigation={mockNavigation} />
    );

    // Pick one image
    fireEvent.press(getByText("Pick Images (0/9)"));
    expect(await findByText("Pick Images (1/9)")).toBeTruthy();

    // Remove image
    const removeButton = getByText("\u2715"); // ✕ symbol
    fireEvent.press(removeButton);
    expect(getByText("Pick Images (0/9)")).toBeTruthy();
  });
});
