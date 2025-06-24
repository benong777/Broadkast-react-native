import 'react-native-get-random-values';  // These 2 imports are to resolve error:
import { v4 as uuidv4 } from 'uuid';      // "crypto.getRandomValues() API not supported"

import { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import DetailScreen from './screens/DetailScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import { Colors } from './constants/styles';
import AuthContextProvider, { AuthContext } from './store/auth-context';
import IconButton from './components/ui/IconButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: 'white',
        contentStyle: { backgroundColor: Colors.primary100 },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  const authCtx = useContext(AuthContext);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: 'white',
        contentStyle: { backgroundColor: Colors.primary100 },
        /*
          Best practice:
          	•	Use `onPress={authCtx.logout}` if you don’t need to do anything after logout.
          	•	Use `async`/`await` if you plan to add post-logout logic later.

          Below, `onPress={authCtx.logout}` is fine, but if you want to do something after logout, use
                 `onPress={async () => { await authCtx.logout(); ... }}`
        */
        // tintColor automatically provided
        // headerRight: ({tintColor}) => <Button title='Logout' color={tintColor || 'white'} onPress={authCtx.logout} />
        headerRight: ({ tintColor }) => (
          <IconButton icon="exit" size={20} color={tintColor || 'white'} onPress={authCtx.logout} />
        ),
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{}}
      />
      <Stack.Screen
        name="Details"
        component={DetailScreen}
        options={{}}
      />
      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{}}
      />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{}}
      />
    </Stack.Navigator>
  );
}

function Navigation() {
  const authCtx = useContext(AuthContext);

  return (
    <NavigationContainer>
      {!authCtx.isAuthenticated && <AuthStack />}
      {authCtx.isAuthenticated && <AuthenticatedStack />}
    </NavigationContainer>
  );
}

function Root() {
  const authCtx = useContext(AuthContext);

  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedToken = await AsyncStorage.getItem('token');
        const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
        const storedExpirationTime = await AsyncStorage.getItem('expirationTime');
  
        if (storedUserId && storedToken && storedRefreshToken && storedExpirationTime) {
          authCtx.authenticate(
            storedUserId,
            storedToken,
            storedRefreshToken,
            parseInt(storedExpirationTime, 10)
          );
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
  
    prepare();
  }, []);

  async function onLayoutRootView() {
    if (appIsReady) {
      await SplashScreen.hideAsync(); // Hide splash screen once the app is ready
    }
  }

  if (!appIsReady) {
    return null; // Keep splash screen visible
  }

  return (
    <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
      <Navigation />
    </View>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />

      <AuthContextProvider>
        <Root />
      </AuthContextProvider>
    </>
  );
}
