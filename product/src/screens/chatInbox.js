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
  updateDoc,
  deleteDoc,
  doc,
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

  const openChat = (chat) => {
    const friendId = chat.participants.find((id) => id !== currentUser.uid);
    navigation.navigate("Chat", {
      chatId: chat.id,
      friendId: friendId,
    });
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

                const updatedHiddenFor = [
                  ...new Set([...hiddenFor, currentUserId]),
                ];

                if (updatedHiddenFor.length === participants.length) {
                  // All participants have hidden — permanently delete
                  await deleteDoc(chatRef);
                } else {
                  // Hide for current user only
                  await updateDoc(chatRef, {
                    hiddenFor: updatedHiddenFor,
                  });
                }
              }
            } catch (error) {
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
              <Text style={styles.friendName}>
                {friend?.name || "Loading..."}
              </Text>

              <Text style={styles.lastMessage}>
                {item.lastMessage
                  ? `${isLastMessageFromMe ? "You: " : ""}${item.lastMessage}`
                  : "Say hello!"}
              </Text>
            </View>

            <Text style={styles.timestamp}>
              {item.updatedAt?.toDate().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })}
              {"\n"}
              {item.updatedAt?.toDate().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
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
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={chats.length > 10}
        contentContainerStyle={[
          styles.listContainer,
          chats.length === 0 && { flex: 1, justifyContent: "center" },
        ]}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", color: "#888" }}>
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
  listContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLightest,
  },
  headerTitle: {
    fontSize: 20,
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
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  textContainer: { flex: 1 },
  friendName: {
    fontSize: 17,
    color: colors.primary,
    fontWeight: "500",
  },
  lastMessage: { color: colors.primaryLight, marginTop: 4, fontSize: 15 },
  timestamp: {
    fontSize: 13,
    color: colors.primaryLight,
    textAlign: "right",
  },
  deleteAction: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: "100%",
  },
});

export default ChatInbox;
