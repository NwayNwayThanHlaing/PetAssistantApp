import { Alert } from "react-native";
import { firestore, auth } from "../auth/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export const fetchUserData = async (setUser, setLoading, navigation) => {
  try {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const userDoc = doc(firestore, "users", userId);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        setUser(docSnap.data());
      } else {
        console.log("No such document!");
        Alert.alert("Error", "No user data found.");
      }
    } else {
      console.log("No user is signed in");
      Alert.alert("Error", "No user is currently signed in.");
      navigation.navigate("Login"); // Redirect to login if no user is signed in
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
    Alert.alert("Error fetching user data", error.message);
  } finally {
    setLoading(false);
  }
};
