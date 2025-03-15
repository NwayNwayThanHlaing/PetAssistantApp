import React from "react";
import { useNavigation } from "@react-navigation/native";
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

const AppBar = ({ title }) => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={AppBarStyles.safeArea}>
      <View style={AppBarStyles.container}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={logo} style={{ width: 50, height: 50 }} />
          <Text style={AppBarStyles.title}>
            {title == "Home" ? "Purrnote" : title}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsInbox")}
        >
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
