// authActions.js
import { Alert } from "react-native";
import {
  signOut,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../auth/firebaseConfig";
import { deleteDoc, doc } from "firebase/firestore";

// Sign Out Function
export const handleSignOut = async (navigation) => {
  try {
    await signOut(auth);
    Alert.alert("Success", "You have been logged out.");
    navigation.navigate("Login");
  } catch (error) {
    console.error("Error signing out: ", error);
    Alert.alert("Logout Error", error.message);
  }
};

// Change Password Function
export const handleChangePassword = async (
  currentPassword,
  newPassword,
  setModalVisible
) => {
  const user = auth.currentUser;
  if (!user) {
    Alert.alert("Error", "No user is currently signed in.");
    return;
  }

  if (!currentPassword || !newPassword) {
    Alert.alert("Error", "Please enter both current and new passwords.");
    return;
  }

  try {
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    Alert.alert("Success", "Your password has been updated.");
    setModalVisible(false);
  } catch (error) {
    console.error("Error changing password:", error);
    if (error.code === "auth/wrong-password") {
      Alert.alert("Error", "The current password is incorrect.");
    } else if (error.code === "auth/weak-password") {
      Alert.alert("Error", "The new password is too weak.");
    } else {
      Alert.alert("Error", error.message);
    }
  }
};

// Delete Account Function
export const handleDeleteAccount = async (navigation) => {
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    try {
      Alert.alert(
        "Delete Account",
        "Are you sure you want to delete your account? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await deleteDoc(doc(firestore, "users", userId));
              await user.delete();
              Alert.alert("Account Deleted", "Your account has been deleted.");
              navigation.navigate("SignUp");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error deleting account: ", error);
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Session Expired",
          "Please sign in again to delete your account."
        );
      } else {
        Alert.alert("Error", error.message);
      }
    }
  } else {
    Alert.alert("Error", "No user is currently signed in.");
  }
};
