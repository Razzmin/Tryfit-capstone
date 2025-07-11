import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

export default function Cancelled() {
  const navigation = useNavigation();
  const activeTab = 'Cancelled';

  const cancelledItems = [
    {
      id: '1',
      name: 'Unisex Oversized Hoodie',
      price: '₱350',
      image: 'https://placehold.co/100x100',
      date: 'June 12, 2025',
      reason: 'Cancelled by buyer',
    },
  ];

  // Map tabs to screen names
  const tabRoutes = {
    'To Ship': 'ToShip',
    'To Receive': 'Orders',
    'Completed': 'Completed',
    'Return/Refund': 'Return',
    'Cancelled': 'Cancelled',
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

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {Object.keys(tabRoutes).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => {
              if (tab !== activeTab) navigation.replace(tabRoutes[tab]);
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cancelled Items */}
      <ScrollView>
        {cancelledItems.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.status}>Cancelled</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>

            <View style={styles.productRow}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.details}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.reason}>Reason: {item.reason}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#fff',
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
    borderBottomColor: '#9747FF',
    color: '#9747FF',
    fontWeight: '600',
    borderBottomWidth: 2,
  },
  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 15,
    marginBottom: 550,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  status: {
    fontWeight: 'bold',
    color: '#9747FF',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  productRow: {
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  details: {
    marginLeft: 10,
    justifyContent: 'center',
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  price: {
    fontWeight: '600',
    color: '#9747FF',
  },
  reason: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
});
