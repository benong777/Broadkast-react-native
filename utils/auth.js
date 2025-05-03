import axios from 'axios';

async function authenticate(mode, email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=${process.env.EXPO_PUBLIC_GOOGLE_WEB_API_KEY}`;
  const response = await axios.post(url, {
    email,
    password,
    returnSecureToken: true,
  });

  return response.data; // returns idToken, refreshToken, expiresIn, etc.
}

export async function createUser(email, password) {
  const data = await authenticate('signUp', email, password);
  return {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
  };
}

export async function loginUser(email, password) {
  const data = await authenticate('signInWithPassword', email, password);
  return {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
  };
}

export async function refreshIdToken(refreshToken) {
  const url = `https://securetoken.googleapis.com/v1/token?key=${process.env.EXPO_PUBLIC_GOOGLE_WEB_API_KEY}`;

  try {
    const response = await axios.post(url, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    return {
      idToken: response.data.id_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    throw new Error('Failed to refresh token');
  }
}

export async function resetPassword(email) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.EXPO_PUBLIC_GOOGLE_WEB_API_KEY}`;

  try {
    const response = await axios.post(url, {
      requestType: 'PASSWORD_RESET',
      email: email,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending password reset email:', error.response?.data || error.message);
  }
}

