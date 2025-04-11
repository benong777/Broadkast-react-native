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
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const searchRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [searchText, setSearchText] = useState('');

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

  const handleClearSearch = () => {
    if (searchRef.current) {
      searchRef.current.setAddressText('');
      // Clear internal GooglePlacesAutocomplete predictions
      searchRef.current.clear();
    }
    setSearchText('');
    Keyboard.dismiss();
  };

  const loadCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    const myLocation = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setLocation(myLocation);

    if (mapRef.current) {
      mapRef.current.animateToRegion(myLocation, 1000);
    }
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject} // Display map on entire screen
          showsUserLocation={true}
          showsMyLocationButton={false}
          initialRegion={location}
        >
          <Marker coordinate={location} title="You are here" />
        </MapView>
      )}
      {/* Need to investigate why the search input clear btn will not work without the View below */}
      <View style={{ paddingTop: 10, paddingHorizontal: 10 }}>
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
            clearButtonMode: 'never',     // hides the native iOS clear button
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
      <TouchableOpacity
        onPress={loadCurrentLocation}
        style={styles.myLocationButton}
      >
        <Ionicons name="locate" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  autocompleteContainer: {
    flex: 0,
  },
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
    elevation: 4, // for Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 99,
  },
});
