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
  const [userId, setUserId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [expirationTime, setExpirationTime] = useState(null);

  // Use a useRef to hold the timeout reference reliably.
  const refreshTimeoutRef = useRef();

  // Ensures state is only updated if AsyncStorage succeeds.
  const storeTokenData = async (uid, token, refreshTok, expiresIn) => {
    try {
      const expiryTime = new Date().getTime() + parseInt(expiresIn, 10) * 1000;
      await AsyncStorage.setItem('userId', uid);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('refreshToken', refreshTok);
      await AsyncStorage.setItem('expirationTime', expiryTime.toString());
  
      setUserId(uid);
      setAuthToken(token);
      setRefreshToken(refreshTok);
      setExpirationTime(expiryTime);
    } catch (err) {
      console.error('Failed to persist token data:', err);
      logout(); // Optionally log out if persistence fails
    }
  };


  const scheduleTokenRefresh = useCallback((expiresIn) => {
    if (!refreshToken) return; // Guard clause

    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);

    const refreshDelay = Math.max(parseInt(expiresIn, 10) - 60, 5) * 1000; // At least 5 seconds

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        const newData = await refreshIdToken(refreshToken);
        storeTokenData(userId, newData.idToken, newData.refreshToken, newData.expiresIn);
      } catch (err) {
        console.error('Token refresh failed:', err);
        logout();
      }
    }, refreshDelay); // refresh 60 seconds before expiry
  }, [refreshToken, userId]);

  //-- Adding useCallback for authenticate and logout to avoid unnecessary re-renders and unstable dependency arrays.
  const authenticate = useCallback(async (uid, token, refreshTok, expiresIn) => {
    await storeTokenData(uid, token, refreshTok, expiresIn);
    scheduleTokenRefresh(expiresIn);
  }, [scheduleTokenRefresh]);
  
  const logout = useCallback(async () => {
    setUserId(null);
    setAuthToken(null);
    setRefreshToken(null);
    setExpirationTime(null);
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    await AsyncStorage.multiRemove(['userId', 'token', 'refreshToken', 'expirationTime']);
  }, []);

  useEffect(() => {
    let isMounted = true;

  async function loadStoredAuthData() {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedToken = await AsyncStorage.getItem('token');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      const storedExpirationTime = await AsyncStorage.getItem('expirationTime');

      if (isMounted && storedUserId && storedToken && storedRefreshToken && storedExpirationTime) {
        const now = Date.now();

        if (parseInt(storedExpirationTime, 10) > now) {
          const expiresIn = (parseInt(storedExpirationTime, 10) - now) / 1000;
          setUserId(storedUserId);
          setAuthToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setExpirationTime(parseInt(storedExpirationTime, 10));
          scheduleTokenRefresh(expiresIn);
        } else {
          const newData = await refreshIdToken(storedRefreshToken);
          await storeTokenData(storedUserId, newData.idToken, newData.refreshToken, newData.expiresIn);
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
    userId: userId,
    token: authToken,
    isAuthenticated: !!authToken,
    authenticate,
    logout,
  }), [userId, authToken, authenticate, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}