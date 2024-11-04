import React, { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
import { colors } from "../styles/Theme";
import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import AuthStyles from "../styles/AuthStyles";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "You have successfully logged in!");
      navigation.navigate("Dashboard");
    } catch (error) {
      Alert.alert("Login Failed", error.message);
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
            <Text style={[AuthStyles.heading]}>Log In</Text>
            <Text style={AuthStyles.subheading}>Please log in to continue</Text>

            <TextInput
              style={AuthStyles.input}
              placeholder="Email Address"
              placeholderTextColor={colors.primaryLight}
              textContentType="oneTimeCode"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={AuthStyles.input}
              placeholder="Password"
              placeholderTextColor={colors.primaryLight}
              onChangeText={setPassword}
              value={password}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity style={AuthStyles.button} onPress={handleLogin}>
              <Text style={AuthStyles.buttonText}>Log In</Text>
              <MaterialIcons name="pets" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={AuthStyles.loginText}>
                Don't have an account?{" "}
                <Text style={AuthStyles.loginLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
