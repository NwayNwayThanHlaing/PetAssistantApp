import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const PetProfile = ({ route, navigation }) => {
  // Assume you pass pet details through route.params
  const { pet } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Pet Image */}
      <Image
        source={require("./path/to/pet-image.png")}
        style={styles.petImage}
      />

      {/* Pet Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petBreed}>{pet.breed}</Text>

        {/* Other Details */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Age:</Text>
          <Text style={styles.infoText}>{pet.age} years</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Description:</Text>
          <Text style={styles.infoText}>
            {pet.description || "No description available"}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Health Info:</Text>
          <Text style={styles.infoText}>
            {pet.healthInfo || "No health information available"}
          </Text>
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditPet", { petId: pet.id })}
        >
          <MaterialIcons name="edit" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  petImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginVertical: 20,
    backgroundColor: "#E0E0E0", // Placeholder color
  },
  detailsContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  petName: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  petBreed: {
    fontSize: 18,
    color: "#757575",
    textAlign: "center",
    marginBottom: 20,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    width: 100,
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    flexShrink: 1,
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: "#FF6D00",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default PetProfile;
