import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Button,
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
import { getFunctions, httpsCallable } from "firebase/functions";

const fallbackImage = "../../assets/profile.jpg";
const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  useEffect(() => {
    fetchUserData(setUser, setLoading, navigation);
  }, [navigation]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setNewEmail(user.email || "");
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  useEffect(() => {
    const getPermission = async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need permission to access your photo library to upload profile images."
        );
      }
    };

    getPermission();
  }, []);

  const settingsOptions = [
    { id: "1", title: "Change Password", icon: "lock" },
    { id: "2", title: "Update Profile", icon: "image" },
    { id: "3", title: "Notifications", icon: "notifications" },
    { id: "4", title: "Log Out", icon: "logout" },
    { id: "5", title: "Delete Account", icon: "delete" },
  ];

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

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        console.log("Selected image URI: ", uri);
        setProfileImage(uri);
      } else {
        console.log("Image selection canceled");
      }
    } catch (error) {
      console.error("Error selecting image: ", error);
      Alert.alert("Error", "An error occurred while selecting the image.");
    }
  };

  const uploadProfileImage = async (imageUri) => {
    if (!imageUri) return null;

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile_image.jpg",
    });
    formData.append("upload_preset", "purr_note");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dunbwugns/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        console.error("Upload failed, no secure_url returned:", data);
        return null;
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(firestore, "users", userId);

      let profileImageUrl = user.profileImage;

      if (profileImage && profileImage !== user.profileImage) {
        const previousPublicId = user.profileImagePublicId;
        if (previousPublicId) {
          await deletePreviousImage(previousPublicId);
        }

        const uploadedUrl = await uploadProfileImage(profileImage);
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
          const newPublicId = uploadedUrl.split("/").pop().split(".")[0];
          await updateDoc(userRef, { profileImagePublicId: newPublicId });
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
        data={settingsOptions}
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
        scrollEnabled={false}
      />

      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor={colors.primaryLighter}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor={colors.primaryLighter}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <Button
              title="Update Password"
              onPress={() =>
                handleChangePassword(
                  currentPassword,
                  newPassword,
                  setModalVisible
                )
              }
            />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Update Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              <Image
                source={
                  profileImage ? { uri: profileImage } : require(fallbackImage)
                }
                style={styles.profilePicture}
              />
              <Text
                style={{
                  color: colors.primary,
                  marginBottom: 10,
                  textAlign: "center",
                  textDecorationLine: "underline",
                }}
              >
                Upload Image
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={colors.primaryLighter}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.primaryLighter}
              value={newEmail || email}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdateProfile}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  saveButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
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
    backgroundColor: colors.primary,
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
