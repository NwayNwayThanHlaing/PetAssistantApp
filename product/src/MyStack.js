import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./auth/login";
import Signup from "./auth/signup";
import Home from "./screens/home";
import Dashboard from "./screens/dashboard";
import Vet from "./screens/vet";
import Profile from "./screens/profile";
import Calendar from "./screens/calendar";
import Pets from "./screens/pets";

const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={Signup} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Vet" component={Vet} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Calendar" component={Calendar} />
        <Stack.Screen name="Pets" component={Pets} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MyStack;
