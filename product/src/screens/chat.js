import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../styles/Theme"; // Optional, for your color theme

const Chat = ({ navigation, route }) => {
  const [messages, setMessages] = useState([
    { id: "1", text: "Welcome to the Chat!", sender: "system" },
  ]);
  const [input, setInput] = useState("");
  const flatListRef = useRef(null);

  const sendMessage = () => {
    if (input.trim() === "") return;

    const newMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    // Scroll to the end of the list
    setTimeout(() => {
      flatListRef.current.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user" ? styles.userMessage : styles.systemMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <MaterialIcons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.primary || "#6200ee",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    marginLeft: 16,
    fontWeight: "bold",
  },
  messageList: {
    flexGrow: 1,
    padding: 10,
  },
  messageContainer: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
    maxWidth: "75%",
  },
  userMessage: {
    backgroundColor: colors.primary || "#6200ee",
    alignSelf: "flex-end",
  },
  systemMessage: {
    backgroundColor: "#e0e0e0",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: colors.primary || "#6200ee",
    borderRadius: 24,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Chat;
