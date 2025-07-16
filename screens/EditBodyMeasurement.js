import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

export default function BodyMeasurements() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    waist: '',
  });

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log('Measurements:', formData);
    setShowSuccessPopup(true); // Only show success popup
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Body Measurement</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
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
      </View>

      {/* Save Button */}
      <View style={styles.saveWrapper}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Success Modal Only */}
      <Modal visible={showSuccessPopup} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupText}>Measurements successfully saved!</Text>
            <TouchableOpacity
              style={styles.popupButton}
              onPress={() => setShowSuccessPopup(false)}
            >
              <Text style={styles.popupButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    marginBottom: 5,
    color: '#696969',
  },
  input: {
    fontSize: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ccc',
    height: 55,
    backgroundColor: '#EDEDED',
    paddingLeft: 20,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  saveWrapper: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  saveButton: {
    backgroundColor: '#9747FF',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 30,
    width: '80%',
    alignItems: 'center',
  },
  popupText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  popupButton: {
    backgroundColor: '#9747FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  popupButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});
