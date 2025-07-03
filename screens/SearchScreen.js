import { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, TextInput, 
         Keyboard, Pressable, TouchableOpacity, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { useContext } from 'react';
import { AuthContext } from '../store/auth-context';

import { db } from '../firebase.js';
import { collection,
         setDoc,
         addDoc,
         getDocs,
         serverTimestamp } from "firebase/firestore"; 

import { customStyles } from '../styles/customStyles.js';
import { Avatar } from '../components/ui/Avatar.js';
import { PressableOpacity } from '../components/ui/PressableOpacity.js';

export default function SearchScreen({ route }) {
  const { query, placeId, latitude, longitude } = route.params;
  const searchRef = useRef(null);
  const mapRef = useRef(null);

  const authCtx = useContext(AuthContext);
  const userId = authCtx.userId;

  // const [query, setquery] = useState(route.params.query);
  const [newQuery, setNewQuery] = useState(query);
  // const [searchText, setSearchText] = useState(route.params.query || '');
  const [searchText, setSearchText] = useState(query || '');

  const [enteredComment, setEnteredComment] = useState('');
  // const [comments, setComments] = useState([]);
  const [comments, setComments] = useState([
    { comment: 'All courts are full.', id: 1, date: '10:32am - Jun 20' },
    { comment: 'One court open!', id: 2, date: '10:50am - Jun 20'},
    // { comment: 'Just left... one court open!', id: 3, date: '10:50am - Jun 20'},
  ]);

  function commentInputHandler(enteredText) {
    setEnteredComment(enteredText);
  }

  function addCommentHandler() {
    // addPostToDB();
    setComments((currComments) => [
      ...currComments,
      { comment: enteredComment, id: Math.random().toString() }
    ]);
    console.log('SUBMIT btn pressed')
  }

  // Keeps track of the map region
  const [searchedLocation, setSearchedLocation] = useState({
    // latitude: route.params.latitude,
    // longitude: route.params.longitude,
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Keeps track of marker's location
  const [markerLocation, setMarkerLocation] = useState({
    // latitude: route.params.latitude,
    // longitude: route.params.longitude,
    latitude,
    longitude
  });

  // -- Get current location for map
  // useEffect(() => {
  //   if (searchRef.current && query) {
  //     searchRef.current.setAddressText(query);
  //   }
  // }, [query]);

  useEffect(() => {
    if (searchRef.current && newQuery) {
      searchRef.current.setAddressText(newQuery);
    }
  }, [newQuery]);

  // -- Fetch posts for selected location
  useEffect(() => {
    fetchPostsFromDB();
  }, []);

  useEffect(() => {
    async function loadOrCreateLocation() {
      console.log('loadOrCreateLocation ran!!!');
      const locationRef = doc(db, 'locations', placeId);
      const locationSnap = await getDoc(locationRef);

      console.log('CHECKING if location EXISTS!!!');

      if (!locationSnap.exists()) {
        // Create new location document
        await setDoc(locationRef, {
          details,
          createdAt: new Date(),
        });
        setComments([]);
      } else {
        // Fetch comments (assume subcollection "comments")
        const commentsSnap = await getDocs(collection(locationRef, 'comments'));
        setComments(commentsSnap.docs.map(doc => doc.data()));
      }
      setLoading(false);
    }
    loadOrCreateLocation();
  }, [placeId]);

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


  async function addPostToDB() {
    try {
      const docRef = await addDoc(collection(db, "posts"), {
        comment: "It works!!!",
        uid: "testUser",
        createdBy: serverTimestamp(),
      });
      console.log("Document written with ID: ", docRef.id);
      fetchPostsFromDB();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  async function fetchPostsFromDB() {
    console.log('Fetching...');
    const querySnapshot = await getDocs(collection(db, "posts"))
    console.log(querySnapshot);
    
    querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data())
        console.log(`${doc.id}: ${doc.data().comment}`)
    })
  }

  function displayDate(firebaseDate) {
    const date = firebaseDate.toDate()

    const day = date.getDate()
    const year = date.getFullYear()

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = monthNames[date.getMonth()]

    let hours = date.getHours()
    let minutes = date.getMinutes()
    hours = hours < 10 ? "0" + hours : hours
    minutes = minutes < 10 ? "0" + minutes : minutes

    return `${day} ${month} ${year} - ${hours}:${minutes}`
  }

  return (
    <View style={styles.container}>
      <View style={{ height: '30%' }}>

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation={true}
        region={searchedLocation}
      >
        {/* Only show marker for searched location */}
        {/* <Marker coordinate={markerLocation} title={query} /> */}
        {/* Also need to add a key prop for each marker to allow multiple markers! */}
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

              // setQuery(data.description);
              setNewQuery(data.description);
              setSearchText(data.description);
            }
          }}
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
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
      <View style={[styles.inputContainer, customStyles.shadowContainer]}>
          <TextInput 
            style={{ flex: 1, marginRight: 16 }}
            placeholder='Add comment' onChangeText={commentInputHandler} />
          <Pressable onPress={addCommentHandler}>
            <Ionicons style={{}} name="send" size={20} color="blue" />
          </Pressable>
      </View>
      <View style={[styles.commentsContainer, customStyles.shadowContainer]}>
        <FlatList
          data={comments}
          keyExtractor={(item, idx) => item.id }
          renderItem={({item, index}) => {
            const isFirstItem = index === 0;
            const isLastItem = index === comments.length - 1;
            return (
              <View style={styles.comment}>
                {isFirstItem && <View style={{ marginTop: 8 }}></View>}
                {!isFirstItem && <View style={styles.commentSeparator}></View>}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <PressableOpacity hitSlop={10} onPress={() => {}}>
                    <Avatar name={'Warren Buffet'} size={32} />
                  </PressableOpacity>
                  <Text style={{ marginBottom: 2, marginLeft: 8 }}>{item.comment}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, marginRight: 8 }}>{item.date}</Text>
                  <Octicons name="thumbsup" size={14} color="blue" />
                </View>
                {isLastItem && <View style={{ marginTop: 12 }}></View>}
              </View>
            )
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  autocompleteContainer: { flex: 0 },
  inputContainer: {
    flexDirection: 'row',
    margin: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
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
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    padding: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  commentsContainer: {
    marginHorizontal: 8,
    // padding: 8,
    backgroundColor: 'white',
  },
  comment: {
    marginHorizontal: 8,
    marginVertical: 8,
  },
  commentSeparator: {
    borderWidth: 0.4,
    borderColor: 'lightgray',
    marginBottom: 16,
    marginHorizontal: 2
  }
});
