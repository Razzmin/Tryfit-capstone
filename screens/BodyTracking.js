import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

 //colors
const colors = {
  bg: "#382a47",
  purple: "#9747FF",
  main: "#1f1926",
  text: "#bba1d4",
  white: "#EDEDED",
};

export default function BodyTracking() {
  const navigation = useNavigation();
  const [showSuccess, setShowSuccess] = useState(false);

 
  const handleConfirm = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigation.navigate('LandingPage')
    }, 2000); 
  };

  return (
    <LinearGradient
      colors={['hsl(266, 100%, 79%)', 'hsl(0, 0%, 100%)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <TouchableOpacity style={styles.header} onPress={() => navigation.goBack()}>
        <FontAwesome name="arrow-left" size={16} color="black" />
        <Text style={styles.title}>Body Tracking</Text>
      </TouchableOpacity>

      <Text style={styles.description}>
        Please ensure your whole body is visible in the camera for accurate tracking.
      </Text>

      <View style={styles.arCanvas} />

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm</Text>
      </TouchableOpacity>

      {showSuccess && (
        <View style={styles.successPopup}>
          <Text style={styles.successText}>Successfully Saved!</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  title: {
    padding: 10,
    fontSize: 22,
    color: '#333',
    marginLeft: 5,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: colors.bg,
    marginBottom: 10,
    textAlign: 'left',
    padding: 10,
  },
  arCanvas: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 10,
    marginBottom: 30,
  },
  confirmButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: colors.purple,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    width: "100%",
    maxWidth: 350,
    marginBottom: 80,

  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
 successPopup: {
  position: 'absolute',
  top: '50',
  left: '50',
  backgroundColor: '#333',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 10,
  zIndex: 10,
  width: 200,
  height: 80,
  marginLeft: -100,
  marginTop: -40,

},
  successText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});
