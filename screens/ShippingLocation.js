import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// dropdown list to and if want niyo palitan feel free, ginawa ko lang na ganiyan for kaartehan purposes
// sabi ni project manager kun limit nalang into 3 municipalities since marami masyado yung brgy ng tarlac city
const MUNICIPALITIES = {
  'Bamban': ['Anupul', 'Banaba', 'Bangcu', 'Culubasa', 'La Paz', 'Lourdes', 'San Nicolas', 'San Pedro', 
  'San Rafael', 'San Vicente', 'Santo Niño'],
  'Capas': ['Aranguren', 'Cub-cub', 'Dolores', 'Estrada', 'Lawy', 'Manga', 'Maruglu', 'O’Donnell', 
  'Santa Juliana', 'Santa Lucia', 'Santa Rita', 'Santo Domingo', 'Santo Rosario', 'Talaga'],
  'Tarlac City': ['Aguso', 'Alvindia Segundo', 'Amucao', 'Armenia', 'Asturias', 'Atioc', 'Balanti', 
  'Balete', 'Balibago I', 'Balibago II', 'Balingcanaway', 'Banaba', 'Bantog', 'Baras-baras', 'Batang-batang', 
  'Binauganan', 'Bora', 'Buenavista', 'Buhilit', 'Burot', 'Calingcuan', 'Capehan', 'Carangian', 'Care', 'Central', 
  'Culipat', 'Cut-cut I', 'Cut-cut II', 'Dalayap', 'Dela Paz', 'Dolores', 'Laoang', 'Ligtasan', 'Lourdes', 'Mabini', 
  'Maligaya', 'Maliwalo', 'Mapalacsiao', 'Mapalad', 'Matatalaib', 'Paraiso', 'Poblacion', 'Salapungan', 'San Carlos', 
  'San Francisco', 'San Isidro', 'San Jose', 'San Jose de Urquico', 'San Juan Bautista', 'San Juan de Mata', 'San Luis', 
  'San Manuel', 'San Miguel', 'San Nicolas', 'San Pablo', 'San Pascual', 'San Rafael', 'San Roque', 'San Sebastian', 
  'San Vicente', 'Santa Cruz', 'Santa Maria', 'Santo Cristo', 'Santo Domingo', 'Santo Niño', 'Sapang Maragul', 'Sapang Tagalog', 
  'Sepung Calzada', 'Sinait', 'Suizo', 'Tariji', 'Tibag', 'Tibagan', 'Trinidad', 'Ungot', 'Villa Bacolor']
};

export default function ShippingLocation() {
  const navigation = useNavigation();

  const [stage, setStage] = useState('municipality');
  const [municipality, setMunicipality] = useState('');
  const [barangay, setBarangay] = useState('');
  const [finalAddress, setFinalAddress] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [house, setHouse] = useState('');
  const [postal, setPostal] = useState('');

  const handlePickerChange = (value) => {
    if (stage === 'municipality') {
      setMunicipality(value);
      setStage('barangay');
    } else if (stage === 'barangay') {
      setBarangay(value);
      const composed = `${value}, ${municipality}, Tarlac`;
      setFinalAddress(composed);
      setStage('final');
    } else if (stage === 'final') {
      // When clicked again — reset to municipalities
      setMunicipality('');
      setBarangay('');
      setFinalAddress('');
      setStage('municipality');
    }
  };

  const getPickerItems = () => {
    if (stage === 'municipality') {
      return [
        <Picker.Item key="default" label="Select Municipality" value="" />,
        ...Object.keys(MUNICIPALITIES).map(m => (
          <Picker.Item key={m} label={m} value={m} />
        ))
      ];
    } else if (stage === 'barangay') {
      return [
        <Picker.Item key="default" label={`Select Barangay in ${municipality}`} value="" />,
        ...MUNICIPALITIES[municipality].map(b => (
          <Picker.Item key={b} label={b} value={b} />
        ))
      ];
    } else {
      return [
        <Picker.Item key="selected" label={finalAddress} value={finalAddress} />
      ];
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipping Location</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="numeric" />

      <Text style={styles.label}>House No., Street / Building</Text>
      <TextInput style={styles.input} value={house} onChangeText={setHouse} placeholder="e.g.,225, Purok Alpha" />

      <Text style={styles.label}>Address</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={
            stage === 'municipality' ? municipality :
            stage === 'barangay' ? barangay :
            finalAddress
          }
          onValueChange={handlePickerChange}
          style={styles.picker}
        >
          {getPickerItems()}
        </Picker>
      </View>

      <Text style={styles.label}>Postal Code</Text>
      <TextInput style={styles.input} value={postal} onChangeText={setPostal} keyboardType="numeric" />

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    color: '#333',
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 12,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pickerWrapper: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#9747FF',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 190,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 2,
  },
});
