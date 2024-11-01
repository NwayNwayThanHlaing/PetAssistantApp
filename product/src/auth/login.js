import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Image, Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext"; // Import your ThemeContext

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { textColor } = useTheme(); // Get the text color from the context

  return (
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
      <View style={{ paddingHorizontal: 30, marginTop: 20 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: textColor,
            fontFamily: "NerkoOne-Regular",
            marginBottom: 5,
          }}
        >
          LOG IN
        </Text>
        <Text style={{ fontSize: 16, color: "#666", marginBottom: 20 }}>
          Please log in to continue
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
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
            LOG IN 🐾
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={{ textAlign: "center", fontSize: 14, color: "#444" }}>
            Don't have an account?{" "}
            <Text style={{ color: "#ff7f50", fontWeight: "bold" }}>
              Sign Up
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
