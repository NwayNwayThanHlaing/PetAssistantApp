import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { firestore, auth } from "../../auth/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { colors } from "../../styles/Theme";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dunbwugns/image/upload";
const UPLOAD_PRESET = "purr_note";

const PetProfile = ({ route, navigation }) => {
  const { petId } = route.params;
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // New state for saving
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    color: "",
    weight: "",
    gender: "",
    description: "",
    imageUrl: null,
  });

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const userId = auth.currentUser.uid;
        const petDocRef = doc(firestore, `users/${userId}/pets`, petId);
        const petDoc = await getDoc(petDocRef);

        if (petDoc.exists()) {
          const petData = petDoc.data();
          setPet(petData);
          setFormData({
            ...petData,
            age: String(petData.age),
            weight: String(petData.weight),
          });
        }
      } catch (error) {
        console.error("Error fetching pet data: ", error);
        Alert.alert("Error", "Failed to fetch pet data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [petId]);

  const handleFieldChange = (key, value) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      handleFieldChange("imageUrl", selectedImageUri);
    }
  };

  const uploadImage = async () => {
    if (!formData.imageUrl) {
      Alert.alert("No image selected", "Please select an image to upload.");
      return null;
    }

    const imageData = new FormData();
    imageData.append("file", {
      uri: formData.imageUrl,
      type: "image/jpeg",
      name: "pet_image.jpg",
    });
    imageData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: imageData,
      });
      const result = await response.json();
      return result.secure_url || null;
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Upload Error", "Could not upload image.");
      return null;
    }
  };

  const handleSave = async () => {
    setIsSaving(true); // Start showing loading indicator
    try {
      const userId = auth.currentUser.uid;
      const petDocRef = doc(firestore, `users/${userId}/pets`, petId);

      const updatedPet = {
        ...formData,
        age: parseInt(formData.age, 10),
        weight: parseFloat(formData.weight),
      };

      if (formData.imageUrl && formData.imageUrl !== pet.imageUrl) {
        const uploadedImageUrl = await uploadImage();
        if (uploadedImageUrl) {
          updatedPet.imageUrl = uploadedImageUrl;
        }
      }

      await updateDoc(petDocRef, updatedPet);
      setPet(updatedPet);
      setIsEditing(false);
      Alert.alert("Success", "Pet profile updated successfully.");
    } catch (error) {
      console.error("Error updating pet data:", error);
      Alert.alert("Error", "Failed to update pet profile.");
    } finally {
      setIsSaving(false); // Stop showing loading indicator
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Pet not found.</Text>
      </View>
    );
  }

  const renderField = (label, value, key, keyboardType = "default") => (
    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>{label}:</Text>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => handleFieldChange(key, text)}
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={styles.infoText}>{value}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={isEditing ? pickImage : null}
          style={styles.image}
        >
          <Image
            source={
              formData.imageUrl
                ? { uri: formData.imageUrl }
                : require("../../../assets/dog.png")
            }
            style={styles.petImage}
          />
          {isEditing && (
            <Text style={styles.uploadText}>Tap to change profile photo</Text>
          )}
        </TouchableOpacity>

        <View style={styles.detailsContainer}>
          {!isEditing && <Text style={styles.header}>Pet Profile</Text>}
          {renderField("Name", formData.name, "name")}
          {renderField("Breed", formData.breed, "breed")}
          {renderField("Age", formData.age, "age", "numeric")}
          {renderField("Color", formData.color, "color")}
          {renderField("Gender", formData.gender, "gender")}
          {renderField("Weight(kg)", formData.weight, "weight", "numeric")}
          {renderField("Description", formData.description, "description")}

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialIcons name="edit" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.editButtonText}>
              {isEditing
                ? isSaving
                  ? "Saving..."
                  : "Save Changes"
                : "Edit Profile"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              ...styles.editButton,
              backgroundColor: colors.primary,
            }}
            onPress={() => {
              Alert.alert(
                "Delete Pet Profile",
                "Are you sure you want to delete this pet profile? This action cannot be undone.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        const userId = auth.currentUser.uid;
                        const petDocRef = doc(
                          firestore,
                          `users/${userId}/pets`,
                          petId
                        );
                        await petDocRef.delete();
                        navigation.goBack();
                      } catch (error) {
                        console.error("Error deleting pet:", error);
                        Alert.alert("Error", "Failed to delete pet profile.");
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Text style={{ ...styles.editButtonText, color: "white" }}>
              Delete Profile
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  image: {
    alignItems: "center",
    marginTop: 80,
  },
  petImage: {
    width: 130,
    height: 130,
    borderRadius: 75,
    backgroundColor: colors.accent,
  },
  uploadText: {
    color: colors.primary,
    textAlign: "center",
    marginTop: 5,
    textDecorationLine: "underline",
  },
  detailsContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: colors.primary,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    backgroundColor: colors.primaryLightest,
    padding: 10,
    borderRadius: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    width: 100,
  },
  infoText: {
    fontSize: 16,
    color: colors.primary,
    flex: 1,
    paddingLeft: 10,
  },
  input: {
    fontSize: 16,
    color: colors.primary,
    padding: 8,
    backgroundColor: colors.primaryLightest,
    borderRadius: 10,
    flex: 1,
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
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
  errorText: {
    fontSize: 18,
    color: "red",
  },
});

export default PetProfile;
