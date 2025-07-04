import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function EditProfile() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
        <TouchableOpacity style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')} 
        >
          <FontAwesome name="edit" size={20} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}
          onPress={() => navigation.navigate('Notification')} 
        >
          <FontAwesome name="bell" size={20} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}
        onPress={() => navigation.navigate('ShippingLocation')} 
        >
          <FontAwesome name="map-marker" size={20} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Shipping Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}
         onPress={() => navigation.navigate('Password')}
        >
          <FontAwesome name="lock" size={20} color="#9747FF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <View style={styles.signOutWrapper}>
        <TouchableOpacity style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
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
    letterSpacing: 1
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
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  menuList: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    paddingVertical: 23,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#333',
    letterSpacing: 1,
  },
  signOutWrapper: {
    marginTop: 'auto',
    paddingVertical: 20,
  },
  signOutButton: {
    backgroundColor: '#9747FF',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 50,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 2,
  },
});
