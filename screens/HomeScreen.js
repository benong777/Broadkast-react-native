import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Keyboard, View, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import * as Location from 'expo-location';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { EXPO_PUBLIC_GOOGLE_MAPS_API_KEY } from '@env';

// Use InteractionManager to defer heavier components (like maps/places autocomplete, location fetching) to after initial render
import { InteractionManager } from 'react-native';


export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [searchText, setSearchText] = useState('');

  const navigation = useNavigation();
  const mapRef = useRef(null);
  const searchRef = useRef(null);

  // useEffect(() => {
  //   (async () => {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       console.log('Permission to access location was denied');
  //       return;
  //     }

  //     let currentLocation = await Location.getCurrentPositionAsync({});
  //     const newLocation = {
  //       latitude: currentLocation.coords.latitude,
  //       longitude: currentLocation.coords.longitude,
  //       latitudeDelta: 0.05,
  //       longitudeDelta: 0.05,
  //     };
  //     setLocation(newLocation);

  //     if (mapRef.current) {
  //       mapRef.current.animateToRegion(newLocation, 1000);
  //     }
  //   })();
  // }, []);

  const loadCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    const newLocation = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    setLocation(newLocation);

    if (mapRef.current) {
      mapRef.current.animateToRegion(newLocation, 1000);
    }
  };

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      // Load map, get location, etc.
      loadCurrentLocation();
    });
    return () => task.cancel();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCurrentLocation();
      if (searchRef.current) {
        searchRef.current.clear();
        setSearchText('');
      }
    }, [])
  );

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          // style={styles.map}
          style={StyleSheet.absoluteFillObject}
          showsUserLocation={true}
          showsMyLocationButton={true}
          initialRegion={location}
        >
          <Marker coordinate={location} title="You are here" />
        </MapView>
      )}
      <GooglePlacesAutocomplete
        ref={searchRef}
        placeholder="Search location"
        fetchDetails={true}
        onPress={(data, details = null) => {
          if (details) {
            const { lat, lng } = details.geometry.location;
            navigation.navigate('SearchScreen', {
              query: data.description,
              latitude: lat,
              longitude: lng,
            });
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
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                if (searchRef.current) {
                  searchRef.current.setAddressText('');
                  searchRef.current.clear();
                }
                Keyboard.dismiss();
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  autocompleteContainer: {
    flex: 0,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    margin: 10,
    borderRadius: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
});


// import { useState, useEffect, useRef } from 'react';
// import { Text, Alert, View, Button, StyleSheet, Platform, SafeAreaView } from 'react-native';
// // import IconButton from '../components/ui/IconButton';
// import { getCurrentPositionAsync, useForegroundPermissions, PermissionStatus, permissionResponse } from 'expo-location';

// import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
// import { EXPO_PUBLIC_GOOGLE_MAPS_API_KEY } from '@env';

// export default function HomeScreen({ navigation }) {
//   const mapRef = useRef(null);

//   const [myLat, setMyLat] = useState(37.78825);
//   const [myLng, setMyLng] = useState(-122.4324);
//   const [selectedLat, setSelectedLat] = useState(37.78825);
//   const [selectedLng, setSelectedLng] = useState(-122.4324);
//   const [selectedTitle, setSelectedTitle] = useState('Title');

//   const [locationPermissionInformation, requestPermission] = useForegroundPermissions();

//   useEffect(() => {
//     async function getLocation() {
//       const location =  await getLocationHandler();
//       console.log(location.coords.latitude);
//       console.log(location.coords.longitude);
//       setMyLat(location.coords.latitude);
//       setMyLng(location.coords.longitude);
//       console.log(myLat);
//       console.log(myLng);
//     };
//     getLocation();
//   }, []);

//   async function verifyPermissions() {
//     if (locationPermissionInformation.status === PermissionStatus.UNDETERMINED) {
//       const permissionResponse = await requestPermission();

//       return permissionResponse.granted;
//     }

//     if (locationPermissionInformation.status === PermissionStatus.DENIED) {
//       Alert.alert(
//         'Insufficient Permissions!',
//         'You need to grant location permission to use this app.'
//       );
//       return false;
//     }

//     return true;
//   }

//   async function getLocationHandler() {
//     const hasPermission = verifyPermissions();

//     if (!hasPermission) return;

//     const location = await getCurrentPositionAsync();
//     console.log('MyLocation:', location);
//     return location;
//   }

//   function detailScreenHandler() {
//     navigation.navigate('Details');
//   }

//   function welcomeScreenHandler() {
//     navigation.navigate('Welcome');
//   }

//   async function moveToLocation(latitude, longitude) {
//     await mapRef.current.animateToRegion(
//       {
//         latitude,
//         longitude,
//         latitudeDelta: 0.015,
//         longitudeDelta: 0.0121,
//       },
//       // 2000,
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//     <View style={{ backgroundColor: 'white', zIndex: 99 }}>
//       <Text style={{ color: 'red' }}>Lat: {myLat} Lng: {myLng}</Text>
//     </View>
//     <View style={styles.input}>
//       {/* <Text style={{color: 'red'}}>{selectedTitle}</Text> */}
//       <GooglePlacesAutocomplete
//         GooglePlacesDetailsQuery={{ fields: "geometry" }}
//         fetchDetails={true} // you need this to fetch the details object onPress
//         GooglePlacesSearchQuery={{
//           rankby: 'distance'
//         }}
//         placeholder='Search'
//         onPress={(selectedLocationData, selectedLocationDetails = null) => {
//           // 'details' is provided when fetchDetails = true
//           let lat = selectedLocationDetails?.geometry?.location.lat;
//           console.log(selectedLocationDetails?.geometry?.location.lat);
//           console.log('Data:', selectedLocationData);
//           // console.log('Details:', selectedLocationDetails);
//           console.log('Details:', selectedLocationDetails);
//           // console.log(JSON.stringify(selectedLocationDetails?.geometry?.location));
//           moveToLocation(
//             selectedLocationDetails?.geometry?.location.lat,
//             selectedLocationDetails?.geometry?.location.lng,
//           );
//           setSelectedLat(selectedLocationDetails?.geometry?.location.lat);
//           setSelectedLng(selectedLocationDetails?.geometry?.location.lng);
//           // setSelectedTitle(JSON.stringify(selectedLocationData?.structured_formatting.main_text));
//           setSelectedTitle(selectedLocationData?.structured_formatting.main_text);
//           console.log(selectedLocationData?.structured_formatting.main_text);
//         }}
//         query={{
//           key: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//           language: 'en',
//           types:  'establishment',    // parks?
//           radius: 30000,
//           // location: `${selectedLat, selectedLng}`
//         }}
//         debounce={400}
//         minLength={2}
//         nearbyPlacesAPI='GooglePlacesSearch'
//         enablePoweredByContainer={false}
//         onFail={(error) => console.log(error)}
//       />
//     </View>
//       <MapView
//         ref={mapRef}
//         // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
//         style={styles.map}
//         region={{
//           latitude: 37.785834,
//           longitude: -122.406417,
//           // latitude: myLat,
//           // longitude: myLng,
//           latitudeDelta: 0.015,
//           longitudeDelta: 0.0121,
//         }}
//         >
//         <Marker
//           // key={index}
//           // coordinate={marker.latlng}
//           // title={marker.title}
//           // description={marker.description}

//           // coordinate={{latitude: latitude, longitude: longitude}}
//           // title={marker.title}
//           // description={marker.description}
//           // // image={{uri: 'custom_pin'}}

//           // key={'1'}
//           // coordinate={{latitude: 37.78825, longitude: -122.4324}}
//           // coordinate={{latitude: selectedLat, longitude: selectedLng}}
//           coordinate={{latitude: myLat, longitude: myLng}}
//           title={Platform.OS === 'ios' ? selectedTitle : ''}
//           // description={'Description'}
//           // image={{uri: 'custom_pin'}}
//         >
//         </Marker>
//         {/* {
//           markersList.map((marker) => {
//             return (T
//               <Marker 
//                 key={marker.id}
//                 coordinate={{latitude: marker.latitude, longitude: marker.longitude}}
//                 title={marker.title}
//                 description={marker.description}
//               />
//             );
//           })
//         } */}
//       </MapView>
// </SafeAreaView>

//     // <View style={{ flex: 1 }}>
//     //   <View style={styles.map}></View>
//     //   <View style={styles.actions}>
//     //     <IconButton icon='location' size={24} onPress={getLocationHandler} />
//     //   </View>
//     //   <View style={{ margin: 48 }}>
//     //     <Button title='Go to details' onPress={detailScreenHandler}/>
//     //   </View>
//     //   <Button title='Go to welcome screen' onPress={welcomeScreenHandler}/>
//     // </View>
//   )
// }

// const styles = StyleSheet.create({
//   map: {
//     width: '100%',
//     height: 200,
//     marginVertical: 8,
//     justifyContent: 'center',
//     alignItems: 'center', 
//     backgroundColor: 'lightblue',
//     borderRadius: 4,
//   },
//   actions: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//   },
//     container: {
//       flex: 1,
//     },
//     input: {
//       zIndex: 1,
//       flex: 0.40,
//     },
//     map: {
//       ...StyleSheet.absoluteFillObject,
//       zIndex: 0,
//     },

// });