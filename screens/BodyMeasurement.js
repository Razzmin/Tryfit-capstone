import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

//icons 
import { FontAwesome } from '@expo/vector-icons';

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  CreateAccountTitle,
} from '../components/styles';


export default function BodyMeasurements() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    waist: '',
  });

  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
  console.log('Measurements:', formData);
  };
  const handleSkip = () => {
      handleSubmit(); 
  navigation.navigate('LandingPage');
};

  const handleNext = () => {
  handleSubmit(); 
  setShowPopup(true); 
};

  return (
    <LinearGradient colors={['hsl(266, 100%, 78%)', 'hsl(0, 0%, 100%)']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.inner}>
       {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <FontAwesome name="arrow-left" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}> Create your account</Text>
              <View style={{ width: 24 }} />
            </View>

        <CreateAccountTitle> Body Measurement </CreateAccountTitle>
     
          <View style={styles.form}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={formData.height}
              onChangeText={value => handleChange('height', value)}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={formData.weight}
              onChangeText={value => handleChange('weight', value)}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Waist (cm)</Text>
            <TextInput
              style={styles.input}
              value={formData.waist}
              onChangeText={value => handleChange('waist', value)}
              keyboardType="numeric"
            />

          <View style={styles.buttonwrapper}>
  <TouchableOpacity style={styles.button2} onPress={handleSkip}>
    <Text style={{ color: 'white', fontSize: 18 }}>Skip</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.button} onPress={handleNext}>
    <Text style={{ color: 'white', fontSize: 18 }}>Next</Text>
  </TouchableOpacity>
</View>

       
</View>
 </View>
       <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.popupOverlay}>
        <Pressable style={styles.overlayTouchable} onPress={() => setShowPopup(false)} />
       <View style={styles.popupBox}>
        <Text style={styles.popupText}>Allow the application to access your camera?</Text>
        <View style={styles.popupButtons}>
        <TouchableOpacity
          style={styles.popupButtonYes}
           onPress={() => {
          setShowPopup(false);
           navigation.navigate('BodyTracking');
           }}
        >
          <Text style={{ color: '#fff' }}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.popupButtonNo}
          onPress={() => setShowPopup(false)}
        >
          <Text style={{ color: '#fff' }}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
 container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  form: {
    marginTop: 10,
    padding: 10,
  },
  label: {
    fontSize: 15,
    marginBottom: 5,
    color: '#696969',
  },
  input: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#000',
    height: 55,
    backgroundColor: '#EDEDED',
    paddingLeft: 20,
  },
  button: {
    backgroundColor: '#9747FF',
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    width: '47%',
    height: 60,
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button2: {
    backgroundColor: 'gray',
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '47%',
    height: 60,
    marginVertical: 5,
     justifyContent: 'center',
  },
buttonwrapper: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
},
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  popupBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.57)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  popupText: {
    fontSize: 17,
    marginBottom: 35,
    color: '#333',
  },
  popupButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '120%',
  },
  popupButtonYes: {
    backgroundColor: '#9747FF',
    padding: 14,
    borderRadius: 6,
    minWidth: 150,
    alignItems: 'center',
  },
  popupButtonNo: {
    backgroundColor: '#A9A9A9',
    padding: 14,
    borderRadius: 6,
    minWidth: 150,
    alignItems: 'center',
  },
});
