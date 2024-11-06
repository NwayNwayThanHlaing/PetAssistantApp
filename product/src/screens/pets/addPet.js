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

const AddPet = ({ navigation }) => {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");

  const handleAddPet = () => {
    if (!name || !breed || !age) {
      Alert.alert("Error", "Please fill out all required fields.");
      return;
    }

    const newPet = { id: Date.now().toString(), name, breed, age, description };
    console.log("New Pet:", newPet);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.header}>Create a new Pet Profile</Text>

          <TouchableOpacity style={styles.image}>
            <Image
              source={require("../../../assets/dog.png")}
              style={styles.petImage}
            />
          </TouchableOpacity>
          <Text
            style={{
              textAlign: "center",
              marginBottom: 40,
              textDecorationLine: "underline",
            }}
          >
            Upload Pet Image
          </Text>

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
            style={[styles.input, { height: 80 }]}
            placeholder="Description"
            placeholderTextColor={colors.primaryLight}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
            <Text style={styles.addButtonText}>Add Pet</Text>
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
    paddingTop: 50,
    backgroundColor: colors.background,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginVertical: 40,
    textAlign: "center",
  },
  input: {
    borderRadius: 8,
    borderColor: colors.primaryLightest,
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "white",
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  petImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginVertical: 20,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  image: {
    alignItems: "center",
  },
});

export default AddPet;
