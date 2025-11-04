import { useNavigation } from '@react-navigation/native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import{Header } from '../components/styles';
import { db, auth } from '../firebase/config';
import { doc, getDoc, updateDoc,} from 'firebase/firestore';

export default function EditProfile() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [focusedField, setFocusedField] = useState('');

  const validateInputs = () => {
    const cleanedPhone = phone.replace(/\s/g, '');
    
    if (!name.trim()) {
      Alert.alert('Missing Field', 'Please enter your name.');
      return false;
    }
    if (!username.trim()) {
      Alert.alert('Missing Field', 'Please enter your username.');
      return false;
  }
    if (!gender || gender === 'Select Gender') {
      Alert.alert('Missing Field', 'Please select your gender.');
      return false;
    }
     if (!cleanedPhone.trim()) {
      Alert.alert('Missing Field', 'Please enter your phone number.');
      return false;
     }
     //ensures number starts at 09 or +639, and only 11 digits coz ph nums
    if (!cleanedPhone || !/^(09\d{9}|(\+639)\d{9})$/.test(cleanedPhone)) {
       return Alert.alert('Validation Error', 'Please enter a valid mobile number(e.g., 09xxx).');
    }
     if (!email.trim()) {
      Alert.alert('Missing Field', 'Please enter your email.');
      return false;
     }
     if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Missing Field', 'Please enter valid email address.');
      return false;
     }

     return true;
    };

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDoc = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDoc);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setName(userData.name || '');
            setUsername(userData.username || '');
            setGender(userData.gender || '');
            setPhone(userData.phone || '');
            setEmail(userData.email || '');
          }
        } catch (error) {
          console.log('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!validateInputs()) return;


  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const userRef = doc(db, 'users', currentUser.uid); 
      
      const userSnap = await getDoc(userRef);
      let userId = '';
      if (userSnap.exists()) {
        const userData = userSnap.data();
        userId = userData.userId || ''; 
      }  
      await updateDoc(userRef, {
        name,
        username,
        gender,
        phone,
        email,
        userId, 
      });

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.log('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  }
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'padding' : undefined}
    >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              
                   <ScrollView
                      contentContainerStyle={{ flexGrow: 1}}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}>

       <SafeAreaView style={styles.container}>
      {/* Header */}
       <Header style = {{
                           flexDirection: 'row',
                           alignItems: 'center',
                           justifyContent: 'center',
                           paddingHorizontal: 16,
                           paddingBottom: 30,
                           backgroundColor: '#fff',
                         }}>
                           <TouchableOpacity onPress={() => navigation.goBack()}
                           style={{position: 'absolute', left: 0, top: -4}}>
                             <Feather name="arrow-left" size={27} color="black"  />
                           </TouchableOpacity>
             
                            <Text style= {{ fontSize: 15, color: '#000', fontFamily:"KronaOne", textTransform: 'uppercase', alignContent: 'center'}}>EDIT PROFILE</Text>
                         </Header>

      
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={[styles.input,
            focusedField === 'name' && {borderColor: '#9747FF'},
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField('')}
            maxLength={40}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input,
            focusedField === 'username' && {borderColor: '#9747FF'},
            ]}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField('')}
            maxLength={40}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={[styles.picker,
              focusedField === 'gender' && {borderColor: '#9747FF'},
              ]}
              
              onFocus={() => setFocusedField('gender')}
              onBlur={() => setFocusedField('')}
            >
              <Picker.Item label="Select Gender" value="" enabled={false} />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Other" value="Other" />
              <Picker.Item label="Prefer not to say" value="Prefer not to say" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number (Recovery)</Text>
          <TextInput
            style={[styles.input,
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
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField('')}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input,
            focusedField === 'email' && {borderColor: '#9747FF'},
            ]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter your email"
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField('')}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </SafeAreaView>
      </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  formContent: {
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginLeft: 20,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 10,
    fontSize: 15,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
    width: '90%',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5,
    backgroundColor: '#fff',
    width: '90%',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
    backgroundColor: '#fff',
    },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#9747FF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: "KronaOne",
    letterSpacing: 1,
  },
});
