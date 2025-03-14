import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../styles/Theme";

const FriendProfile = ({ navigation, route }) => {
  const { userId, userName, userImage } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <Image
          source={
            userImage === "default"
              ? require("../../assets/dog.png")
              : { uri: userImage }
          }
          style={styles.avatar}
        />
        <Text style={styles.userName}>{userName}</Text>
        {/* Add more user info here, like bio, posts, etc. */}
        <Text style={styles.userId}>User ID: {userId}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  back: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
    alignSelf: "flex-start",
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  userId: {
    marginTop: 10,
    color: "#777",
  },
});

export default FriendProfile;
