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
import {
  arrayRemove,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { firestore, auth } from "../../auth/firebaseConfig";
import { colors } from "../../styles/Theme";
import dog from "../../../assets/dog.png";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dunbwugns/image/upload";
const UPLOAD_PRESET = "purr_note";

const PetProfile = ({ route, navigation }) => {
  const { petId } = route.params;
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
  const [errors, setErrors] = useState({}); // Error state for inputs

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

    // Validate numeric fields
    if (key === "age" || key === "weight") {
      if (isNaN(value) || value.trim() === "") {
        setErrors((prevErrors) => ({ ...prevErrors, [key]: "Invalid number" }));
      } else {
        setErrors((prevErrors) => {
          const { [key]: removedError, ...rest } = prevErrors;
          return rest;
        });
      }
    }
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
    setIsSaving(true); // Disable the save button while saving
    try {
      const userId = auth.currentUser.uid;
      const petDocRef = doc(firestore, `users/${userId}/pets`, petId);

      const updatedPet = {
        ...formData,
        age: parseInt(formData.age, 10),
        weight: parseFloat(formData.weight),
      };

      // Store the old pet name for event updates
      const oldPetName = pet.name;

      if (formData.imageUrl && formData.imageUrl !== pet.imageUrl) {
        const uploadedImageUrl = await uploadImage();
        if (uploadedImageUrl) {
          updatedPet.imageUrl = uploadedImageUrl;
        }
      }

      // Update the pet document
      await updateDoc(petDocRef, updatedPet);
      setPet(updatedPet);

      // Check if the pet name has changed
      if (formData.name !== oldPetName) {
        // Reference to the events collection
        const eventsCollectionRef = collection(
          firestore,
          `users/${userId}/events`
        );

        // Query to find all events that contain the old pet name in relatedPets
        const eventsQuery = query(
          eventsCollectionRef,
          where("relatedPets", "array-contains", oldPetName)
        );

        // Fetch all matching event documents
        const querySnapshot = await getDocs(eventsQuery);

        // Check if any events matched
        if (querySnapshot.empty) {
          console.log("No events found with the old pet name.");
        }

        // Loop through each event and manually update the relatedPets array
        for (const docSnap of querySnapshot.docs) {
          const eventDocRef = doc(
            firestore,
            `users/${userId}/events`,
            docSnap.id
          );

          // Get the current relatedPets array
          const eventData = docSnap.data();
          const updatedRelatedPets = eventData.relatedPets.filter(
            (petName) => petName !== oldPetName
          );

          // Add the new pet name
          updatedRelatedPets.push(formData.name);

          // Update the event document with the modified relatedPets array
          await updateDoc(eventDocRef, {
            relatedPets: updatedRelatedPets,
          });
        }
      }

      setIsEditing(false);
      Alert.alert("Success", "Pet profile updated successfully.");
    } catch (error) {
      console.error("Error updating pet data:", error);
      Alert.alert("Error", "Failed to update pet profile.");
    } finally {
      setIsSaving(false);
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
    <View>
      <View
        style={
          !isEditing
            ? styles.infoSection
            : {
                ...styles.infoSection,
                paddingVertical: 5,
              }
        }
      >
        <Text style={styles.infoLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={[
              styles.input,
              key === "description"
                ? { maxHeight: 109, textAlignVertical: "top" }
                : {},
            ]}
            value={value}
            onChangeText={(text) => handleFieldChange(key, text)}
            keyboardType={keyboardType}
            multiline={key === "description"}
          />
        ) : (
          <Text
            style={[
              styles.infoText,
              {
                maxHeight: key === "description" ? 109 : "auto",
              },
            ]}
          >
            {value.replace(/\n/g, "")}
          </Text>
        )}
      </View>
      {errors[key] && <Text style={styles.errorText}>*{errors[key]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isEditing ? pickImage : null}
          style={styles.image}
        >
          <Image
            source={formData.imageUrl ? { uri: formData.imageUrl } : dog}
            style={styles.petImage}
          />
          {isEditing && <Text style={styles.uploadText}>Upload photo</Text>}
        </TouchableOpacity>

        <View style={styles.detailsContainer}>
          <View style={!isEditing ? styles.infoContainer : null}>
            {!isEditing && <Text style={styles.header}>Pet Profile</Text>}
            {renderField("Name", formData.name, "name")}
            {renderField("Breed", formData.breed, "breed")}
            {renderField("Age", formData.age, "age", "numeric")}
            {renderField("Color", formData.color, "color")}
            {renderField("Gender", formData.gender, "gender")}
            {renderField("Weight(kg)", formData.weight, "weight", "numeric")}
            {renderField("Description", formData.description, "description")}
          </View>

          <TouchableOpacity
            style={[
              styles.editButton,
              {
                marginTop: 30,
              },
              isSaving || (isEditing && Object.keys(errors).length > 0)
                ? styles.disabledButton
                : null,
            ]}
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isSaving || (isEditing && Object.keys(errors).length > 0)}
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

                        // Reference to the pet document to be deleted
                        const petDocRef = doc(
                          firestore,
                          `users/${userId}/pets`,
                          petId
                        );

                        // Fetch the pet name before deleting
                        const petDocSnap = await getDoc(petDocRef);
                        if (!petDocSnap.exists()) {
                          throw new Error("Pet not found");
                        }
                        const petData = petDocSnap.data();
                        const petName = petData.name;

                        // Delete the pet document
                        await deleteDoc(petDocRef);

                        // Reference to the events subcollection
                        const eventsCollectionRef = collection(
                          firestore,
                          `users/${userId}/events`
                        );

                        // Query to find all events that contain the pet name in relatedPets
                        const eventsQuery = query(
                          eventsCollectionRef,
                          where("relatedPets", "array-contains", petName)
                        );

                        // Fetch all matching event documents
                        const querySnapshot = await getDocs(eventsQuery);

                        // Loop through each event and remove the pet name from relatedPets
                        for (const docSnap of querySnapshot.docs) {
                          const eventDocRef = doc(
                            firestore,
                            `users/${userId}/events`,
                            docSnap.id
                          );

                          await updateDoc(eventDocRef, {
                            relatedPets: arrayRemove(petName),
                          });
                        }

                        // Navigate back after deletion
                        navigation.goBack();
                      } catch (error) {
                        console.error(
                          "Error deleting pet and updating events:",
                          error
                        );
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
    paddingTop: 60,
    paddingBottom: 50,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  image: {
    alignItems: "center",
  },
  petImage: {
    width: 150,
    height: 150,
    borderRadius: 45,
    backgroundColor: colors.accent,
  },
  uploadText: {
    color: colors.primary,
    textAlign: "center",
    marginTop: 10,
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
    marginVertical: 10,
    textDecorationLine: "underline",
    textAlign: "center",
    color: colors.primary,
  },
  infoContainer: {
    marginTop: 10,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
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
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    borderRadius: 10,
    padding: 10,
    marginLeft: 5,
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
  disabledButton: {
    opacity: 0.6,
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
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 10,
    color: "red",
  },
  back: {
    borderRadius: 8,
    marginTop: 10,
    marginLeft: 10,
    color: colors.accent,
    width: 100,
    alignSelf: "flex-start",
  },
});

export default PetProfile;
