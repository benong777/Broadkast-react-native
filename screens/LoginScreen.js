import { useContext, useState } from 'react';
import { Alert, Pressable, View, Text } from 'react-native';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { loginUser, resetPassword } from '../utils/auth';
import AuthContent from '../components/Auth/AuthContent';
import { AuthContext } from '../store/auth-context';


function LoginScreen({ navigation }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authCtx = useContext(AuthContext);
  
  async function loginHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const token = await loginUser(email, password);
      authCtx.authenticate(token.idToken);
    } catch (error) {
      Alert.alert(
        'Authentication failed!',
        'Check your credentials or try again later!'
      )
    } finally {
      setIsAuthenticating(false); // Ensures it runs in both success & failure cases
    }
  }

  function forgotPasswordHandler() {
    navigation.navigate('ForgotPassword');
  }

  if (isAuthenticating) {
    return <LoadingOverlay message='Logging in...' />
  } 
  return (
    <View>
      <AuthContent isLogin onAuthenticate={loginHandler}/>
      <Pressable onPress={forgotPasswordHandler}>
        <Text style={{ textAlign: 'center', color: 'blue', marginTop: 10 }}>Forgot Password?</Text>
      </Pressable>
    </View>
  );
}

export default LoginScreen;
