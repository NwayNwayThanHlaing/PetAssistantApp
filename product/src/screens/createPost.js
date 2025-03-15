import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { firestore, auth } from "../auth/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const MAX_IMAGES = 9;
const MAX_STATUS_LENGTH = 300;

const CreatePost = ({ navigation }) => {
  const [status, setStatus] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: MAX_IMAGES - images.length, // prevent exceeding
      });

      if (!result.canceled) {
        const uris = result.assets.map((asset) => asset.uri);
        if (images.length + uris.length > MAX_IMAGES) {
          Alert.alert(`You can upload up to ${MAX_IMAGES} images.`);
          return;
        }
        setImages([...images, ...uris]);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Failed to pick images");
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    const data = new FormData();
    data.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "post_image.jpg",
    });
    data.append("upload_preset", "purr_note");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dunbwugns/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      if (result.secure_url) {
        return result.secure_url;
      } else {
        console.error("Cloudinary upload failed:", result);
        return null;
      }
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handlePost = async () => {
    if (!status.trim() && images.length === 0) {
      Alert.alert("Post can't be empty!");
      return;
    }

    if (status.length > MAX_STATUS_LENGTH) {
      Alert.alert(
        `Status can't be longer than ${MAX_STATUS_LENGTH} characters.`
      );
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls = [];

      for (let i = 0; i < images.length; i++) {
        const uri = images[i];
        const url = await uploadImageToCloudinary(uri);

        if (url) {
          uploadedUrls.push(url);
        } else {
          Alert.alert(`Failed to upload image ${i + 1}`);
        }
      }

      const userId = auth.currentUser.uid;
      const postRef = collection(firestore, "users", userId, "posts");

      await addDoc(postRef, {
        status: status.trim(),
        images: uploadedUrls,
        date: serverTimestamp(),
      });

      Alert.alert("Post Created!");

      resetForm();
      navigation.goBack();
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setStatus("");
    setImages([]);
  };

  const removeImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Post</Text>

      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={status}
        onChangeText={(text) => {
          if (text.length <= MAX_STATUS_LENGTH) {
            setStatus(text);
          }
        }}
        multiline
      />
      <Text style={styles.counter}>
        {status.length} / {MAX_STATUS_LENGTH}
      </Text>

      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
        <Text style={styles.imagePickerText}>
          Pick Images ({images.length}/{MAX_IMAGES})
        </Text>
      </TouchableOpacity>

      <FlatList
        data={images}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        renderItem={({ item, index }) => (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.previewList}
      />

      {uploading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : (
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  counter: {
    textAlign: "right",
    marginBottom: 16,
    color: "#777",
  },
  imagePickerButton: {
    backgroundColor: "#6200ee",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  imagePickerText: {
    color: "#fff",
    fontSize: 16,
  },
  previewList: {
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
    marginRight: 8,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "#fff",
    fontSize: 14,
  },
  postButton: {
    backgroundColor: "#03dac5",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  postButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CreatePost;
