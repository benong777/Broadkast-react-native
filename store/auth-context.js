import { createContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
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

  // Use a useRef to hold the timeout reference reliably.
  const refreshTimeoutRef = useRef();

  // Ensures state is only updated if AsyncStorage succeeds.
  const storeTokenData = async (idToken, refreshToken, expiresIn) => {
    try {
      const expiryTime = new Date().getTime() + parseInt(expiresIn) * 1000;
      await AsyncStorage.setItem('token', idToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('expirationTime', expiryTime.toString());
  
      setAuthToken(idToken);
      setRefreshToken(refreshToken);
      setExpirationTime(expiryTime);
    } catch (err) {
      console.error('Failed to persist token data:', err);
      logout(); // Optionally log out if persistence fails
    }
  };


  const scheduleTokenRefresh = useCallback((expiresIn) => {
    if (!refreshToken) return; // Guard clause

    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);

    const refreshDelay = Math.max(parseInt(expiresIn) - 60, 5) * 1000; // At least 5 seconds

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        const newData = await refreshIdToken(refreshToken);
        storeTokenData(newData.idToken, newData.refreshToken, newData.expiresIn);
      } catch (err) {
        console.error('Token refresh failed:', err);
        logout();
      }
    }, refreshDelay); // refresh 60 seconds before expiry
  }, [refreshToken]);

  //-- Adding useCallback for authenticate and logout to avoid unnecessary re-renders and unstable dependency arrays.
  const authenticate = useCallback(async (idToken, refreshTokenVal, expiresIn) => {
    await storeTokenData(idToken, refreshTokenVal, expiresIn);
    scheduleTokenRefresh(expiresIn);
  }, [scheduleTokenRefresh]);
  
  const logout = useCallback(async () => {
    setAuthToken(null);
    setRefreshToken(null);
    setExpirationTime(null);
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'expirationTime']);
  }, []);

  useEffect(() => {
    let isMounted = true;

  async function loadStoredAuthData() {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      const storedExpirationTime = await AsyncStorage.getItem('expirationTime');

      if (isMounted && storedToken && storedRefreshToken && storedExpirationTime) {
        const now = Date.now();

        if (parseInt(storedExpirationTime) > now) {
          const expiresIn = (parseInt(storedExpirationTime) - now) / 1000;
          setAuthToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setExpirationTime(parseInt(storedExpirationTime));
          scheduleTokenRefresh(expiresIn);
        } else {
          const newData = await refreshIdToken(storedRefreshToken);
          await storeTokenData(newData.idToken, newData.refreshToken, newData.expiresIn);
          scheduleTokenRefresh(newData.expiresIn);
        }
      }
    } catch (err) {
      console.warn('Failed to load stored auth data:', err);
      if (isMounted) logout();
    }
  }

  loadStoredAuthData();
  return () => { isMounted = false; };
}, [scheduleTokenRefresh]);

  const value = useMemo(() => ({
    token: authToken,
    isAuthenticated: !!authToken,
    authenticate,
    logout,
  }), [authToken, authenticate, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}