import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { firestore, auth } from "../auth/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { colors } from "../styles/Theme";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat = ({ route, navigation }) => {
  const { chatId, friendId } = route.params;
  const currentUser = auth.currentUser;
  const [friend, setFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedMessageText, setEditedMessageText] = useState("");
  const [hiddenMessages, setHiddenMessages] = useState([]);
  const deleteForMe = async (messageId) => {
    setHiddenMessages((prev) => [...prev, messageId]);
  };

  const filteredMessages = messages.filter(
    (msg) => !hiddenMessages.includes(msg.id)
  );

  useEffect(() => {
    const fetchFriendInfo = async () => {
      try {
        const friendRef = doc(firestore, "users", friendId);
        const friendSnap = await getDoc(friendRef);

        if (friendSnap.exists()) {
          setFriend(friendSnap.data());
        } else {
          console.log("Friend not found");
        }
      } catch (error) {
        console.error("Error fetching friend info:", error);
      }
    };

    fetchFriendInfo();
  }, [friendId]);

  useEffect(() => {
    const messagesRef = collection(firestore, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messagesRef = collection(firestore, "chats", chatId, "messages");

    const newMessage = {
      text: input.trim(),
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
    };

    await addDoc(messagesRef, newMessage);

    const chatRef = doc(firestore, "chats", chatId);
    await updateDoc(chatRef, {
      lastMessage: input.trim(),
      lastSenderId: currentUser.uid,
      updatedAt: serverTimestamp(),
    });

    setInput("");
    flatListRef.current.scrollToEnd({ animated: true });
  };

  const handleLongPress = (message) => {
    const isMe = message.senderId === currentUser.uid;
    if (!isMe) return;

    const messageTime = message.createdAt?.toDate();
    const now = new Date();
    const diffInMinutes = (now - messageTime) / 60000;

    const options = [
      ...(diffInMinutes <= 3 ? ["Edit", "Delete for Everyone"] : []),
      "Delete for Me",
      "Cancel",
    ];

    Alert.alert(
      "Message Options",
      "Choose an action",
      options.map((option) => ({
        text: option,
        onPress: () => handleOptionSelect(option, message),
      })),
      { cancelable: true }
    );
  };

  const handleOptionSelect = async (option, message) => {
    if (option === "Edit") {
      setEditingMessageId(message.id);
      setEditedMessageText(message.text);
    } else if (option === "Delete for Everyone") {
      await deleteForEveryone(message.id);
    } else if (option === "Delete for Me") {
      await deleteForMe(message.id);
    }
  };

  const saveEditedMessage = async () => {
    if (!editedMessageText.trim()) return;

    const messageRef = doc(
      firestore,
      "chats",
      chatId,
      "messages",
      editingMessageId
    );

    try {
      await updateDoc(messageRef, {
        text: editedMessageText,
        editedAt: serverTimestamp(),
      });

      setEditingMessageId(null);
      setEditedMessageText("");
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const deleteForEveryone = async (messageId) => {
    const messageRef = doc(firestore, "chats", chatId, "messages", messageId);

    try {
      await updateDoc(messageRef, {
        text: "This message was deleted.",
        deletedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error deleting for everyone:", error);
    }
  };

  const renderItem = ({ item }) => {
    const isMe = item.senderId === currentUser.uid;
    const isEditing = editingMessageId === item.id;

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.8}
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {isEditing ? (
          <View style={styles.editingContainer}>
            <TextInput
              value={editedMessageText}
              onChangeText={setEditedMessageText}
              multiline
              placeholder="Edit your message..."
              style={styles.editInput}
            />
            <TouchableOpacity
              onPress={saveEditedMessage}
              style={styles.saveButton}
            >
              <MaterialIcons name="check" size={20} color={colors.background} />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={isMe ? styles.myText : styles.messageText}>
            {item.text}
          </Text>
        )}

        {item.editedAt && !item.deletedAt && (
          <Text style={styles.editedLabel}>(edited)</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" style={styles.backButton} />
          </TouchableOpacity>

          <View style={styles.friendInfo}>
            <Image
              source={
                friend?.profileImage === "default"
                  ? require("../../assets/dog.png")
                  : { uri: friend?.profileImage }
              }
              style={styles.avatar}
            />
            <Text style={styles.friendName}>{friend?.name || "Friend"}</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={filteredMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current.scrollToEnd({ animated: true })
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <MaterialIcons name="send" size={18} color={colors.background} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  messageList: { padding: 12 },
  messageContainer: {
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: "70%",
  },
  myMessage: {
    backgroundColor: colors.accent,
    alignSelf: "flex-end",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 0,
  },
  theirMessage: {
    backgroundColor: colors.primaryLightest,
    alignSelf: "flex-start",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 0,
  },
  messageText: { color: colors.primary },
  myText: { color: colors.background },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.light,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "center",
  },
  sendButtonText: { color: colors.background, fontWeight: "bold" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLightest,
  },
  backButton: {
    color: colors.primary,
    fontSize: 24,
    marginRight: 15,
    marginLeft: 5,
    fontSize: 16,
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendName: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  editedLabel: {
    fontSize: 10,
    color: colors.primaryLight,
    marginTop: 2,
  },
});

export default Chat;
