import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

//icons 
import {Octicons, Ionicons} from '@expo/vector-icons';

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
  BackText,
  BackArrowtIcon,
  BackArrowWrapper,
  CreateAccountTitle,
  PersonalDetailsSubtitle,
  Colors,
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
    setShowPopup(true);
  };

  return (
    <LinearGradient
      colors={['#E0BBFF', '#F3E5F5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.inner}>
        <View style={{ width: '100%', alignItems: 'flex-start' }}>
          <BackArrowWrapper onPress={() => navigation.goBack()}>
            <BackArrowtIcon>
            <Ionicons name="arrow-back" size={24} color="black" />
             <BackText>Back</BackText>
            </BackArrowtIcon>
          </BackArrowWrapper>
          </View>

        <CreateAccountTitle> Create your account </CreateAccountTitle>
        <PersonalDetailsSubtitle> Body Measurement</PersonalDetailsSubtitle>

          
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
            <View style={styles.button2}>
            <TouchableOpacity style={styles.button2} onPress={handleSubmit}>
              <Text style={{ color: 'white', fontSize: 18 }}>Skip</Text>
            </TouchableOpacity>
            </View>

            <View style={styles.button}>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={{ color: 'white', fontSize: 18 }}>Next</Text>
            </TouchableOpacity>
          </View>
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
          onPress={() => navigation.navigate('LandingPage')}
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
    position: 'relative',
    paddingHorizontal: 15,
    paddingTop: 20,
    fontFamily: 'System',
  },
  inner: {
    maxWidth: 330,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 17,
  },
  title: {
    paddingTop: 10,
    fontSize: 30,
    color: '#000',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  form: {
    marginTop: 30,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#696969',
    letterSpacing: 1,
  },
  input: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#FFFAFA',
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#000',
    height: 55,
    backgroundColor: '#EDEDED',

  },
  button: {
    backgroundColor: '#5C427E',
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    width: '43%',
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
    width: '43%',
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
