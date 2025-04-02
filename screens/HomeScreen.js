import { Alert, View, Button, StyleSheet } from 'react-native';
import IconButton from '../components/ui/IconButton';
import { getCurrentPositionAsync, useForegroundPermissions, PermissionStatus, permissionResponse } from 'expo-location';

export default function HomeScreen({ navigation }) {
  const [locationPermissionInformation, requestPermission] = useForegroundPermissions();

  async function verifyPermissions() {
    if (locationPermissionInformation.status === PermissionStatus.UNDETERMINED) {
      const permissionResponse = await requestPermission();

      return permissionResponse.granted;
    }

    if (locationPermissionInformation.status === PermissionStatus.DENIED) {
      Alert.alert(
        'Insufficient Permissions!',
        'You need to grant location permission to use this app.'
      );
      return false;
    }

    return true;
  }

  async function getLocationHandler() {
    const hasPermission = verifyPermissions();

    if (!hasPermission) return;

    const location = await getCurrentPositionAsync();
    console.log(location);
  }

  function pickOnMapHandler() {

  }

  function detailScreenHandler() {
    navigation.navigate('Details');
  }

  function welcomeScreenHandler() {
    navigation.navigate('Welcome');
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.map}></View>
      <View style={styles.actions}>
        <IconButton icon='location' size={24} onPress={getLocationHandler} />
        <IconButton icon='map' size={24} onPress={pickOnMapHandler} />
      </View>
      <View style={{ margin: 48 }}>
        <Button title='Go to details' onPress={detailScreenHandler}/>
      </View>
      <Button title='Go to welcome screen' onPress={welcomeScreenHandler}/>
    </View>
  )
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 200,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: 'lightblue',
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  }

});