import { useContext, useState } from 'react';
import { Alert } from 'react-native';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import AuthContent from '../components/Auth/AuthContent';
import { createUser } from '../utils/auth';
import { AuthContext } from '../store/auth-context';

function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authCtx = useContext(AuthContext);
  
  async function signupHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const token = await createUser(email, password);
      authCtx.authenticate(token.idToken, token.refreshToken, parseInt(token.expiresIn, 10));
    } catch (error) {
      Alert.alert('Sign up failed.', 'Please check your inputs or try again later!');
    } finally {
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <LoadingOverlay message='Creating user...' />
  } 

  return <AuthContent onAuthenticate={signupHandler}/>;
}

export default SignupScreen;
