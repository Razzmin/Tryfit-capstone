import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import { NotificationContent } from '../components/notificationcontent';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Notification() {
  const navigation = useNavigation();
  const {notifications} = useContext(NotificationContent);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={{ width: 24 }} /> 
      </View>

       {/* Notifications List */}
      {notifications.length === 0 ? (
        <Text style={{ color: '#999', marginTop: 20 }}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <AntDesign name="shoppingcart" size={20} color="#9747FF" />
              <Text style={styles.message}> Added "{item.message}" to cart</Text>
               </View>
              <Text style={styles.timestamp}>{item.time} • {item.date}</Text>
            </View>
          )}
        />
      )}
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
  notificationBox: {
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 15,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});