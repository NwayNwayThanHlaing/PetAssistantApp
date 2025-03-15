import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
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
  doc,
} from "firebase/firestore";
import { colors } from "../styles/Theme";
import { MaterialIcons } from "@expo/vector-icons";

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

  const renderItem = ({ item }) => {
    const friendId = item.participants.find((id) => id !== currentUser.uid);
    const friend = friends[friendId];

    // Check if the last message sender is you
    const isLastMessageFromMe = item.lastSenderId === currentUser.uid;

    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => openChat(item)}>
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
          <Text style={styles.friendName}>{friend?.name || "Loading..."}</Text>

          <Text style={styles.lastMessage}>
            {item.lastMessage
              ? `${isLastMessageFromMe ? "You: " : ""}${item.lastMessage}`
              : "Say hello!"}
          </Text>
        </View>

        <Text style={styles.timestamp}>
          {item.updatedAt?.toDate().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back-ios" color={colors.primary} size={16} />
      </TouchableOpacity>
      <View style={styles.header}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} />
        <Text style={styles.headerTitle}>Chats</Text>
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
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLightest,
  },
  back: {
    paddingLeft: 20,
    paddingBottom: 10,
  },
  logo: { width: 45, height: 45, marginRight: 5 },
  listContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLightest,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.accent,
  },
  chatItem: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  textContainer: { flex: 1 },
  friendName: { fontSize: 14 },
  lastMessage: { color: colors.primaryLight, marginTop: 4 },
  timestamp: { fontSize: 12, color: colors.primaryLight },
});

export default ChatInbox;
