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
  deleteField,
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

  const [recommendedTop, setRecommendedTop] = useState('');
  const [recommendedBottom, setRecommendedBottom] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [docId, setDocId] = useState(null);

  const topSizes = [
    { size: 'S', height: [150, 165], weight: [45, 60], shoulder: [37, 44], chest: [81, 92] },
    { size: 'M', height: [155, 170], weight: [50, 68], shoulder: [39, 46], chest: [86, 96] },
    { size: 'L', height: [160, 175], weight: [55, 75], shoulder: [41, 48], chest: [91, 100] },
    { size: 'XL', height: [165, 180], weight: [62, 85], shoulder: [43, 50], chest: [97, 106] }
  ];

  const bottomSizes = [
    { size: 'S', waist: [63, 76], hip: [87, 92], height: [150, 165], weight: [45, 60] },
    { size: 'M', waist: [67, 82], hip: [91, 96], height: [155, 170], weight: [50, 68] },
    { size: 'L', waist: [71, 88], hip: [95, 100], height: [160, 175], weight: [55, 75] },
    { size: 'XL', waist: [77, 94], hip: [99, 105], height: [165, 180], weight: [62, 85] }
  ];

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
          setDocId(docSnap.id);
          const docData = docSnap.data();

          setFormData({
            height: docData.height?.toString() || '',
            weight: docData.weight?.toString() || '',
            waist: docData.waist?.toString() || '',
            shoulder: docData.shoulder?.toString() || docData.shoulder_width?.toString() || '',
            chest: docData.chest?.toString() || docData.chest_width?.toString() || '',
            hips: docData.hips?.toString() || '',
            bust: docData.bust?.toString() || '',
          });

          setRecommendedTop(docData.recommendedTop || docData.recommendation_top_size || '');
          setRecommendedBottom(docData.recommendedBottom || docData.recommendation_bottom_size || '');
        }
      } catch (error) {
        console.error('Error fetching measurements:', error);
      }
    };
    fetchMeasurements();
  }, []);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const calculateSizes = () => {
    const h = parseFloat(formData.height);
    const w = parseFloat(formData.weight);
    const shoulder = parseFloat(formData.shoulder);
    const chest = parseFloat(formData.chest);
    const waist = parseFloat(formData.waist);
    const hips = parseFloat(formData.hips);

    if (!h || !w || !shoulder || !chest || !waist || !hips) {
      alert('Please fill all fields to calculate sizes.');
      return { bestTop: '', bestBottom: '' };
    }

    let bestTop = 'M';
    let bestTopScore = Infinity;
    topSizes.forEach(s => {
      let score = 0;
      score += h < s.height[0] ? (s.height[0]-h)**2 : h > s.height[1] ? (h-s.height[1])**2 : 0;
      score += w < s.weight[0] ? (s.weight[0]-w)**2 : w > s.weight[1] ? (w-s.weight[1])**2 : 0;
      score += shoulder < s.shoulder[0] ? (s.shoulder[0]-shoulder)**2 : shoulder > s.shoulder[1] ? (shoulder-s.shoulder[1])**2 : 0;
      score += chest < s.chest[0] ? (s.chest[0]-chest)**2 : chest > s.chest[1] ? (chest-s.chest[1])**2 : 0;
      if (score < bestTopScore) { bestTopScore = score; bestTop = s.size; }
    });

    let bestBottom = 'M';
    let bestBottomScore = Infinity;
    bottomSizes.forEach(s => {
      let score = 0;
      score += h < s.height[0] ? (s.height[0]-h)**2 : h > s.height[1] ? (h-s.height[1])**2 : 0;
      score += w < s.weight[0] ? (s.weight[0]-w)**2 : w > s.weight[1] ? (w-s.weight[1])**2 : 0;
      score += waist < s.waist[0] ? (s.waist[0]-waist)**2 : waist > s.waist[1] ? (waist-s.waist[1])**2 : 0;
      score += hips < s.hip[0] ? (s.hip[0]-hips)**2 : hips > s.hip[1] ? (hips-s.hip[1])**2 : 0;
      if (score < bestBottomScore) { bestBottomScore = score; bestBottom = s.size; }
    });

    setRecommendedTop(bestTop);
    setRecommendedBottom(bestBottom);
    return { bestTop, bestBottom };
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('❌ User not logged in');
        return;
      }

      const { bestTop, bestBottom } = calculateSizes();

      const dataToSave = {
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        waist: parseFloat(formData.waist),
        shoulder: parseFloat(formData.shoulder),
        chest: parseFloat(formData.chest),
        hips: parseFloat(formData.hips),
        bust: parseFloat(formData.bust),
        recommendedTop: bestTop,
        recommendedBottom: bestBottom,
        timestamp: new Date(),
        userId: user.uid,
        // delete old duplicate fields
        shoulder_width: deleteField(),
        chest_width: deleteField(),
        recommendation_top_size: deleteField(),
        recommendation_bottom_size: deleteField(),
      };

      if (docId) {
        await setDoc(doc(db, 'measurements', docId), dataToSave, { merge: true });
      } else {
        const newDocRef = doc(collection(db, 'measurements'));
        await setDoc(newDocRef, dataToSave);
        setDocId(newDocRef.id);
      }

      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error saving measurements:', error);
      alert('❌ Failed to save. Check console.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Body Measurements</Text>
        <View style={{ width: 24 }} />
      </View>

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

          {(recommendedTop || recommendedBottom) && (
            <View style={styles.sizeBox}>
              {recommendedTop && <Text>Recommended Top Size: {recommendedTop}</Text>}
              {recommendedBottom && <Text>Recommended Bottom Size: {recommendedBottom}</Text>}
            </View>
          )}

          <TouchableOpacity style={styles.calculateButton} onPress={calculateSizes}>
            <Text style={styles.calculateText}>Calculate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  container:{flex:1,backgroundColor:'#fff',paddingTop:60,paddingHorizontal:20},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},
  headerTitle:{fontSize:20,fontWeight:'600'},
  form:{paddingBottom:100},
  label:{fontSize:15,marginBottom:5,color:'#696969'},
  input:{fontSize:15,marginBottom:20,borderWidth:1,borderRadius:10,borderColor:'#ccc',height:55,backgroundColor:'#EDEDED',paddingHorizontal:15,paddingVertical:14},
  sizeBox:{backgroundColor:'#F5F0FF',borderWidth:1,borderColor:'#C7A6FF',borderRadius:10,padding:20,marginTop:10,alignItems:'center'},
  calculateButton:{backgroundColor:'#6A11CB',borderRadius:10,paddingVertical:16,alignItems:'center',marginTop:10},
  calculateText:{color:'#fff',fontSize:17,fontWeight:'500'},
  saveButton:{backgroundColor:'#9747FF',borderRadius:10,paddingVertical:16,alignItems:'center',marginTop:10},
  saveText:{color:'#fff',fontSize:17,fontWeight:'500'},
  popupOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.3)',justifyContent:'center',alignItems:'center'},
  popupBox:{backgroundColor:'#fff',borderRadius:10,padding:30,width:'80%',alignItems:'center'},
  popupText:{fontSize:16,color:'#333',textAlign:'center',marginBottom:20},
  popupButton:{backgroundColor:'#9747FF',paddingVertical:12,paddingHorizontal:30,borderRadius:6},
  popupButtonText:{color:'#fff',fontWeight:'500'},
});
