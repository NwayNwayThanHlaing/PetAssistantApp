import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { GOOGLE_MAPS_API_KEY } from "@env";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../styles/Theme";

const Maps = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied.");
        return;
      }
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
      fetchVets(userLocation.coords);
    })();
  }, []);

  const fetchVets = async (coords) => {
    try {
      const { latitude, longitude } = coords;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=veterinary_care&key=${GOOGLE_MAPS_API_KEY}`
      );

      setVets(response.data.results);
    } catch (error) {
      console.error("Error fetching vets:", error);
    } finally {
      setLoading(false);
    }
  };

  const centerMapOnUserLocation = async () => {
    try {
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        });
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Finding nearby vets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="You"
          pinColor="blue"
        />

        {vets.map((vet, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: vet.geometry.location.lat,
              longitude: vet.geometry.location.lng,
            }}
            title={vet.name}
            description={vet.vicinity}
            pinColor="green"
          />
        ))}
      </MapView>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={20} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.locationButton}
        onPress={centerMapOnUserLocation}
      >
        <MaterialIcons name="my-location" size={25} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate("ChatInbox")}
      >
        <MaterialIcons name="chat" size={25} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  locationButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  chatButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: colors.accent,
    borderRadius: 30,
    padding: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  back: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 7,
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
});

export default Maps;
