import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AppBarStyles } from "../styles/GlobalStyles";
import { colors } from "../styles/Theme";
import logo from "../../assets/logo.png";

const AppBar = ({ title, onLogout }) => {
  return (
    <SafeAreaView style={AppBarStyles.safeArea}>
      <View style={AppBarStyles.container}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={logo} style={{ width: 70, height: 70 }} />
          <Text style={AppBarStyles.title}>
            {title == "Home" ? "Purrnote" : title}
          </Text>
        </View>
        <TouchableOpacity style={AppBarStyles.logoutButton} onPress={onLogout}>
          <MaterialIcons
            name="notifications"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AppBar;
