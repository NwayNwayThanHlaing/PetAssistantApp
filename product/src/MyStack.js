import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./auth/login";
import Signup from "./auth/signup";
import Home from "./screens/home";
import ReminderPage from "./screens/reminder";
import Dashboard from "./screens/dashboard";
import Booking from "./screens/pets/booking";
import Profile from "./screens/profile";
import CalendarPage from "./screens/calendar/calendar";
import Pets from "./screens/pets/pets";
import AddPet from "./screens/pets/addPet";
import PetProfile from "./screens/pets/profile";
import NotificationsInbox from "./screens/calendar/notificationsInbox";
import Maps from "./screens/maps";
import Chat from "./screens/chat";
import ChatInbox from "./screens/chatInbox";
import FriendProfile from "./screens/friendProfile";

const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerMode: "screen",
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            gestureEnabled: false,
            headerShown: false,
          }}
        />
        <Stack.Screen name="SignUp" component={Signup} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Maps" component={Maps} />
        <Stack.Screen name="FriendProfile" component={FriendProfile} />
        <Stack.Screen name="ChatInbox" component={ChatInbox} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="ReminderPage" component={ReminderPage} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Booking" component={Booking} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="CalendarPage" component={CalendarPage} />
        <Stack.Screen name="Pets" component={Pets} />
        <Stack.Screen name="AddPet" component={AddPet} />
        <Stack.Screen name="PetProfile" component={PetProfile} />
        <Stack.Screen
          name="NotificationsInbox"
          component={NotificationsInbox}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MyStack;
