import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { EXPO_PUBLIC_GOOGLE_MAPS_API_KEY } from '@env';


export default function SearchScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [searchedLocation, setSearchedLocation] = useState({
    latitude: route.params.latitude,
    longitude: route.params.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [query, setQuery] = useState(route.params.query);

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Search location"
        fetchDetails={true}
        onPress={(data, details = null) => {
          if (details) {
            const { lat, lng } = details.geometry.location;
            setSearchedLocation({
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
            setQuery(data.description);
          }
        }}
        query={{
          key: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          language: 'en',
        }}
        styles={{
          textInput: styles.input,
        }}
      />
      <MapView style={styles.map} region={searchedLocation}>
        <Marker coordinate={searchedLocation} title={query} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
});








//   const route = useRoute();
//   const { query } = route.params;
//   const [searchedLocation, setSearchedLocation] = useState(null);

//   useEffect(() => {
//     const fetchLocation = async () => {
//       const apiKey = '';
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`
//       );
//       const data = await response.json();
//       if (data.results.length > 0) {
//         const loc = data.results[0].geometry.location;
//         setSearchedLocation({
//           latitude: loc.lat,
//           longitude: loc.lng,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         });
//       }
//     };
//     fetchLocation();
//   }, [query]);

//   return (
//     <View style={styles.container}>
//       {searchedLocation && (
//         <MapView style={styles.map} initialRegion={searchedLocation}>
//           <Marker coordinate={searchedLocation} title={query} />
//         </MapView>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { flex: 1 },
//   input: {
//     position: 'absolute',
//     top: 40,
//     left: 10,
//     right: 10,
//     backgroundColor: 'white',
//     padding: 10,
//     borderRadius: 5,
//   },
// });


// import { View, Text } from 'react-native';

// export default function DetailScreen() {
//   return (
//     <View>
//       <Text>DetailScreen</Text>
//     </View>
//   )
// }