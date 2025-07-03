import { StyleSheet } from 'react-native';

export const customStyles = StyleSheet.create({
  shadowContainer: {
    borderTopWidth: 0.6,
    borderLeftWidth: 0.6,
    borderRightWidth: 1,
    borderBottomWidth: 1,

    borderColor: '#D3D3D3', // Light gray border
    borderRadius: 4,

    // Cross-Platform Shadow
    shadowColor: 'black',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 20,          // Elevation for Android
  }
});