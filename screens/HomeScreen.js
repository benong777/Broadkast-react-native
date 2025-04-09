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
    paddingVertical: 10,
    paddingHorizontal: 14,
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
