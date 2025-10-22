import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function BodyMeasurements() {
  const navigation = useNavigation();
  const db = getFirestore();
  const auth = getAuth();

  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    waist: '',
    shoulder: '',
    chest: '',
    hips: '',
    bust: '',
  });

  const [recommendedSize, setRecommendedSize] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [docId, setDocId] = useState(null);

  // ✅ Fetch user measurements
  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
          collection(db, 'measurements'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const docData = docSnap.data();
          setDocId(docSnap.id);

          setFormData({
            height: docData.height || '',
            weight: docData.weight || '',
            waist: docData.waist || '',
            shoulder: docData.shoulder || '',
            chest: docData.chest || '',
            hips: docData.hips || '',
            bust: docData.bust || '',
          });

          // Compute size right away if data exists
          computeRecommendedSize(docData);
        }
      } catch (error) {
        console.error('Error fetching measurements:', error);
      }
    };

    fetchMeasurements();
  }, []);

  const handleChange = (name, value) => {
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    computeRecommendedSize(updated);
  };

  // ✅ Simple size recommendation logic
  const computeRecommendedSize = (data) => {
    const h = parseFloat(data.height);
    const w = parseFloat(data.weight);
    const chest = parseFloat(data.chest);
    const hips = parseFloat(data.hips);
    const waist = parseFloat(data.waist);

    if (!h || !w || !chest || !hips || !waist) {
      setRecommendedSize('');
      return;
    }

    // Simple logic (you can refine this later)
    let size = 'M';
    const avg = (waist + chest + hips) / 3;

    if (avg < 80) size = 'XS';
    else if (avg < 90) size = 'S';
    else if (avg < 100) size = 'M';
    else if (avg < 110) size = 'L';
    else size = 'XL';

    setRecommendedSize(size);
  };

  // ✅ Save / update Firestore
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('User not logged in');
        return;
      }

      const saveData = {
        ...formData,
        userId: user.uid,
        recommendedSize,
      };

      if (docId) {
        await setDoc(doc(db, 'measurements', docId), saveData, { merge: true });
      } else {
        await setDoc(doc(collection(db, 'measurements')), saveData);
      }

      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error saving measurements:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Body Measurements</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {[
            { label: 'Height (cm)', key: 'height' },
            { label: 'Weight (kg)', key: 'weight' },
            { label: 'Waist (cm)', key: 'waist' },
            { label: 'Shoulder (cm)', key: 'shoulder' },
            { label: 'Chest (cm)', key: 'chest' },
            { label: 'Hips (cm)', key: 'hips' },
            { label: 'Bust (cm)', key: 'bust' },
          ].map((field) => (
            <View key={field.key}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                value={formData[field.key]}
                onChangeText={(value) => handleChange(field.key, value)}
                keyboardType="numeric"
              />
            </View>
          ))}

          {/* Recommended size box */}
          {recommendedSize ? (
            <View style={styles.sizeBox}>
              <Text style={styles.sizeTitle}>Recommended Size</Text>
              <Text style={styles.sizeValue}>{recommendedSize}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveWrapper}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  form: {
    paddingBottom: 100,
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
  sizeBox: {
    backgroundColor: '#F5F0FF',
    borderWidth: 1,
    borderColor: '#C7A6FF',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  sizeTitle: {
    fontSize: 16,
    color: '#6A11CB',
    fontWeight: '600',
    marginBottom: 8,
  },
  sizeValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#9747FF',
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
