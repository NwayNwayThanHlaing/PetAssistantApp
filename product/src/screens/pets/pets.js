import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../styles/Theme";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { firestore, auth } from "../../auth/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useIsFocused } from "@react-navigation/native";
import dog from "../../../assets/dog.png";

const Pets = ({ navigation }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const userId = auth.currentUser.uid;
        const petsCollectionRef = collection(firestore, `users/${userId}/pets`);
        const petsSnapshot = await getDocs(petsCollectionRef);

        const petsData = petsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPets(petsData);
      } catch (error) {
        console.error("Error fetching pets:", error);
        Alert.alert("Error", "Failed to load pets. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) {
      fetchPets();
    }
  }, [isFocused]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderPetItem = ({ item }) => (
    <View style={styles.petCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate("PetProfile", { petId: item.id })}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <View style={styles.petInfo}>
          <Image
            source={item.imageUrl ? { uri: item.imageUrl } : dog}
            style={styles.avatar}
          />
          <View style={styles.petText}>
            <Text style={styles.petName}>{item.name}</Text>
            <Text style={styles.petBreed}>{item.breed}</Text>
          </View>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={colors.primaryLight}
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {pets.length === 0 ? (
        <Text
          style={{
            fontSize: 18,
            color: colors.secondary,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          No pets found
        </Text>
      ) : (
        <Text style={styles.header}>My Pets</Text>
      )}
      <FlatList
        data={pets}
        renderItem={renderPetItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
    color: colors.primary,
  },
  listContainer: {
    paddingBottom: 20,
  },
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLightest,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: "space-between",
  },
  petInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  petText: {
    flexDirection: "column",
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  petBreed: {
    fontSize: 14,
    color: colors.primary,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Pets;
