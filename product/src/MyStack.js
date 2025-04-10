import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./auth/login";
import Signup from "./auth/signup";
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
import Wall from "./screens/wall";
import CreatePost from "./screens/createPost";
import PrivacyPolicy from "./screens/privacyPolicy";
const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <Stack.Screen name="Maps" component={Maps} />
          <Stack.Screen name="Wall" component={Wall} />
          <Stack.Screen name="CreatePost" component={CreatePost} />
          <Stack.Screen name="ChatInbox" component={ChatInbox} />
          <Stack.Screen name="Chat" component={Chat} />
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
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default MyStack;
