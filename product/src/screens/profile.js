import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../styles/Theme";
import { fetchUserData } from "../actions/userActions";
import {
  handleSignOut,
  handleChangePassword,
  handleDeleteAccount,
} from "../actions/authActions";
import { firestore, auth } from "../auth/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { updateEmail } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";

const fallbackImage = "../../assets/profile.jpg";

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.warn("User is not logged in. Redirecting to login...");
          setLoading(false);
          navigation.navigate("Login");
          return;
        }

        const fetchedUserData = await fetchUserData(userId);
        if (fetchedUserData) {
          setUser(fetchedUserData);
          setName(fetchedUserData.name || "");
          setNewEmail(fetchedUserData.email || "");
          setProfileImage(fetchedUserData.profileImage || null);
        } else {
          Alert.alert(
            "Error",
            "User data could not be loaded. Please try again."
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigation]);

  const handleSettingPress = (title) => {
    if (title === "Log Out") {
      handleSignOut(navigation);
    } else if (title === "Delete Account") {
      handleDeleteAccount(navigation);
    } else if (title === "Change Password") {
      setModalVisible(true);
    } else if (title === "Update Profile") {
      setEditModalVisible(true);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "You need to allow permission to access your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        console.log("Selected image URI: ", uri);
        setProfileImage(uri);
      } else {
        console.log("Image selection canceled or invalid structure");
      }
    } catch (error) {
      console.error("Error selecting image: ", error);
      Alert.alert("Error", "An error occurred while selecting the image.");
    }
  };

  const handleUpdateProfile = async () => {
    setUploading(true);
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(firestore, "users", userId);

      let profileImageUrl = user.profileImage;

      if (profileImage && profileImage !== user.profileImage) {
        const uploadedUrl = await uploadProfileImage(profileImage);
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        }
      }

      const updateData = {
        name: name,
        email: newEmail || user.email,
      };

      if (profileImageUrl) {
        updateData.profileImage = profileImageUrl;
      }

      await updateDoc(userRef, updateData);

      if (newEmail && newEmail !== user.email) {
        await updateEmail(auth.currentUser, newEmail);
      }

      Alert.alert("Success", "Your profile has been updated.");
      setUser({
        ...user,
        name: name,
        email: newEmail || user.email,
        profileImage: profileImageUrl,
      });
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error updating profile: ", error);
      Alert.alert("Error", error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading user data</Text>
        <Button title="Retry" onPress={() => navigation.navigate("Profile")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={profileImage ? { uri: profileImage } : require(fallbackImage)}
        style={styles.profilePicture}
      />
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <FlatList
        data={[
          { id: "1", title: "Change Password", icon: "lock" },
          { id: "2", title: "Update Profile", icon: "image" },
          { id: "4", title: "Log Out", icon: "logout" },
          { id: "5", title: "Delete Account", icon: "delete" },
        ]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress(item.title)}
          >
            <MaterialIcons name={item.icon} size={24} color={colors.primary} />
            <Text style={styles.settingText}>{item.title}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        style={styles.settingsList}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: colors.primary,
  },
  email: {
    fontSize: 16,
    textAlign: "center",
    color: colors.secondary,
    marginBottom: 30,
  },
  settingsList: {
    marginTop: 10,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: colors.primaryLightest,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: colors.primaryLighter,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  imagePicker: {
    alignItems: "center",
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default Profile;
