import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import{Header, StyledFormArea } from '../components/styles';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { getFirestore, collection, addDoc, query, where, getDocs, doc, getDoc,setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const MUNICIPALITIES = {
  Bamban: ['Anupul', 'Banaba', 'Bangcu', 'Culubasa', 'La Paz', 'Lourdes', 'San Nicolas', 'San Pedro', 
  'San Rafael', 'San Vicente', 'Santo Niño'],
  Capas: ['Aranguren', 'Cub-cub', 'Dolores', 'Estrada', 'Lawy', 'Manga', 'Maruglu', 'O’Donnell', 
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
  const db = getFirestore();
  const auth = getAuth();

  const [stage, setStage] = useState('municipality');
  const [municipality, setMunicipality] = useState('');
  const [barangay, setBarangay] = useState('');
  const [finalAddress, setFinalAddress] = useState('');
  

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [house, setHouse] = useState('');
  const [postal, setPostal] = useState('');

  const [isDefault, setIsDefault] = useState(true);
  const [focusedField, setFocusedField] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
  const fetchShippingLocation = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // get custom userId from users collection
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) return;
      const customUserId = userDocSnap.data().userId;

      // query shippingLocations using customUserId
      const q = query(
        collection(db, 'shippingLocations'),
        where('userId', '==', customUserId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setName(data.name || '');
        setPhone(data.phone || '');
        setHouse(data.house || '');
        setMunicipality(data.municipality || '');
        setBarangay(data.barangay || '');
        setPostal(data.postalCode || '');
        setFinalAddress(`${data.barangay}, ${data.municipality}, Tarlac`);
        setStage('final');
      }
    } catch (err) {
      console.error('Error fetching shipping location:', err);
    }
  };

  fetchShippingLocation();
}, []);

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
        ...MUNICIPALITIES[municipality]?.map(b => (
          <Picker.Item key={b} label={b} value={b} />
        ))
      ];
    } else {
      return [
        <Picker.Item key="selected" label={finalAddress} value={finalAddress} />
      ];
    }
  };

  const handleSave = async () => {

    const cleanedName = name.trim();
    const cleanedPhone = phone.replace(/\s+/g, '');
    const cleanedHouse = house.trim();
    const cleanedPostal = postal.trim();
    

    //only accepts letter,spaces and periods
    if (!cleanedName || !/^[A-Za-z\s.]+$/.test(cleanedName)) {
      return Alert.alert('Validation Error', 'Please enter a valid name(letters only).');
    }
    //ensures number starts at 09 or +639, and only 11 digits coz ph nums
    if (!cleanedPhone || !/^(09\d{9}|(\+639)\d{9})$/.test(cleanedPhone)) {
       return Alert.alert('Validation Error', 'Please enter a valid mobile number(e.g., 09xxx).');
    }
 if (!cleanedHouse || cleanedHouse.length < 5) {
    return Alert.alert('Validation Error', 'Please enter a more complete house/street/building information');
 }
 if (!municipality) {
  return Alert.alert('Validation Error', 'Please select a municipality.');
 }
  if (!barangay) {
    return Alert.alert('Validation Error', 'Please select a barangay.');
  }
 if (!cleanedPostal || !/^\d{4}$/.test(cleanedPostal)) {
   return Alert.alert('Validation Error', 'Please enter a valid 4-digit postal code.');
 }
  
  try {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Not logged in', 'Please login to save your shipping location.');
      return;
    }


    // Get custom userId
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      Alert.alert("Error", "User profile not found.");
      return;
    }
    const customUserId = userDocSnap.data().userId;

    // Check if a location already exists
    const q = query(collection(db, 'shippingLocations'), where('userId', '==', customUserId));
    const querySnapshot = await getDocs(q);

    const addressData = {
      userId: customUserId,
      name: cleanedName,
      phone: cleanedPhone,
      house: cleanedHouse, municipality, barangay,
      postalCode: cleanedPostal,
      fullAddress: `${barangay}, ${municipality}, Tarlac`,
      createdAt: new Date(),
    };

    if (!querySnapshot.empty) {
      // Update existing location
      const docRef = querySnapshot.docs[0].ref;
      await setDoc(docRef, addressData, { merge: true });
    } else {
      // Add new location
      await addDoc(collection(db, 'shippingLocations'), addressData);
    }

    Alert.alert('Success', 'Shipping location saved successfully!');
    navigation.goBack();
  } catch (error) {
    console.error('Error saving shipping location:', error);
    Alert.alert('Error', 'Failed to save shipping location.');
  }
};

  return (
    <View style={styles.container}>
   <Header style = {{
                     flexDirection: 'row',
                     alignItems: 'center',
                     justifyContent: 'center',
                     paddingHorizontal: 16,
                     paddingBottom: 10,
                     backgroundColor: '#fff',
                     borderBottomWidth: 1,
                     borderBottomColor: '#ddd',
                   }}>
                     <TouchableOpacity onPress={() => navigation.goBack()}
                     style={{position: 'absolute', left: 16, top: -4}}>
                       <Feather name="arrow-left" size={27} color="black"  />
                     </TouchableOpacity>
       
                      <Text style= {{ fontSize: 15, color: '#000', fontFamily:"KronaOne", textTransform: 'uppercase', alignContent: 'center'}}>Shipping Address</Text>
                   </Header>
      
      <StyledFormArea style={{ width: '95%', justifyContent: 'center', alignSelf: 'center' }}>
      <Text style={styles.label}>Name (Receiver):</Text>
      <TextInput style={[styles.input,
      focusedField === 'name' && {borderColor: '#9747FF'},
      ]} 
      value={name}
       onChangeText={setName} 
        placeholder="e.g. Juan Dela Cruz"
        onFocus={() => setFocusedField('name')}
        onBlur={() => setFocusedField('')}
       />

      <Text style={styles.label}>Phone Number:</Text>
      <TextInput style={[styles.input,
      focusedField === 'phone' && {borderColor: '#9747FF'},
      ]}
       value={phone}
        onChangeText={(text) => {
          //will auto format the number
           let  cleaned = text.replace(/\D/g, '');//removes non digits
           
            if(cleaned.length > 11) {
              cleaned = cleaned.slice(0, 11);
            }

          let formatted = cleaned;
          if(cleaned.length > 4 && cleaned.length <= 7) {
          formatted = cleaned.replace(/(\d{4})(\d{1,3})/, '$1 $2');
        } else if (cleaned.length > 7) {
          formatted = cleaned.replace(/(\d{4})(\d{3})(\d{1,4})/, '$1 $2 $3');
        }

        setPhone(formatted);
        }}
         keyboardType="numeric"
          placeholder="e.g. 09xx xxx xxxx"
          onFocus={() => setFocusedField('phone')}
          onBlur={() => setFocusedField('')}
         />

      <Text style={styles.label}>House No., Street / Building:</Text>
      <TextInput
        style={[styles.input,
         focusedField === 'house' && {borderColor: '#9747FF'},
      errors.name && {borderColor: 'red'},]}
        value={house}
        onChangeText={setHouse}
        placeholder="e.g., Kamanggahan, Care"
        onFocus={() => setFocusedField('house')}
          onBlur={() => setFocusedField('')}
      />

      <Text style={styles.label}>Address:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={
            stage === 'municipality'
              ? municipality
              : stage === 'barangay'
              ? barangay
              : finalAddress
          }
          onValueChange={handlePickerChange}
          style={styles.picker}
          dropdownIconColor="#9747FF"
        >
          {getPickerItems()}
        </Picker>
      </View>

      <Text style={styles.label}>Postal Code:</Text>
      <TextInput style={[styles.input,
         focusedField === 'postal' && {borderColor: '#9747FF'},
      ]} 
      value={postal} 
      onChangeText={setPostal}
       keyboardType="numeric"
        placeholder="e.g., 2300"
        onFocus={() => setFocusedField('postal')}
        onBlur={() => setFocusedField('')}
        />
      </StyledFormArea>


      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
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
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f1926",

  },
  pickerWrapper: {
    backgroundColor:  "#FFFFFF",
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f1926",
    height: 55,
  },
  picker: {
    height: '100%',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#9747FF',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 190,
    marginTop: 30,
    width: '90%',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: "KronaOne",
    letterSpacing: 2,

  },
});
