import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import profile from "../../assets/profile.jpg";
import logo from "../../assets/logo.png";
import { colors } from "../styles/Theme";

const chatInbox = [
  {
    id: "1",
    name: "KW bel",
    lastMessage: "How you doing? mate",
    avatar: profile,
  },
  {
    id: "2",
    name: "Toe naing lin",
    lastMessage: "How you doing? mate",
    avatar: profile,
  },
  {
    id: "3",
    name: "Cherry",
    lastMessage: "How you doing? mate",
    avatar: profile,
  },
];

const ChatInbox = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate("ChatRoom", {
          chatId: item.id,
          chatName: item.name,
        })
      }
    >
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      <FlatList
        data={chatInbox}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 5,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "bold",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.primaryLight,
  },
});
export default ChatInbox;
