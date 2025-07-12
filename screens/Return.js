import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

export default function Return() {
  const navigation = useNavigation();
  const activeTab = 'Return/Refund';

  const [selectedReasons, setSelectedReasons] = useState({});

  const items = [
    { id: '1', name: 'Oversized Hoodie', image: 'https://placehold.co/100x100', price: '₱350' },
    { id: '2', name: 'Gingham Shirt', image: 'https://placehold.co/100x100', price: '₱270' },
  ];

  const tabRoutes = {
    'To Ship': 'ToShip',
    'To Receive': 'Orders',
    'Completed': 'Completed',
    'Return/Refund': 'Return',
    'Cancelled': 'Cancelled',
  };

  const handleReasonChange = (itemId, value) => {
    setSelectedReasons((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('LandingPage')}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Purchases</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {Object.keys(tabRoutes).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => navigation.replace(tabRoutes[tab])}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.instruction}>
          Select item(s) to return and provide a reason:
        </Text>

        {items.map((item) => (
          <View key={item.id} style={styles.returnCard}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedReasons[item.id] || ''}
                  style={styles.picker}
                  onValueChange={(value) => handleReasonChange(item.id, value)}
                >
                  <Picker.Item label="Select reason" value="" />
                  <Picker.Item label="Wrong item" value="wrong" />
                  <Picker.Item label="Damaged" value="damaged" />
                  <Picker.Item label="Not satisfied" value="not_satisfied" />
                  <Picker.Item label="Others" value="others" />
                </Picker>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>Submit Return</Text>
        </TouchableOpacity>
      </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tab: {
    marginRight: 20,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    color: '#333',
  },
  activeTabText: {
    color: '#9747FF',
    fontWeight: '600', 
    borderBottomColor: '#9747FF',
    borderBottomWidth: 2,
  },
  content: {
    paddingBottom: 40,
  },
  instruction: {
    marginBottom: 10,
    color: '#666',
    fontSize: 14,
  },
  returnCard: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 8,
    marginBottom: 15,
  },
  itemImage: {
    width: 85,
    height: 95,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemPrice: {
    color: '#9747FF',
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: '#EDEDED',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#9747FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 300,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
