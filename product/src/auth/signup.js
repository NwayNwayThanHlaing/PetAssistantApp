import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext"; // Import your ThemeContext
import { auth, firestore } from "./firebaseConfig"; // Adjust the import based on your firebase config
import { createUserWithEmailAndPassword } from "firebase/auth"; // Import Firebase Auth function
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions
import { MaterialIcons } from "@expo/vector-icons"; // Ensure you import the icon library

const Signup = ({ navigation }) => {
  const [name, setName] = useState(""); // Added name state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { textColor } = useTheme(); // Get the text color from the context

  const handleSignup = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Prepare user data to be stored with a default profile image
      const userData = {
        uid: user.uid,
        name: name,
        email: email,
        profileImage: null, // Use the default profile image
      };

      // Add user data to Firestore
      await setDoc(doc(firestore, "users", user.uid), userData);

      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("Login"); // Navigate to Login screen after successful signup
    } catch (error) {
      Alert.alert("Signup Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
          {/* Top section with logo */}
          <View
            style={{
              backgroundColor: "#e0e0e0",
              height: 250,
              borderBottomLeftRadius: 100,
              borderBottomRightRadius: 100,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 30,
            }}
          >
            <Image
              source={require("../../assets/logo.png")}
              style={{ width: 80, height: 80, resizeMode: "contain" }}
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: textColor,
                fontFamily: "NerkoOne-Regular",
              }}
            >
              PURRNOTE
            </Text>
          </View>

          {/* Form section */}
          <View style={{ paddingHorizontal: 30, marginTop: 60 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: textColor,
                fontFamily: "NerkoOne-Regular",
                marginBottom: 5,
              }}
            >
              SIGN UP
            </Text>
            <Text style={{ fontSize: 16, color: "#666", marginBottom: 20 }}>
              Let's create your account
            </Text>

            <TextInput
              style={{
                height: 50,
                borderColor: "#ddd",
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 15,
                marginBottom: 15,
                backgroundColor: "#eee",
                fontSize: 16,
              }}
              placeholder="Name"
              placeholderTextColor="#999"
              onChangeText={setName} // Update name state
              value={name} // Bind name state
            />

            <TextInput
              style={{
                height: 50,
                borderColor: "#ddd",
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 15,
                marginBottom: 15,
                backgroundColor: "#eee",
                fontSize: 16,
              }}
              textContentType="oneTimeCode"
              placeholder="Email Address"
              placeholderTextColor="#999"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={{
                height: 50,
                borderColor: "#ddd",
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 15,
                marginBottom: 15,
                backgroundColor: "#eee",
                fontSize: 16,
              }}
              placeholder="Password"
              placeholderTextColor="#999"
              onChangeText={setPassword}
              value={password}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={{
                backgroundColor: "#ff7f50",
                paddingVertical: 15,
                borderRadius: 10,
                alignItems: "center",
                marginVertical: 20,
                flexDirection: "row",
                justifyContent: "center",
              }}
              onPress={handleSignup} // Call handleSignup on button press
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "bold",
                  marginRight: 8,
                }}
              >
                SIGN UP
              </Text>
              <MaterialIcons name="pets" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text
                style={{ textAlign: "center", fontSize: 14, color: "#444" }}
              >
                Already have an account?{" "}
                <Text
                  style={{
                    color: "#ff7f50",
                    fontWeight: "bold",
                    textDecorationLine: "underline",
                  }}
                >
                  Log In
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;
