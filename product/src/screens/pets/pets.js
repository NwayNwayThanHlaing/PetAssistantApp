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
import nothing from "../../../assets/nothing.png";

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
        <>
          <Image
            source={nothing}
            style={{
              width: 150,
              height: 150,
              alignSelf: "center",
              marginTop: 100,
              marginBottom: 30,
            }}
          />
          <Text
            style={{
              fontSize: 18,
              color: colors.secondary,
              textAlign: "center",
            }}
          >
            No pets found! {"\n"} Add a pet to get started.
          </Text>
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                paddingVertical: 15,
                marginTop: 40,
              },
            ]}
            onPress={() => navigation.navigate("AddPet")}
          >
            <Text style={styles.addButtonText}>Add a Pet</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.header}>My Pets</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddPet")}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={pets}
        style={{ paddingTop: 15 }}
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
    paddingHorizontal: 15,
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
    paddingVertical: 10,
    color: colors.primary,
  },
  listContainer: {
    paddingBottom: 20,
  },
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 15,
    marginBottom: 15,
    justifyContent: "space-between",
  },
  petInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 15,
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
    fontSize: 16,
    marginTop: 5,
    color: colors.primary,
  },
  addButton: {
    backgroundColor: colors.accent,
    padding: 5,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 15,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Pets;
