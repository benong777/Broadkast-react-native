import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, View, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { EXPO_PUBLIC_GOOGLE_MAPS_API_KEY } from '@env';

export default function SearchScreen() {
  const route = useRoute();
  const searchRef = useRef(null);
  const mapRef = useRef(null);

  const [query, setQuery] = useState(route.params.query);
  const [searchText, setSearchText] = useState(route.params.query || '');

  // Keeps track of the map region
  const [searchedLocation, setSearchedLocation] = useState({
    latitude: route.params.latitude,
    longitude: route.params.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Keeps track of marker's location
  const [markerLocation, setMarkerLocation] = useState({
    latitude: route.params.latitude,
    longitude: route.params.longitude,
  });

  useEffect(() => {
    if (searchRef.current && query) {
      searchRef.current.setAddressText(query);
    }
  }, [query]);

  const handleClearSearch = () => {
    if (searchRef.current) {
      searchRef.current.setAddressText('');
      searchRef.current.clear();
    }
    setSearchText('');
    Keyboard.dismiss();
  };

  const loadCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const myLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    // Move to current location, but leave the previous marker
    setSearchedLocation(myLocation);

    if (mapRef.current) {
      mapRef.current.animateToRegion(myLocation, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation={true}
        region={searchedLocation}
      >
        {/* Only show marker for searched location */}
        {/* <Marker coordinate={markerLocation} title={query} /> */}
        <Marker coordinate={markerLocation} />
      </MapView>

      <View style={{ paddingTop: 10, paddingHorizontal: 10 }}>
        <GooglePlacesAutocomplete
          ref={searchRef}
          placeholder="Search location"
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details) {
              const { lat, lng } = details.geometry.location;

              // Update map and marker locations
              const newLocation = {
                latitude: lat,
                longitude: lng,
              };

              setMarkerLocation(newLocation);
              setSearchedLocation({
                ...newLocation,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });

              setQuery(data.description);
              setSearchText(data.description);
            }
          }}
          query={{
            key: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            language: 'en',
          }}
          styles={{
            container: styles.autocompleteContainer,
            textInput: styles.input,
          }}
          textInputProps={{
            value: searchText,
            onChangeText: setSearchText,
            placeholderTextColor: '#888',
            clearButtonMode: 'never',
          }}
          renderRightButton={() =>
            searchText.length > 0 ? (
              <View style={styles.clearButton}>
                <TouchableOpacity onPress={handleClearSearch}>
                  <Ionicons name="close-circle" size={20} color="gray" />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      </View>

      <TouchableOpacity style={styles.myLocationButton} onPress={loadCurrentLocation}>
        <Ionicons name="locate" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  autocompleteContainer: { flex: 0 },
  input: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 10,
    borderRadius: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 20,
    top: 22,
    zIndex: 1,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
});
//import React, { useEffect, useRef, useState } from 'react';
//import { Keyboard, View, StyleSheet, TouchableOpacity } from 'react-native';
//import MapView, { Marker } from 'react-native-maps';
//import * as Location from 'expo-location';
//import { Ionicons } from '@expo/vector-icons';
//import { useNavigation, useRoute } from '@react-navigation/native';
//import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
//import { EXPO_PUBLIC_GOOGLE_MAPS_API_KEY } from '@env';

//export default function SearchScreen() {
  //const route = useRoute();
  //const navigation = useNavigation();
  //const searchRef = useRef(null);
  //const mapRef = useRef(null); // Add map reference

  //const [query, setQuery] = useState(route.params.query);
  //const [searchText, setSearchText] = useState(route.params.query || '');
  //const [searchedLocation, setSearchedLocation] = useState({
    //latitude: route.params.latitude,
    //longitude: route.params.longitude,
    //latitudeDelta: 0.01,
    //longitudeDelta: 0.01,
  //});

  //useEffect(() => {
    //if (searchRef.current && query) {
      //searchRef.current.setAddressText(query);
    //}
  //}, [query]);

  //const handleClearSearch = () => {
    //if (searchRef.current) {
      //searchRef.current.setAddressText('');
      //searchRef.current.clear();
    //}
    //setSearchText('');
    //Keyboard.dismiss();
  //};


  //// 👉 My Location function
  //const loadCurrentLocation = async () => {
    //const { status } = await Location.requestForegroundPermissionsAsync();
    //if (status !== 'granted') {
      //console.log('Permission denied');
      //return;
    //}

    //const location = await Location.getCurrentPositionAsync({});
    //const myLocation = {
      //latitude: location.coords.latitude,
      //longitude: location.coords.longitude,
      //latitudeDelta: 0.01,
      //longitudeDelta: 0.01,
    //};

    //setSearchedLocation(myLocation);
    //if (mapRef.current) {
      //mapRef.current.animateToRegion(myLocation, 1000);
    //}
  //};

  //return (
    //<View style={styles.container}>
      //<MapView
        //ref={mapRef}
        //style={StyleSheet.absoluteFillObject} // Display map on entire screen
        //showsUserLocation={true}
        //region={searchedLocation}
      //>
        //<Marker coordinate={searchedLocation} title={query} />
      //</MapView>

      //{/* Google Places Search */}
      //{/* <View style={styles.searchContainer}> */}
      //<View style={{ paddingTop: 10, paddingHorizontal: 10 }}>
        //<GooglePlacesAutocomplete
          //ref={searchRef}
          //placeholder="Search location"
          //fetchDetails={true}
          //onPress={(data, details = null) => {
            //if (details) {
              //const { lat, lng } = details.geometry.location;
              //setSearchedLocation({
                //latitude: lat,
                //longitude: lng,
                //latitudeDelta: 0.01,
                //longitudeDelta: 0.01,
              //});
              //setQuery(data.description);
            //}
          //}}
          //query={{
            //key: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            //language: 'en',
          //}}
          //styles={{
            //container: styles.autocompleteContainer,
            //textInput: styles.input,
          //}}
          //textInputProps={{
            //value: searchText,
            //onChangeText: setSearchText,
            //placeholderTextColor: '#888',
            //clearButtonMode: 'never', // Disable native iOS clear
          //}}
          //renderRightButton={() =>
            //searchText.length > 0 ? (
              //<View style={styles.clearButton}>
                //<TouchableOpacity onPress={handleClearSearch}>
                  //<Ionicons name="close-circle" size={20} color="gray" />
                //</TouchableOpacity>
              //</View>
            //) : null
          //}
        ///>
      //</View>

      //{/* My Location Button */}
      //<TouchableOpacity style={styles.myLocationButton} onPress={loadCurrentLocation}>
        //<Ionicons name="locate" size={16} color="white" />
      //</TouchableOpacity>
    //</View>
  //);
//}

//const styles = StyleSheet.create({
  //container: { flex: 1 },
  //autocompleteContainer: {
    //flex: 0,
  //},
  //input: {
    //flex: 1,
    //backgroundColor: 'white',
    //paddingVertical: 10,
    //paddingHorizontal: 14,
    //margin: 10,
    //borderRadius: 16,
  //},
  //clearButton: {
    //position: 'absolute',
    //right: 20,
    //top: 22,
    //zIndex: 1,
  //},
  //myLocationButton: {
    //position: 'absolute',
    //bottom: 40,
    //right: 20,
    //backgroundColor: '#007AFF',
    //borderRadius: 30,
    //padding: 12,
    //elevation: 4, // Android
    //shadowColor: '#000', // iOS
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.3,
    //shadowRadius: 4,
    //zIndex: 10,
  //},
//});

/* 
  NEW File - no marker at current location, but when searching for new location, the title shows the previous location
*/
// import React, { useEffect, useRef, useState } from 'react';
// import { Keyboard, View, StyleSheet, TouchableOpacity } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import * as Location from 'expo-location';
// import { Ionicons } from '@expo/vector-icons';
// import { useRoute } from '@react-navigation/native';
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
// import { EXPO_PUBLIC_GOOGLE_MAPS_API_KEY } from '@env';

// export default function SearchScreen() {
//   const route = useRoute();
//   const searchRef = useRef(null);
//   const mapRef = useRef(null);

//   const [query, setQuery] = useState(route.params.query);
//   const [searchText, setSearchText] = useState(route.params.query || '');
//   const [searchedLocation, setSearchedLocation] = useState({
//     latitude: route.params.latitude,
//     longitude: route.params.longitude,
//     latitudeDelta: 0.01,
//     longitudeDelta: 0.01,
//   });
//   const [currentLocation, setCurrentLocation] = useState(null); // New state for current location

//   useEffect(() => {
//     if (searchRef.current && query) {
//       searchRef.current.setAddressText(query);
//     }
//   }, [query]);

//   const handleClearSearch = () => {
//     if (searchRef.current) {
//       searchRef.current.setAddressText('');
//       searchRef.current.clear();
//     }
//     setSearchText('');
//     Keyboard.dismiss();
//   };

//   const loadCurrentLocation = async () => {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       console.log('Permission denied');
//       return;
//     }

//     const location = await Location.getCurrentPositionAsync({});
//     const myLocation = {
//       latitude: location.coords.latitude,
//       longitude: location.coords.longitude,
//       latitudeDelta: 0.01,
//       longitudeDelta: 0.01,
//     };

//     setCurrentLocation(myLocation);

//     if (mapRef.current) {
//       mapRef.current.animateToRegion(myLocation, 1000);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={StyleSheet.absoluteFillObject}
//         showsUserLocation={true} // Shows blue dot for current location
//         region={searchedLocation}
//       >
//         {searchedLocation && (
//           <Marker coordinate={searchedLocation} title={query} />
//         )}
//       </MapView>

//       {/* Google Places Search */}
//       <View style={{ paddingTop: 10, paddingHorizontal: 10 }}>
//         <GooglePlacesAutocomplete
//           ref={searchRef}
//           placeholder="Search location"
//           fetchDetails={true}
//           onPress={(data, details = null) => {
//             if (details) {
//               const { lat, lng } = details.geometry.location;
//               setSearchedLocation({
//                 latitude: lat,
//                 longitude: lng,
//                 latitudeDelta: 0.01,
//                 longitudeDelta: 0.01,
//               });
//               setQuery(data.description);
//             }
//           }}
//           query={{
//             key: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//             language: 'en',
//           }}
//           styles={{
//             container: styles.autocompleteContainer,
//             textInput: styles.input,
//           }}
//           textInputProps={{
//             value: searchText,
//             onChangeText: setSearchText,
//             placeholderTextColor: '#888',
//             clearButtonMode: 'never',
//           }}
//           renderRightButton={() =>
//             searchText.length > 0 ? (
//               <View style={styles.clearButton}>
//                 <TouchableOpacity onPress={handleClearSearch}>
//                   <Ionicons name="close-circle" size={20} color="gray" />
//                 </TouchableOpacity>
//               </View>
//             ) : null
//           }
//         />
//       </View>

//       {/* My Location Button */}
//       <TouchableOpacity style={styles.myLocationButton} onPress={loadCurrentLocation}>
//         <Ionicons name="locate" size={16} color="white" />
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   autocompleteContainer: {
//     flex: 0,
//   },
//   input: {
//     flex: 1,
//     backgroundColor: 'white',
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//     margin: 10,
//     borderRadius: 16,
//   },
//   clearButton: {
//     position: 'absolute',
//     right: 20,
//     top: 22,
//     zIndex: 1,
//   },
//   myLocationButton: {
//     position: 'absolute',
//     bottom: 40,
//     right: 20,
//     backgroundColor: '#007AFF',
//     borderRadius: 30,
//     padding: 12,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     zIndex: 10,
//   },
// });
