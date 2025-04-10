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
  const [chatData, setChatData] = useState(null);
  const [friend, setFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedMessageText, setEditedMessageText] = useState("");
  const [hiddenMessages, setHiddenMessages] = useState([]);
  const flatListRef = useRef(null);

  const deleteForMe = async (messageId) => {
    setHiddenMessages((prev) => [...prev, messageId]);
  };

  // Fetch Chat Data
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const chatRef = doc(firestore, "chats", chatId);
        const chatSnap = await getDoc(chatRef);
        if (chatSnap.exists()) {
          setChatData(chatSnap.data());
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };

    fetchChatData();
  }, [chatId]);

  // Fetch Friend Info
  useEffect(() => {
    const fetchFriendInfo = async () => {
      try {
        const friendRef = doc(firestore, "users", friendId);
        const friendSnap = await getDoc(friendRef);
        if (friendSnap.exists()) {
          setFriend(friendSnap.data());
        }
      } catch (error) {
        console.error("Error fetching friend info:", error);
      }
    };

    fetchFriendInfo();
  }, [friendId]);

  // Subscribe to Messages
  useEffect(() => {
    const messagesRef = collection(firestore, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  const hiddenSince = chatData?.hiddenMap?.[currentUser.uid];

  const filteredMessages = messages.filter((msg) => {
    if (!hiddenSince) return true;
    return msg.createdAt?.toMillis() > hiddenSince.toMillis();
  });

  // Update Last Seen
  useEffect(() => {
    const updateLastSeen = async () => {
      if (!chatId || !currentUser?.uid) return;

      const chatRef = doc(firestore, "chats", chatId);
      await updateDoc(chatRef, {
        [`lastSeen.${currentUser.uid}`]: serverTimestamp(),
      });
    };

    if (messages.length > 0) {
      updateLastSeen();
    }
  }, [messages]);

  // Format Date Label
  const formatDateLabel = (date) => {
    const today = new Date();
    const messageDate = new Date(date);

    const isToday = messageDate.toDateString() === today.toDateString();

    return isToday
      ? "Today"
      : messageDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  // Send New Message
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
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        participants: [currentUser.uid, friendId],
        hiddenMap: {},
        hiddenFor: [],
        lastMessage: input.trim(),
        lastSenderId: currentUser.uid,
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(chatRef, {
        hiddenFor: [],
        lastMessage: input.trim(),
        lastSenderId: currentUser.uid,
        updatedAt: serverTimestamp(),
      });
    }

    setInput("");
    flatListRef.current.scrollToEnd({ animated: true });
  };

  // Save Edited Message
  const saveEditedMessage = async () => {
    if (!editedMessageText.trim()) return;

    try {
      const messageRef = doc(
        firestore,
        "chats",
        chatId,
        "messages",
        editingMessageId
      );
      await updateDoc(messageRef, {
        text: editedMessageText.trim(),
        editedAt: serverTimestamp(),
      });
      // Check if this is the last message
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.id === editingMessageId) {
        const chatRef = doc(firestore, "chats", chatId);
        await updateDoc(chatRef, {
          lastMessage: editedMessageText.trim(),
          updatedAt: serverTimestamp(),
        });
      }

      // Reset editing state
      setEditingMessageId(null);
      setEditedMessageText("");
    } catch (error) {
      console.error("Error saving edited message:", error);
    }
  };

  // Delete For Everyone
  const deleteForEveryone = async (messageId) => {
    try {
      const messageRef = doc(firestore, "chats", chatId, "messages", messageId);
      await updateDoc(messageRef, {
        text: "This message was deleted.",
        deletedForEveryone: true,
        deletedAt: serverTimestamp(),
      });

      // Check if this message is the last one
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.id === messageId) {
        // Either clear or fallback to second-last message
        const secondLast = messages[messages.length - 2];

        const chatRef = doc(firestore, "chats", chatId);
        await updateDoc(chatRef, {
          lastMessage: secondLast
            ? secondLast.text
            : "This message was deleted.",
          lastSenderId: secondLast ? secondLast.senderId : "",
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error deleting for everyone:", error);
    }
  };

  // Message Options On Long Press
  const handleLongPress = (message) => {
    const isMe = message.senderId === currentUser.uid;
    const isDeleted = message.deletedForEveryone === true;

    const messageTime = message.createdAt?.toDate();
    const now = new Date();
    const diffInMinutes = (now - messageTime) / 60000;

    let options = [];

    if (isMe) {
      // Sent by me
      if (!isDeleted && diffInMinutes <= 3) {
        options.push("Edit", "Delete for Everyone");
      }
    }

    // "Delete for Me" should always be shown, no matter if it's my message or not
    options.push("Delete for Me", "Cancel");

    Alert.alert(
      "Message Options",
      "Choose an action:",
      options.map((option) => ({
        text: option,
        onPress: () => handleOptionSelect(option, message),
        style:
          option === "Delete for Everyone" || option === "Delete for Me"
            ? "destructive"
            : "default",
      })),
      { cancelable: true }
    );
  };

  const handleOptionSelect = (option, message) => {
    switch (option) {
      case "Edit":
        setEditingMessageId(message.id);
        setEditedMessageText(message.text);
        break;
      case "Delete for Everyone":
        deleteForEveryone(message.id);
        break;
      case "Delete for Me":
        deleteForMe(message.id);
        break;
      default:
        break;
    }
  };

  // Render Each Message
  const renderItem = ({ item, index }) => {
    const isMe = item.senderId === currentUser.uid;
    const isDeleted = item.deletedForEveryone === true;
    const currentDate = item.createdAt?.toDate().toDateString();
    const prevDate =
      index > 0
        ? filteredMessages[index - 1].createdAt?.toDate().toDateString()
        : null;

    const showDateLabel = currentDate !== prevDate;
    return (
      <>
        {showDateLabel && item.createdAt && (
          <View
            style={{
              alignItems: "center",
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: colors.primaryLight, fontWeight: "600" }}>
              {formatDateLabel(item.createdAt.toDate())}
            </Text>
          </View>
        )}
        <TouchableOpacity
          onLongPress={() => !isDeleted && handleLongPress(item)}
          activeOpacity={0.8}
          style={[
            styles.messageContainer,
            isDeleted
              ? isMe
                ? styles.myDeletedMessage
                : styles.theirDeletedMessage
              : isMe
              ? styles.myMessage
              : styles.theirMessage,
          ]}
        >
          {isDeleted ? (
            <Text style={styles.deletedText}>This message was deleted.</Text>
          ) : (
            <>
              <Text style={isMe ? styles.myText : styles.messageText}>
                {item.text}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {item.editedAt && (
                  <Text
                    style={isMe ? styles.editedLabel : styles.editedLabelOther}
                  >
                    edited
                  </Text>
                )}

                {/* Time */}
                {item.createdAt && (
                  <Text
                    style={isMe ? styles.myTimeLabel : styles.theirTimeLabel}
                  >
                    {item.createdAt.toDate().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </Text>
                )}
              </View>
            </>
          )}
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
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

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={filteredMessages}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <View style={styles.friendImageHeader}>
              <Image
                source={
                  friend?.profileImage === "default"
                    ? require("../../assets/dog.png")
                    : { uri: friend?.profileImage }
                }
                style={styles.friendAvatarHeader}
              />
              <Text style={styles.friendNameHeader}>
                {friend?.name || "Friend"}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Wall", {
                    userId: friendId,
                    userName: friend?.name || "Friend",
                    userImage: friend?.profileImage || "default",
                  })
                }
                style={styles.viewProfileButton}
              >
                <Text style={styles.viewProfileText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Text style={{ color: colors.primaryLight, fontSize: 16 }}>
                Say hello! 👋
              </Text>
            </View>
          )}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current.scrollToEnd({ animated: true })
          }
        />
        {/* Input Area */}
        <View
          style={
            editingMessageId
              ? styles.editingInputContainer
              : styles.inputContainer
          }
        >
          {editingMessageId ? (
            <>
              <View style={styles.editingHeader}>
                <Text style={styles.editingTitle}>Edit message</Text>
                <TouchableOpacity
                  onPress={() => {
                    setEditingMessageId(null);
                    setEditedMessageText("");
                  }}
                >
                  <MaterialIcons
                    name="close"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.editingInputRow}>
                <TextInput
                  style={styles.editInputField}
                  placeholder="Edit your message..."
                  value={editedMessageText}
                  onChangeText={setEditedMessageText}
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveEditedMessage}
                >
                  <MaterialIcons name="check" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                value={input}
                onChangeText={setInput}
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <MaterialIcons
                  name="send"
                  size={18}
                  color={colors.background}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  friendImageHeader: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
  friendAvatarHeader: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  friendNameHeader: {
    color: colors.primary,
    fontSize: 20,
    marginTop: 10,
    fontWeight: "bold",
  },
  viewProfileButton: {
    backgroundColor: colors.primaryLightest,
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  viewProfileText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
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
  myDeletedMessage: {
    borderColor: colors.primaryLightest,
    borderWidth: 1,
    alignSelf: "flex-end",
  },
  theirDeletedMessage: {
    borderColor: colors.primaryLightest,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  deletedText: {
    color: colors.primaryLighter,
    fontStyle: "italic",
  },
  theirDeletedText: {
    color: colors.primary,
    fontStyle: "italic",
    flex: "start",
  },
  messageText: { color: colors.primary, fontSize: 16, fontWeight: "500" },
  myText: { color: colors.background, fontSize: 16, fontWeight: "500" },
  editedLabel: {
    fontSize: 12,
    color: colors.background,
    marginTop: 2,
    marginRight: 5,
    alignSelf: "flex-end",
    fontStyle: "italic",
  },
  editedLabelOther: {
    fontSize: 12,
    color: colors.primaryLight,
    marginTop: 2,
    marginRight: 5,
    alignSelf: "flex-start",
    fontStyle: "italic",
  },
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
    fontSize: 16,
    marginRight: 15,
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
    fontSize: 16,
    fontWeight: "bold",
  },
  editingInputContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    padding: 10,
    borderRadius: 20,
    alignSelf: "center",
  },
  editingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  editingTitle: {
    fontSize: 14,
    color: colors.primaryLight,
  },
  editingInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  editInputField: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    color: colors.primaryLight,
  },
  myTimeLabel: {
    fontSize: 12,
    color: colors.background,
    alignSelf: "flex-end",
  },
  theirTimeLabel: {
    fontSize: 12,
    color: colors.primaryLight,
    marginTop: 2,
    alignSelf: "flex-start",
  },
  saveButton: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
});

export default Chat;
