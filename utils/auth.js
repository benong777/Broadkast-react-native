import axios from 'axios';
import { EXPO_PUBLIC_GOOGLE_WEB_API_KEY } from '@env';
// import auth from '@react-native-firebase/auth';

async function authenticate(mode, email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=` + EXPO_PUBLIC_GOOGLE_WEB_API_KEY;
  const response = await axios.post(
    url,
    {
      email: email,
      password: password,
      returnSecureToken: true
    }
  );
  
  const token = response.data.idToken;
  return token;
}

export async function createUser(email, password) {
  // returns token
  return authenticate('signUp', email, password);
}

export async function loginUser(email, password) {
  // returns token
  return authenticate('signInWithPassword', email, password);
}

export async function resetPassword(email) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=` + EXPO_PUBLIC_GOOGLE_WEB_API_KEY;
  
  try {
    const response = await axios.post(url, {
      requestType: "PASSWORD_RESET",
      email: email
    });

    console.log('Password reset email sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending password reset email:', error.response?.data || error.message);
  }
}

/* Reset password using fetch */
/*
export async function resetPassword(email) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${EXPO_PUBLIC_GOOGLE_WEB_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestType: "PASSWORD_RESET",
        email: email,
      }),
    });

    const data = await response.json();
    console.log("Response:", data);
    return data;
  } catch (error) {
    console.error("Error sending reset email:", error);
  }
}
*/