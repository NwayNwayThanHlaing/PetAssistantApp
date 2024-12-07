import { Alert } from "react-native";
import {
  signOut,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../auth/firebaseConfig";
import { deleteDoc, doc } from "firebase/firestore";
import { firestore } from "../auth/firebaseConfig";

const reauthenticateUser = async (email, password) => {
  const credential = EmailAuthProvider.credential(email, password);
  await reauthenticateWithCredential(auth.currentUser, credential);
};

// Sign Out Function
export const handleSignOut = async (navigation, subId) => {
  try {
    if (subId) {
      await unregisterIndieDevice(subId, 25235, "rBDIqttve0mXsFAkpSkis7");
      console.log("Device unregistered from Native Notify with Sub ID:", subId);
    }
    await signOut(auth);
    axios.delete(
      `https://app.nativenotify.com/api/app/indie/sub/25248/wtOK6Mg9wWTJpjgjr1qH0v/${subId}`
    );
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

    const deleteAccount = async () => {
      try {
        await deleteDoc(doc(firestore, "users", userId));
        await user.delete();
        Alert.alert("Account Deleted", "Your account has been deleted.");
        navigation.navigate("SignUp");
      } catch (error) {
        console.error("Error deleting account: ", error);

        if (error.code === "auth/requires-recent-login") {
          Alert.alert(
            "Session Expired",
            "Please re-enter your credentials to delete your account.",
            [
              {
                text: "Reauthenticate",
                onPress: async () => {
                  try {
                    const password = prompt("Enter your password:");
                    await reauthenticateUser(user.email, password);
                    deleteAccount(); // Retry account deletion after reauthentication
                  } catch (reauthError) {
                    Alert.alert("Error", reauthError.message);
                  }
                },
              },
            ]
          );
        } else {
          Alert.alert("Error", error.message);
        }
      }
    };

    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteAccount },
      ]
    );
  } else {
    Alert.alert("Error", "No user is currently signed in.");
  }
};
