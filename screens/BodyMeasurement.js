import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { InteractionManager } from 'react-native';

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert('You must be logged in.');
      return;
    }

    try {
     
      const measurementsRef = collection(db, 'measurements');
      await addDoc(measurementsRef, {
        ...formData,
        userId: user.uid,
      });

      console.log('Measurements saved:', formData);
      setShowPopup(true);
    } catch (error) {
      console.error('Error saving measurements:', error);
      alert('Something went wrong while saving your data.');
    }
  };

  return (
    <LinearGradient colors={['hsl(266, 100%, 79%)', 'hsl(0, 0%, 100%)']}style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.inner}>
          <TouchableOpacity style={styles.header} onPress={() => navigation.goBack()}>
            <FontAwesome name="arrow-left" size={16} color="black" />
            <Text style={styles.title}>Body Measurements</Text>
          </TouchableOpacity>

           <Text style={styles.subtitle}>Measurement Details</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={formData.height}
              onChangeText={value => handleChange('height', value)}
              keyboardType="numeric"
            />


            <View style= {styles.inputWrapper}>
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
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={{ color: 'white', fontSize: 16, fontFamily: "KronaOne" }}>Next</Text>
            </TouchableOpacity>
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
                    InteractionManager.runAfterInteractions(() => {
                      navigation.navigate('BodyTracking');
                    });
                  }}
                >
                  <Text style={{ color: '#fff',  fontSize: 15}}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.popupButtonNo}
                  onPress={() => setShowPopup(false)}
                >
                  <Text style={{ color: '#fff', fontSize: 15 }}>No</Text>
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
    paddingTop: 70,
    fontFamily: 'System',
  },
  inner: {
    maxWidth: 330,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 17,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginLeft: 5,
    fontFamily: "KronaOne",
  },
  subtitle: {
    fontSize: 17,
    marginTop: 40,
    marginBottom: 5,
    fontWeight:'600',
    color: colors.main,
    textAlign: "left",
    padding: 20,
    fontFamily: "KronaOne",

  },
  form: {
    width: "100%",
    paddingHorizontal: 15,
    marginTop: 10,
  },
  label: {
    color: colors.main,
    fontSize: 14,
    textAlign: "left",
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.bg,
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingLeft: 20,
    borderRadius: 10,
    fontSize: 16,
    height: 55,
    color: colors.bg,
    marginVertical: 6,
    marginBottom: 30,
    color: colors.bg,
    width: "100%",
  },
   inputWrapper: {
    position: "relative",
  },
  button: {
    backgroundColor: '#9747FF',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-end',
    width: "100%",
    marginTop: 10,
    fontSize: 30,
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
    padding: 30,
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
