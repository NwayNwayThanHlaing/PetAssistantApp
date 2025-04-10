import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import ImageViewing from "react-native-image-viewing";
import { colors } from "../styles/Theme";
import { firestore, auth } from "../auth/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
  addDoc,
  where,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const transformCloudinaryUrl = (
  url,
  options = "w_300,h_300,c_fill,q_auto,f_auto"
) => {
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/${options}/`);
};

const Wall = ({ navigation, route }) => {
  const currentUserId = auth?.currentUser?.uid;
  const { userId, userName, userImage } = route.params;
  const isOwner = currentUserId === userId;
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [imagesForViewer, setImagesForViewer] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedText, setEditedText] = useState("");

  // Fetch posts on mount
  useEffect(() => {
    const postRef = collection(firestore, "users", userId, "posts");
    const q = query(postRef, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postData);
      setLoadingPosts(false);
    });

    return unsubscribe;
  }, [userId]);

  const openImageViewer = (images, index) => {
    const formattedImages = images.map((img) => ({
      uri: transformCloudinaryUrl(img, "w_1200,h_1200,c_fit,q_auto,f_auto"),
    }));

    setImagesForViewer(formattedImages);
    setImageViewerIndex(index);
    setImageViewerVisible(true);
  };

  const startChat = async (navigation, currentUserId, otherUserId) => {
    try {
      const chatsRef = collection(firestore, "chats");

      const chatQuery = query(
        chatsRef,
        where("participants", "array-contains", currentUserId)
      );
      const snapshot = await getDocs(chatQuery);

      let existingChat = null;
      let existingDocId = null;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          data.participants.includes(otherUserId) &&
          data.participants.length === 2
        ) {
          existingChat = data;
          existingDocId = docSnap.id;
        }
      });

      if (existingChat && existingDocId) {
        const hiddenFor = existingChat.hiddenFor || [];

        if (hiddenFor.includes(currentUserId)) {
          const updatedHiddenFor = hiddenFor.filter(
            (uid) => uid !== currentUserId
          );
          await updateDoc(doc(firestore, "chats", existingDocId), {
            hiddenFor: updatedHiddenFor,
            hiddenMap: {
              ...existingChat.hiddenMap,
              [currentUserId]: serverTimestamp(), // Reset view point
            },
          });
        }
        navigation.navigate("Chat", {
          chatId: existingDocId,
          friendId: otherUserId,
        });
        return;
      }

      const newChatRef = await addDoc(chatsRef, {
        participants: [currentUserId, otherUserId],
        hiddenFor: [otherUserId],
        hiddenMap: {},
        lastMessage: "",
        lastSenderId: "",
        updatedAt: serverTimestamp(),
      });

      navigation.navigate("Chat", {
        chatId: newChatRef.id,
        friendId: otherUserId,
      });
    } catch (error) {
      alert("Failed to start chat. Please try again.");
    }
  };

  const handleDeletePost = (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(firestore, "users", userId, "posts", postId));
            Alert.alert("Post deleted!");
          } catch (error) {
            console.error("Failed to delete post", error);
          }
        },
      },
    ]);
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setEditedText(post.status);
  };
  const handleSavePost = async (postId) => {
    try {
      const postRef = doc(firestore, "users", userId, "posts", postId);

      await updateDoc(postRef, {
        status: editedText,
      });

      // Reset state after saving
      setEditingPostId(null);
      setEditedText("");
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };
  const handleCreatePost = () => {
    navigation.navigate("CreatePost");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.profileContainer}>
          <Image
            source={
              !userImage || userImage === "default"
                ? require("../../assets/profile.jpg")
                : {
                    uri: transformCloudinaryUrl(userImage),
                  }
            }
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userName}</Text>

          {isOwner ? (
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={handleCreatePost}
            >
              <Text style={styles.buttonText}>+ Create Post</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => startChat(navigation, currentUserId, userId)}
            >
              <Text style={styles.buttonText}>Message</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Posts */}
      {loadingPosts ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : posts.length === 0 ? (
        <Text style={styles.noPostsText}>No posts yet.</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const maxVisibleImages = 4;
            const totalImages = item.images.length;
            const visibleImages = item.images.slice(0, maxVisibleImages);
            const isEditing = editingPostId === item.id;

            return (
              <View style={styles.postBlock}>
                <View style={styles.postContainer}>
                  {isEditing ? (
                    <TextInput
                      style={styles.editTextInput}
                      value={editedText}
                      onChangeText={setEditedText}
                      multiline
                    />
                  ) : (
                    <Text style={styles.postStatus}>{item.status}</Text>
                  )}
                  {item.images.length > 0 && (
                    <TouchableOpacity
                      style={styles.imageGrid}
                      onPress={() => openImageViewer(item.images, 0)}
                    >
                      {visibleImages.map((imageUri, index) => {
                        const optimizedUri = transformCloudinaryUrl(imageUri);
                        const isLastVisible =
                          index === maxVisibleImages - 1 &&
                          totalImages > maxVisibleImages;
                        const remainingCount = totalImages - maxVisibleImages;

                        return (
                          <View key={index} style={styles.imageWrapper}>
                            <Image
                              source={{ uri: optimizedUri }}
                              style={styles.thumbnailImage}
                              resizeMode="cover"
                            />
                            {isLastVisible && (
                              <View style={styles.overlay}>
                                <Text style={styles.overlayText}>
                                  +{remainingCount}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.edit}>
                  {isOwner && (
                    <View style={styles.postActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() =>
                          isEditing
                            ? handleSavePost(item.id)
                            : handleEditPost(item)
                        }
                      >
                        <Text style={styles.actionText}>
                          {isEditing ? "Save" : "Edit"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeletePost(item.id)}
                      >
                        <Text style={styles.actionText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <Text
                    style={
                      isOwner
                        ? styles.postDate
                        : {
                            textAlign: "right",
                            fontSize: 14,
                            paddingLeft: 15,
                            color: colors.primaryLight,
                            marginTop: 8,
                          }
                    }
                  >
                    {item.date?.toDate().toLocaleDateString("en-GB")}{" "}
                    {item.date?.toDate().toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </Text>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.postsList}
          ListFooterComponent={
            <Text style={styles.endOfPostsText}>- End of posts -</Text>
          }
        />
      )}

      {/* Image Viewer */}
      <ImageViewing
        images={imagesForViewer}
        imageIndex={imageViewerIndex}
        visible={isImageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#fff",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    shadowOpacity: 0.1,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    color: colors.accent,
    fontSize: 16,
  },
  profileContainer: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.primary,
  },
  createPostButton: {
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  messageButton: {
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  edit: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  postsList: { paddingHorizontal: 12, paddingTop: 10, marginTop: 10 },
  postBlock: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLightest,
    paddingBottom: 15,
    marginBottom: 15,
  },
  postContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  postStatus: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 8,
  },
  postDate: {
    textAlign: "right",
    marginRight: 15,
    marginTop: 8,
    fontSize: 14,
    color: colors.primaryLight,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 10,
  },
  editButton: {
    paddingLeft: 15,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButton: {
    paddingVertical: 6,
    borderRadius: 8,
  },
  editTextInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginVertical: 8,
    height: 60,
  },
  actionText: {
    color: colors.accent,
    fontSize: 14,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  imageWrapper: {
    width: "24%",
    aspectRatio: 1,
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  noPostsText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
    color: colors.primaryLight,
  },
  endOfPostsText: {
    textAlign: "center",
    fontSize: 14,
    marginVertical: 15,
    color: colors.primaryLight,
  },
});
export default Wall;
