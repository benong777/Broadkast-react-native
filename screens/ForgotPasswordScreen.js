import { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { resetPassword } from '../utils/auth';

function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  async function resetPasswordHandler() {
    if (!email) {
      Alert.alert('Error', 'Please enter a valid email.');
      return;
    }

    try {
      await resetPassword(email);
      Alert.alert('Success', 'Check your email for password reset instructions.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not send reset email. Please try again.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter your email to reset your password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Reset Password" onPress={resetPasswordHandler} />
    </View>
  );
}

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { marginBottom: 10 },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 8,
  },
});