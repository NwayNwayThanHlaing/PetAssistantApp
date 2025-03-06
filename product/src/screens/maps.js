// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   StyleSheet,
//   TouchableOpacity,
// } from "react-native";
// import MapView, { Marker } from "react-native-maps";
// import { MaterialIcons } from "@expo/vector-icons";
// import * as Location from "expo-location";
// import axios from "axios";
// import { GOOGLE_MAPS_API_KEY } from "@env";

// const Maps = () => {
//   const [location, setLocation] = useState(null);
//   const [vets, setVets] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access location was denied.");
//         return;
//       }

//       let userLocation = await Location.getCurrentPositionAsync({});
//       setLocation(userLocation.coords);
//       fetchVets(userLocation.coords);
//     })();
//   }, []);

//   // Fetch Nearby Vets from Google Places API
//   const fetchVets = async (coords) => {
//     try {
//       const { latitude, longitude } = coords;
//       const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=veterinary_care&key=${GOOGLE_MAPS_API_KEY}`
//       );

//       setVets(response.data.results);
//     } catch (error) {
//       console.error("Error fetching vets:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Center the map on the user's current location
//   const centerMapOnUserLocation = async () => {
//     if (location && mapRef.current) {
//       mapRef.current.animateToRegion({
//         latitude: location.latitude,
//         longitude: location.longitude,
//         latitudeDelta: 0.05,
//         longitudeDelta: 0.05,
//       });
//       // Refresh nearby vets
//       //await fetchVets(location);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="blue" />
//         <Text>Finding nearby vets...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         initialRegion={{
//           latitude: location.latitude,
//           longitude: location.longitude,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//       >
//         {/* User's Location Marker */}
//         <Marker
//           coordinate={{
//             latitude: location.latitude,
//             longitude: location.longitude,
//           }}
//           title="You"
//           pinColor="blue"
//         />

//         {/* Vet Clinics Markers */}
//         {vets.map((vet, index) => (
//           <Marker
//             key={index}
//             coordinate={{
//               latitude: vet.geometry.location.lat,
//               longitude: vet.geometry.location.lng,
//             }}
//             title={vet.name}
//             description={vet.vicinity}
//             pinColor="green"
//           />
//         ))}
//       </MapView>
//       {/* My Location Button */}
//       <TouchableOpacity
//         style={styles.locationButton}
//         onPress={centerMapOnUserLocation}
//       >
//         <MaterialIcons name="my-location" size={24} color="white" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { width: "100%", height: "100%" },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   locationButton: {
//     position: "absolute",
//     bottom: 100,
//     right: 20,
//     backgroundColor: "blue",
//     borderRadius: 30,
//     padding: 12,
//     elevation: 5, // Shadow for Android
//     shadowColor: "#000", // Shadow for iOS
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 2,
//   },
// });

// export default Maps;

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

const Maps = () => {
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
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
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

      <TouchableOpacity
        style={styles.locationButton}
        onPress={centerMapOnUserLocation}
      >
        <MaterialIcons name="my-location" size={24} color="white" />
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
    bottom: 40,
    right: 25,
    backgroundColor: "blue",
    borderRadius: 30,
    padding: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
});

export default Maps;
