import React from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { colors } from "../../styles/Theme";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const petsData = [
  { id: "1", name: "Ori", breed: "Burmese Cat" },
  { id: "2", name: "Ori", breed: "Burmese Cat" },
  { id: "3", name: "Ori", breed: "Burmese Cat" },
  { id: "4", name: "Ori", breed: "Burmese Cat" },
];

const Pets = ({ navigation }) => {
  const renderPetItem = ({ item }) => (
    <View style={styles.petCard}>
      <View style={styles.petInfo}>
        <Image
          source={require("../../../assets/dog.png")}
          style={styles.avatar}
        />
        <View style={styles.petText}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petBreed}>{item.breed}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate("PetDetails", { petId: item.id })}
      >
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={colors.primaryLight}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Pets</Text>
      <FlatList
        data={petsData}
        renderItem={renderPetItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddPet")}
      >
        <Text style={styles.addButtonText}>Add more pet</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
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
