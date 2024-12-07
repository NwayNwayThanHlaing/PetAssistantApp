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
  ActivityIndicator,
} from "react-native";
import { colors } from "../styles/Theme";
import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import logo from "../../assets/logo.png";
import AuthStyles from "../styles/AuthStyles";
import { registerIndieID, unregisterIndieDevice } from "native-notify";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "You have successfully logged in!");
      await registerIndieID(
        auth.currentUser.uid,
        25248,
        "wtOK6Mg9wWTJpjgjr1qH0v"
      );

      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    } catch (error) {
      Alert.alert("Login Failed", error.message);
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
            <Image source={logo} style={AuthStyles.logo} />
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
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View style={AuthStyles.buttonContent}>
                  <Text style={AuthStyles.buttonText}>Log In</Text>
                  <MaterialIcons
                    name="pets"
                    size={20}
                    color="white"
                    style={AuthStyles.icon}
                  />
                </View>
              )}
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
