import { createContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshIdToken } from '../utils/auth';

export const AuthContext = createContext({
  token: '',
  isAuthenticated: false,
  authenticate: async () => {},
  logout: () => {},
});

export default function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [expirationTime, setExpirationTime] = useState(null);
  let refreshTimeout;

  const storeTokenData = async (idToken, refreshToken, expiresIn) => {
    const expiryTime = new Date().getTime() + parseInt(expiresIn) * 1000;
    setAuthToken(idToken);
    setRefreshToken(refreshToken);
    setExpirationTime(expiryTime);

    await AsyncStorage.setItem('token', idToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('expirationTime', expiryTime.toString());
  };

  const scheduleTokenRefresh = useCallback((expiresIn) => {
    if (refreshTimeout) clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(async () => {
      try {
        const newData = await refreshIdToken(refreshToken);
        storeTokenData(newData.idToken, newData.refreshToken, newData.expiresIn);
      } catch (err) {
        console.error('Token refresh failed:', err);
        logout();
      }
    }, (parseInt(expiresIn) - 60) * 1000); // refresh 60 seconds before expiry
  }, [refreshToken]);

  const authenticate = async (idToken, refreshTokenVal, expiresIn) => {
    await storeTokenData(idToken, refreshTokenVal, expiresIn);
    scheduleTokenRefresh(expiresIn);
  };

  const logout = () => {
    setAuthToken(null);
    setRefreshToken(null);
    setExpirationTime(null);
    AsyncStorage.removeItem('token');
    AsyncStorage.removeItem('refreshToken');
    AsyncStorage.removeItem('expirationTime');
    if (refreshTimeout) clearTimeout(refreshTimeout);
  };

  useEffect(() => {
    async function loadStoredAuthData() {
      const storedToken = await AsyncStorage.getItem('token');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      const storedExpirationTime = await AsyncStorage.getItem('expirationTime');

      if (storedToken && storedRefreshToken && storedExpirationTime) {
        const now = new Date().getTime();
        if (parseInt(storedExpirationTime) > now) {
          const expiresIn = (parseInt(storedExpirationTime) - now) / 1000;
          setAuthToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setExpirationTime(parseInt(storedExpirationTime));
          scheduleTokenRefresh(expiresIn);
        } else {
          try {
            const newData = await refreshIdToken(storedRefreshToken);
            storeTokenData(newData.idToken, newData.refreshToken, newData.expiresIn);
            scheduleTokenRefresh(newData.expiresIn);
          } catch (err) {
            console.warn('Token expired and refresh failed:', err);
            logout();
          }
        }
      }
    }

    loadStoredAuthData();
  }, [scheduleTokenRefresh]);

  const value = {
    token: authToken,
    isAuthenticated: !!authToken,
    authenticate,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}