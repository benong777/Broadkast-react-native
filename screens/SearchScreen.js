import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { EXPO_PUBLIC_GOOGLE_MAPS_API_KEY } from '@env';

export default function SearchScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const searchRef = useRef(null);

  const [query, setQuery] = useState(route.params.query);
  const [searchedLocation, setSearchedLocation] = useState({
    latitude: route.params.latitude,
    longitude: route.params.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    if (searchRef.current && query) {
      searchRef.current.setAddressText(query);
    }
  }, [query]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={searchedLocation}>
        <Marker coordinate={searchedLocation} title={query} />
      </MapView>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          ref={searchRef}
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
            container: styles.autocompleteContainer,
            textInput: styles.input,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  autocompleteContainer: {
    flex: 0,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 16,
  },
});