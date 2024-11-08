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
  ActivityIndicator,
} from "react-native";
import { colors } from "../styles/Theme";
import { useTheme } from "../contexts/ThemeContext";
import { auth, firestore } from "./firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import AuthStyles from "../styles/AuthStyles";

const Signup = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        name: name,
        email: email,
        profileImage: null,
      };

      await setDoc(doc(firestore, "users", user.uid), userData);
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Signup Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={AuthStyles.container}>
          <View style={AuthStyles.logoContainer}>
            <Image
              source={require("../../assets/logo.png")}
              style={AuthStyles.logo}
            />
            <Text style={[AuthStyles.title]}>PURRNOTE</Text>
          </View>

          <View style={AuthStyles.formContainer}>
            <Text style={[AuthStyles.heading]}>Sign Up</Text>
            <Text style={AuthStyles.subheading}>Let's create your account</Text>

            <TextInput
              style={AuthStyles.input}
              placeholder="Name"
              placeholderTextColor={colors.primaryLighter}
              onChangeText={setName}
              value={name}
            />

            <TextInput
              style={AuthStyles.input}
              textContentType="oneTimeCode"
              placeholder="Email Address"
              placeholderTextColor={colors.primaryLighter}
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={AuthStyles.input}
              placeholder="Password"
              placeholderTextColor={colors.primaryLighter}
              onChangeText={setPassword}
              value={password}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity style={AuthStyles.button} onPress={handleSignup}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View style={AuthStyles.buttonContent}>
                  <Text style={AuthStyles.buttonText}>Sign up</Text>
                  <MaterialIcons
                    name="pets"
                    size={20}
                    color="white"
                    style={AuthStyles.icon}
                  />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={AuthStyles.loginText}>
                Already have an account?{" "}
                <Text style={AuthStyles.loginLink}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;
