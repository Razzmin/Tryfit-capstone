import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function EditBodyMeasurement() {
  const navigation = useNavigation();
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    waist: '',
    shoulder_width: '',
    chest_width: '',
    hips: '',
    bust: '',
  });

  const [recommendedTop, setRecommendedTop] = useState('');
  const [recommendedBottom, setRecommendedBottom] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // ---------- Size recommendation logic ----------
  const topSizes = [
    { size: 'S', height: [150, 165], weight: [45, 60], shoulder: [37, 44], chest: [81, 92] },
    { size: 'M', height: [155, 170], weight: [50, 68], shoulder: [39, 46], chest: [86, 96] },
    { size: 'L', height: [160, 175], weight: [55, 75], shoulder: [41, 48], chest: [91, 100] },
    { size: 'XL', height: [165, 180], weight: [62, 85], shoulder: [43, 50], chest: [97, 106] },
  ];

  const bottomSizes = [
    { size: 'S', waist: [63, 76], hip: [87, 92], height: [150, 165], weight: [45, 60] },
    { size: 'M', waist: [67, 82], hip: [91, 96], height: [155, 170], weight: [50, 68] },
    { size: 'L', waist: [71, 88], hip: [95, 100], height: [160, 175], weight: [55, 75] },
    { size: 'XL', waist: [77, 94], hip: [99, 105], height: [165, 180], weight: [62, 85] },
  ];

  const calculateTopSize = (data) => {
    let bestMatch = null, bestScore = Infinity;
    topSizes.forEach((s) => {
      let score = 0;
      score += data.height < s.height[0] ? (s.height[0] - data.height) ** 2 : data.height > s.height[1] ? (data.height - s.height[1]) ** 2 : 0;
      score += data.weight < s.weight[0] ? (s.weight[0] - data.weight) ** 2 : data.weight > s.weight[1] ? (data.weight - s.weight[1]) ** 2 : 0;
      score += data.shoulder_width < s.shoulder[0] ? (s.shoulder[0] - data.shoulder_width) ** 2 : data.shoulder_width > s.shoulder[1] ? (data.shoulder_width - s.shoulder[1]) ** 2 : 0;
      score += data.chest_width < s.chest[0] ? (s.chest[0] - data.chest_width) ** 2 : data.chest_width > s.chest[1] ? (data.chest_width - s.chest[1]) ** 2 : 0;
      if (score < bestScore) { bestScore = score; bestMatch = s.size; }
    });
    return bestMatch || 'M';
  };

  const calculateBottomSize = (data) => {
    let bestMatch = null, bestScore = Infinity;
    bottomSizes.forEach((s) => {
      let score = 0;
      score += data.height < s.height[0] ? (s.height[0] - data.height) ** 2 : data.height > s.height[1] ? (data.height - s.height[1]) ** 2 : 0;
      score += data.weight < s.weight[0] ? (s.weight[0] - data.weight) ** 2 : data.weight > s.weight[1] ? (data.weight - s.weight[1]) ** 2 : 0;
      score += data.waist < s.waist[0] ? (s.waist[0] - data.waist) ** 2 : data.waist > s.waist[1] ? (data.waist - s.waist[1]) ** 2 : 0;
      score += data.hips < s.hip[0] ? (s.hip[0] - data.hips) ** 2 : data.hips > s.hip[1] ? (data.hips - s.hip[1]) ** 2 : 0;
      if (score < bestScore) { bestScore = score; bestMatch = s.size; }
    });
    return bestMatch || 'M';
  };

  // ---------- Fetch Firestore measurements ----------
  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'measurements', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            height: data.height?.toString() || '',
            weight: data.weight?.toString() || '',
            waist: data.waist?.toString() || '',
            shoulder_width: data.shoulder_width?.toString() || '',
            chest_width: data.chest_width?.toString() || '',
            hips: data.hips?.toString() || '',
            bust: data.bust?.toString() || '',
          });
          setRecommendedTop(data.recommendation_top_size || '');
          setRecommendedBottom(data.recommendation_bottom_size || '');
        }
      } catch (err) {
        console.error('Error fetching measurements:', err);
      }
    };
    fetchMeasurements();
  }, [user]);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleRecalculate = () => {
    const data = {
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      waist: parseFloat(formData.waist),
      shoulder_width: parseFloat(formData.shoulder_width),
      chest_width: parseFloat(formData.chest_width),
      hips: parseFloat(formData.hips),
    };
    if (Object.values(data).some(isNaN)) {
      Alert.alert('Error', 'Please fill all numeric fields before recalculating.');
      return;
    }
    const top = calculateTopSize(data);
    const bottom = calculateBottomSize(data);
    setRecommendedTop(top);
    setRecommendedBottom(bottom);
  };

  const handleSave = async () => {
    if (!user) return alert('User not logged in');
    try {
      const docRef = doc(db, 'measurements', user.uid);
      await setDoc(docRef, {
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        waist: parseFloat(formData.waist),
        shoulder_width: parseFloat(formData.shoulder_width),
        chest_width: parseFloat(formData.chest_width),
        hips: parseFloat(formData.hips),
        bust: parseFloat(formData.bust),
        recommendation_top_size: recommendedTop,
        recommendation_bottom_size: recommendedBottom,
        timestamp: new Date(),
      }, { merge: true });

      setShowSuccessPopup(true);
    } catch (err) {
      console.error('Error saving measurements:', err);
      alert('Failed to save measurements.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Body Measurements</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {[
            { label: 'Height (cm)', key: 'height' },
            { label: 'Weight (kg)', key: 'weight' },
            { label: 'Waist (cm)', key: 'waist' },
            { label: 'Shoulder Width (cm)', key: 'shoulder_width' },
            { label: 'Chest Width (cm)', key: 'chest_width' },
            { label: 'Hips (cm)', key: 'hips' },
            { label: 'Bust (cm)', key: 'bust' },
          ].map(field => (
            <View key={field.key}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                value={formData[field.key]}
                onChangeText={value => handleChange(field.key, value)}
                keyboardType="numeric"
              />
            </View>
          ))}

          {/* Display Recommended Sizes */}
          {(recommendedTop || recommendedBottom) && (
            <View style={styles.sizeBox}>
              {recommendedTop && <Text>Recommended Top Size: {recommendedTop}</Text>}
              {recommendedBottom && <Text>Recommended Bottom Size: {recommendedBottom}</Text>}
            </View>
          )}

          <TouchableOpacity style={styles.recalcButton} onPress={handleRecalculate}>
            <Text style={styles.recalcText}>Recalculate</Text>
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
  sizeBox:{backgroundColor:'#F5F0FF',borderWidth:1,borderColor:'#C7A6FF',borderRadius:10,padding:20,marginTop:10, marginBottom: 10, alignItems:'center'},
  recalcButton:{backgroundColor:'#9747FF',borderRadius:10,paddingVertical:16,alignItems:'center',marginBottom:10},
  recalcText:{color:'#fff',fontSize:17,fontWeight:'500'},
  saveButton:{backgroundColor:'#9747FF',borderRadius:10,paddingVertical:16,alignItems:'center',marginTop:10},
  saveText:{color:'#fff',fontSize:17,fontWeight:'500'},
  popupOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.3)',justifyContent:'center',alignItems:'center'},
  popupBox:{backgroundColor:'#fff',borderRadius:10,padding:30,width:'80%',alignItems:'center'},
  popupText:{fontSize:16,color:'#333',textAlign:'center',marginBottom:20},
  popupButton:{backgroundColor:'#9747FF',paddingVertical:12,paddingHorizontal:30,borderRadius:6},
  popupButtonText:{color:'#fff',fontWeight:'500'},
});
