import { View, Text, Button } from 'react-native';
import axios from 'axios';

export default function HomeScreen({ navigation }) {
  function detailScreenHandler() {
    navigation.navigate('Details');
  }

  function welcomeScreenHandler() {
    navigation.navigate('Welcome');
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ margin: 48 }}>
        <Button title='Go to details' onPress={detailScreenHandler}/>
      </View>
      <Button title='Go to welcome screen' onPress={welcomeScreenHandler}/>
    </View>
  )
}