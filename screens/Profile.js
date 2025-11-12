import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  BackHandler,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import{ Header, LoadingOverlay } from '../components/styles';
import { FontAwesome, Feather, MaterialIcons, MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, useIsFocused  } from '@react-navigation/native';
import { auth } from '../firebase/config';
import { signOut, deleteUser } from 'firebase/auth';
import {
  doc,
  deleteDoc,
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';

export default function EditProfile() {
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [pressedItem, setPressedItem] = useState(null);
  const [signOutModal, setSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      global.activeTab = 'EditProfile';
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack(); // normal back
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [navigation])
  );


  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const db = getFirestore();

      // Delete user profile
      await deleteDoc(doc(db, 'users', user.uid));

      // Anonymize chatMessages and productReviews
      const collectionsToAnonymize = ['chatMessages', 'productReviews'];
      for (const collectionName of collectionsToAnonymize) {
        const q = query(collection(db, collectionName), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        for (const docSnap of querySnapshot.docs) {
          await updateDoc(docSnap.ref, {
            userId: null,
            username: 'Anonymous',
          });
        }
      }

      // Handle orders: delete only "pending" ones, anonymize the rest
      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(ordersRef, where('userId', '==', user.uid));
      const ordersSnapshot = await getDocs(ordersQuery);
      for (const docSnap of ordersSnapshot.docs) {
        const data = docSnap.data();
        if (data.status === 'pending') {
          await deleteDoc(docSnap.ref); // Delete pending order
        } else {
          await updateDoc(docSnap.ref, {
            userId: null,
            username: 'Anonymous',
          });
        }
      }

      // Delete Auth user
      await deleteUser(user);

      setShowModal(false);
      navigation.replace('Login');
    } catch (error) {
      alert('Error deleting account: ' + error.message);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              
              // Reset navigation so user cannot go back
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              alert('Error signing out: ' + error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <Header style = {{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingBottom: 20,
        backgroundColor: '#fff',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}
        style={{position: 'absolute', left: 2, top: -4}}>
          <Feather name="arrow-left" size={27} color="black"  />
        </TouchableOpacity>

          <Text style= {{ fontSize: 15, color: '#000', fontFamily:"KronaOne", textTransform: 'uppercase', alignContent: 'center'}}>MY PROFILE</Text>
      </Header>

      <View style={styles.profileSection}>
        <MaterialIcons name="account-circle" size={80} color="#9747FF"
        style={{
          marginBottom: 10,
        }} />
        <Text style={styles.profileName}>Your Name</Text>
      </View>

      <View style={styles.menuList}>
        <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => setPressedItem('EditProfile')}
        onPressOut={() => setPressedItem(null)}
         style={[styles.menuItem,
         pressedItem === 'EditProfile' && { borderColor: '#9747ff', borderWidth: 1},
         ]} 
         onPress={() => navigation.navigate('EditProfile')}
         >
          <MaterialCommunityIcons name="account-box-edit-outline" size={24} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9}
        onPressIn={() => setPressedItem('EditBodyMeasurement')}
        onPressOut={() => setPressedItem(null)}
         style={[styles.menuItem,
         pressedItem === 'EditBodyMeasurement' && { borderColor: '#9747ff', borderWidth: 1},
         ]} 
         onPress={() => navigation.navigate('EditBodyMeasurement')}>
          <FontAwesome name="edit" size={20} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Edit Body Measurement</Text>
        </TouchableOpacity>

        <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => setPressedItem('Notification')}
        onPressOut={() => setPressedItem(null)}
         style={[styles.menuItem,
         pressedItem === 'Notification' && { borderColor: '#9747ff', borderWidth: 1},
         ]} 
         onPress={() => navigation.navigate('Notification')}>
         <Ionicons name="notifications-outline" size={24} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => setPressedItem('ShippingLocation')}
        onPressOut={() => setPressedItem(null)}
         style={[styles.menuItem,
         pressedItem === 'ShippingLocation' && { borderColor: '#9747ff', borderWidth: 1},
         ]} 
         onPress={() => navigation.navigate('ShippingLocation')}>
          <MaterialIcons name="edit-location-alt" size={24} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Edit Shipping Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
         activeOpacity={0.9}
        onPressIn={() => setPressedItem('Password')}
        onPressOut={() => setPressedItem(null)}
         style={[styles.menuItem,
         pressedItem === 'Password' && { borderColor: '#9747ff', borderWidth: 1},
         ]} 
         onPress={() => navigation.navigate('Password')}>
          <MaterialIcons name="password" size={24} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => setPressedItem('DeleteAccount')}
        onPressOut={() => setPressedItem(null)}
         style={[styles.menuItem,
         pressedItem === 'DeleteAccount' && { borderColor: '#9747ff', borderWidth: 1},
         ]} 
         onPress={() => setShowModal(true)}>
          <AntDesign name="user-delete" size={24} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signOutWrapper}>
        <TouchableOpacity style={styles.signOutButton} 
        onPress={() => setSignOutModal(true)}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Your Account?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete your account?{'\n'}
              This action is permanent and cannot be undone. All your data including:
            </Text>

            <View style={styles.list}>
              <Text style={styles.modalItem}>
                • <Text style={styles.highlight}>Order history</Text>
              </Text>
              <Text style={styles.modalItem}>
                • <Text style={styles.highlight}>Preferences</Text>
              </Text>
              <Text style={styles.modalItem}>
                • <Text style={styles.highlight}>Personal information</Text>
              </Text>
            </View>
            <Text style={styles.modalText}>will be permanently removed.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

         {/*Sign out modal */}
      <Modal
      visible={signOutModal}
      transparent animationType="fade"
      onRequestClose={() => setSignOutModal(false)}
      >
      <View style={styles.popupOverlay}>
      <View style={styles.popupBox}>
         <Text style={styles.popupText}>
          Are you sure you want to sign out?
         </Text>
         <View style={styles.popupButtons}>
         <TouchableOpacity 
         style={styles.popupButtonNo}
         onPress={() => setSignOutModal(false)}>
        <Text style={{ color: '#fff', fontWeight: '600'}}>No</Text>
         </TouchableOpacity>
         
          <TouchableOpacity 
         style={styles.popupButtonYes}
         onPress={async () => {
          setSignOutModal (false);
          setSigningOut(true);

          try {
            await signOut(auth);
            setSigningOut(false);
            navigation.replace('Login');
          } catch (error) {
            setSigningOut(false);
            alert('Error signing out: ' +error.message);
          }
         }}>
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15}}>Yes</Text>
         </TouchableOpacity>
            </View> 
          </View>
        </View>
      </Modal>

      {signingOut && (
        <LoadingOverlay>
          <ActivityIndicator size="large" color="#9747FF"/>
          <Text style={{marginTop: 10}}>Signing out in...</Text>
        </LoadingOverlay>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 30,
  },
  profileName: {
    fontSize: 14,
    fontFamily: "KronaOne",
    color: '#333',
    textTransform: 'uppercase',
  },
  menuList: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  menuIcon: {
    marginLeft: 10,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',

    marginLeft: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
    width: '85%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },
  modalText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  modalItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    marginLeft: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  highlight: {
    color: '#9747FF',
    fontWeight: '500',
  },
  list: {
    marginBottom: 10,
    marginTop: 4,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#9747FF',
  },
  cancelText: {
    color: '#9747FF',
    fontWeight: '500',
  },
  deleteBtn: {
    backgroundColor: '#9747FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '500',
  },
  signOutWrapper: {
    marginTop: 40,
    paddingVertical: 20,
  },
  signOutButton: {
    backgroundColor: '#9747FF',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 100,
    
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    letterSpacing: 2,
    fontFamily: "KronaOne",
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
     alignItems: 'center',
  },
  popupBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 45,
    alignItems: 'center',
    width: '80%',
  },
  popupText: {
    fontSize: 17,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  popupButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '120%',
  },
  popupButtonYes: {
    backgroundColor: '#9747FF',
    padding: 16,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  popupButtonNo: {
    backgroundColor: '#A9A9A9',
    padding: 14,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
});
