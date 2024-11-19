import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { colors } from "../../styles/Theme";
import * as ImagePicker from "expo-image-picker";
import { firestore, auth } from "../../auth/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { isLoading } from "expo-font";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dunbwugns/image/upload";
const UPLOAD_PRESET = "purr_note";

const AddPet = ({ navigation }) => {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "You need to allow access to your photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async () => {
    if (!imageUri) return null;

    try {
      const data = new FormData();
      data.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "pet_image.jpg",
      });
      data.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();

      if (result.secure_url) {
        return result.secure_url;
      } else {
        console.error("Cloudinary upload error: ", result);
        Alert.alert("Error", "Failed to upload image to Cloudinary.");
        return null;
      }
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      Alert.alert("Error", "Could not upload image.");
      return null;
    }
  };

  const handleAddPet = async () => {
    if (!name || !breed || !age || !color || !gender || !weight) {
      Alert.alert("Error", "Please fill out all required fields.");
      return;
    }
    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const imageUrl = await uploadProfileImage();
      const newPet = {
        name,
        breed,
        age: parseInt(age),
        color,
        description,
        gender,
        weight: parseFloat(weight),
        imageUrl,
        createdAt: new Date(),
      };
      const petsCollectionRef = collection(firestore, `users/${userId}/pets`);
      await addDoc(petsCollectionRef, newPet);

      Alert.alert("Success", "Pet added successfully!");
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error adding pet:", error);
      Alert.alert("Error", "Could not add pet. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.header}>Add a new Pet Profile</Text>

          <TouchableOpacity onPress={pickImage} style={styles.image}>
            <Image
              source={
                imageUri
                  ? { uri: imageUri }
                  : require("../../../assets/dog.png")
              }
              style={styles.petImage}
            />
            <Text
              style={{
                textAlign: "center",
                marginBottom: 20,
                textDecorationLine: "underline",
              }}
            >
              Upload Pet Image
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Pet Name"
            placeholderTextColor={colors.primaryLight}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Breed"
            placeholderTextColor={colors.primaryLight}
            value={breed}
            onChangeText={setBreed}
          />
          <TextInput
            style={styles.input}
            placeholder="Age"
            placeholderTextColor={colors.primaryLight}
            value={age}
            keyboardType="numeric"
            onChangeText={setAge}
          />
          <TextInput
            style={styles.input}
            placeholder="Color"
            placeholderTextColor={colors.primaryLight}
            value={color}
            onChangeText={setColor}
          />
          <TextInput
            style={styles.input}
            placeholder="Gender"
            placeholderTextColor={colors.primaryLight}
            value={gender}
            onChangeText={setGender}
          />
          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            placeholderTextColor={colors.primaryLight}
            value={weight}
            keyboardType="numeric"
            onChangeText={setWeight}
          />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Description"
            placeholderTextColor={colors.primaryLight}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPet}
            disabled={loading}
          >
            {isLoading ? (
              <Text style={styles.addButtonText}>+ Add</Text>
            ) : (
              <Text style={styles.addButtonText}>Loading...</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.background,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginVertical: 30,
    textAlign: "center",
  },
  input: {
    borderRadius: 10,
    borderColor: colors.primaryLightest,
    borderWidth: 1,
    padding: 10,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  petImage: {
    width: 130,
    height: 130,
    borderRadius: 75,
    marginBottom: 8,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  image: {
    alignItems: "center",
  },
});

export default AddPet;
