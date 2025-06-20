import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { firestore, auth } from "../auth/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { colors } from "../styles/Theme";
import { MaterialIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

const ChatInbox = ({ navigation }) => {
  const currentUser = auth.currentUser;
  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      const friendsData = {};

      const promises = chats.map(async (chat) => {
        const friendId = chat.participants.find((id) => id !== currentUser.uid);

        if (friendId && !friends[friendId]) {
          try {
            const userDoc = await getDoc(doc(firestore, "users", friendId));

            if (userDoc.exists) {
              friendsData[friendId] = userDoc.data();
            }
          } catch (error) {
            console.error("Error fetching friend data:", error);
          }
        }
      });

      await Promise.all(promises);
      setFriends((prev) => ({ ...prev, ...friendsData }));
    };

    if (chats.length > 0) {
      fetchFriends();
    }
  }, [chats]);

  useEffect(() => {
    const chatsRef = collection(firestore, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", currentUser.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatData);
    });

    return () => unsubscribe();
  }, []);

  const visibleChats = chats.filter((item) => {
    return !(item.hiddenFor || []).includes(currentUser.uid);
  });

  const openChat = async (chat) => {
    const friendId = chat.participants.find((id) => id !== currentUser.uid);
    await updateDoc(doc(firestore, "chats", chat.id), {
      [`lastSeen.${currentUser.uid}`]: serverTimestamp(),
    });
    navigation.navigate("Chat", {
      chatId: chat.id,
      friendId: friendId,
    });
  };

  const deleteChatWithMessages = async (chatId) => {
    const chatRef = doc(firestore, "chats", chatId);

    // Delete all messages first
    const messagesRef = collection(firestore, "chats", chatId, "messages");
    const messagesSnap = await getDocs(messagesRef);

    const deletePromises = messagesSnap.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete the chat itself
    await deleteDoc(chatRef);
  };

  const handleDeleteChat = (chatId) => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const chatRef = doc(firestore, "chats", chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists()) {
                const data = chatSnap.data();
                const currentUserId = auth.currentUser.uid;
                const participants = data.participants || [];
                const hiddenFor = data.hiddenFor || [];
                const hiddenMap = data.hiddenMap || {};

                const updatedHiddenFor = [
                  ...new Set([...hiddenFor, currentUserId]),
                ];

                if (updatedHiddenFor.length === participants.length) {
                  // All participants have hidden — permanently delete
                  await deleteChatWithMessages(chatId);
                } else {
                  // Hide for current user only
                  await updateDoc(chatRef, {
                    hiddenFor: updatedHiddenFor,
                    hiddenMap: {
                      ...hiddenMap,
                      [currentUserId]: serverTimestamp(),
                    },
                  });
                }
              }
            } catch (error) {
              console.error("Error deleting chat:", error);
              Alert.alert(
                "Error",
                "Something went wrong while deleting the chat."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => {
    const friendId = item.participants.find((id) => id !== currentUser.uid);
    const friend = friends[friendId];
    const lastSeen = item.lastSeen?.[currentUser.uid];
    const isUnread =
      item.updatedAt?.toMillis() > (lastSeen?.toMillis?.() || 0) &&
      item.lastSenderId !== currentUser.uid;
    // Check if the last message sender is you
    const isLastMessageFromMe = item.lastSenderId === currentUser.uid;

    const renderRightActions = (progress, dragX, chatId) => {
      return (
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDeleteChat(chatId)}
        >
          <MaterialIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      );
    };
    const truncateByChar = (text, maxChars = 20) => {
      return text.length > maxChars
        ? text.slice(0, maxChars).trim() + "..."
        : text;
    };

    return (
      <Swipeable
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item.id)
        }
        overshootRight={false}
        friction={3}
      >
        <View style={{ backgroundColor: "#fff" }}>
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => openChat(item)}
          >
            <Image
              source={
                friend?.profileImage === "default" || !friend?.profileImage
                  ? require("../../assets/dog.png")
                  : { uri: friend.profileImage }
              }
              style={styles.avatar}
              resizeMode="cover"
            />

            <View style={styles.textContainer}>
              <Text
                style={[styles.friendName, isUnread && { fontWeight: "bold" }]}
              >
                {friend?.name || "Loading..."}
              </Text>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.lastMessage,
                    isUnread && { color: colors.primary, fontWeight: "bold" },
                  ]}
                >
                  {item.lastMessage
                    ? `${isLastMessageFromMe ? "You: " : ""}${truncateByChar(
                        item.lastMessage
                      )}`
                    : "Say hello!"}
                </Text>
                <Text style={styles.timestamp}>
                  {item.updatedAt?.toDate().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Text>
              </View>
            </View>
            {isUnread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        </View>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          testID="back-button"
          style={styles.back}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back-ios"
            color={colors.primary}
            size={16}
          />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>Chats</Text>
        </View>
      </View>

      <FlatList
        data={visibleChats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={chats.length > 10}
        contentContainerStyle={
          visibleChats.length === 0
            ? { flex: 1, justifyContent: "center" }
            : {
                borderBottomWidth: 1,
                borderBottomColor: colors.primaryLightest,
              }
        }
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", color: "#888", fontSize: 18 }}>
            No chats available
          </Text>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLightest,
  },
  back: {
    position: "absolute",
    left: 20,
    top: 17,
  },
  logo: { width: 45, height: 45, marginRight: 5 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.accent,
  },
  chatItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  avatar: { width: 55, height: 55, borderRadius: 55, marginRight: 10 },
  textContainer: { flex: 1 },
  friendName: {
    fontSize: 17,
    color: colors.primary,
    fontWeight: "500",
  },
  lastMessage: {
    color: colors.primaryLight,
    marginTop: 2,
    fontSize: 15,
  },
  timestamp: {
    fontSize: 13,
    color: colors.primaryLight,
    textAlign: "right",
    marginTop: 2,
  },
  deleteAction: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: "100%",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    marginHorizontal: 10,
    marginTop: 4,
  },
});

export default ChatInbox;
