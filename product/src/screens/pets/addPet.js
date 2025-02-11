import React, { useState } from "react";
import {
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
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { colors } from "../../styles/Theme";
import * as ImagePicker from "expo-image-picker";
import { firestore, auth } from "../../auth/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { isLoading } from "expo-font";
import dog from "../../../assets/dog.png";

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
  const [imageUri, setImageUri] = useState("");
  const [loading, setLoading] = useState(false);

  const [ageError, setAgeError] = useState("");
  const [weightError, setWeightError] = useState("");

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
    if (!name) {
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
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={pickImage} style={styles.image}>
          <Image
            source={imageUri ? { uri: imageUri } : dog}
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
          placeholder="Pet Name *"
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
          keyboardType="default" // Allow all input types to handle strings
          onChangeText={(value) => {
            const numericValue = value.replace(/[^0-9.]/g, ""); // Allow numbers and dots
            if (value !== numericValue || value.trim() === "") {
              setAgeError("* Age must be a number");
            } else {
              setAgeError("");
            }
            setAge(value); // Update value even if invalid to allow correction
          }}
        />
        {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          placeholderTextColor={colors.primaryLight}
          value={weight}
          keyboardType="default" // Allow all input types to handle strings
          onChangeText={(value) => {
            const numericValue = value.replace(/[^0-9.]/g, ""); // Allow numbers and dots
            if (value !== numericValue || value.trim() === "") {
              setWeightError("* Weight must be a number");
            } else {
              setWeightError("");
            }
            setWeight(value); // Update value even if invalid to allow correction
          }}
        />
        {weightError ? (
          <Text style={styles.errorText}>{weightError}</Text>
        ) : null}

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
          style={[styles.input, { height: 80 }]}
          placeholder="Description"
          placeholderTextColor={colors.primaryLight}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              opacity:
                loading || ageError.length > 0 || weightError.length > 0
                  ? 0.7
                  : 1,
            },
          ]}
          onPress={handleAddPet}
          disabled={loading || ageError.length > 0 || weightError.length > 0}
        >
          {isLoading ? (
            <Text style={styles.addButtonText}>+ Add</Text>
          ) : (
            <Text style={styles.addButtonText}>Loading...</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
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
    width: 170,
    height: 170,
    borderRadius: 55,
    marginBottom: 8,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  image: {
    alignItems: "center",
  },
  errorText: {
    color: "red",
    marginLeft: 10,
    marginBottom: 10,
  },
});

export default AddPet;
