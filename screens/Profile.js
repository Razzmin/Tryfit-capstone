import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function EditProfile() {
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);

  const handleDeleteAccount = () => {
    // ⚠️ Place your deletion logic here (e.g. Firebase Auth deletion)
    setShowModal(false);
    alert('Your account has been deleted.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('LandingPage')}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://placehold.co/100x100?text=User' }}
          style={styles.avatar}
        />
        <Text style={styles.profileName}>Your Name</Text>
      </View>

      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
          <FontAwesome name="user" size={20} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* ✅ Edit Body Measurement */}
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditBodyMeasurement')}>
          <FontAwesome name="edit" size={20} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Edit Body Measurement</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notification')}>
          <FontAwesome name="bell" size={20} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ShippingLocation')}>
          <FontAwesome name="map-marker" size={20} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Shipping Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Password')}>
          <FontAwesome name="lock" size={20} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => setShowModal(true)}>
          <FontAwesome name="trash" size={20} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <View style={styles.signOutWrapper}>
        <TouchableOpacity style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Account Deletion */}
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
    letterSpacing: 1,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 30,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
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
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
    letterSpacing: 1,
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
    fontWeight: '400',
    letterSpacing: 2,
  },
});
