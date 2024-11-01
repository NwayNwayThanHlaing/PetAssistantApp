import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screens
import Login from "./auth/login";
import Signup from "./auth/signup";

const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }} // Hide header for Login
        />
        <Stack.Screen
          name="SignUp"
          component={Signup}
          options={{ headerShown: false }} // Optional title for the header
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MyStack;
