import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

export default function ToShip() {
  const navigation = useNavigation();

  // Correct screen mapping
  const tabRoutes = {
    'To Ship': 'ToShip',
    'To Receive': 'Orders',
    'Completed': 'Completed',
    'Return': 'Return',
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

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {Object.keys(tabRoutes).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, tab === 'To Ship' && styles.activeTab]}
            onPress={() => {
              if (tab !== 'To Ship') navigation.navigate(tabRoutes[tab]);
            }}
          >
            <Text style={[styles.tabText, tab === 'To Ship' && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView>
        <View style={styles.orderCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderStatus}>To Ship</Text>
            <Text style={styles.orderDate}>June 30, 2025</Text>
          </View>
          <View style={styles.productRow}>
            <Image
              source={{ uri: 'https://placehold.co/100x100' }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>Unisex Oversized Hoodie</Text>
              <Text style={styles.productPrice}>₱350</Text>
              <Text style={styles.productQty}>Qty: 1</Text>
            </View>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payment:</Text>
            <Text style={styles.totalPrice}>₱350</Text>
          </View>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Contact Seller</Text>
          </TouchableOpacity>
        </View>
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
  },
  tabText: {
    fontSize: 14,
    color: '#333',
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabText: {
    color: '#9747FF',
    fontWeight: '600',
    borderBottomColor: '#9747FF',
    borderBottomWidth: 2,
  },
  orderCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 15,
    marginBottom: 450,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderStatus: {
    fontWeight: 'bold',
    color: '#9747FF',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  productInfo: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    color: '#9747FF',
    fontWeight: '600',
  },
  productQty: {
    fontSize: 12,
    color: '#666',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 10,
  },
  totalLabel: {
    fontWeight: '500',
  },
  totalPrice: {
    fontWeight: '700',
    color: '#9747FF',
  },
  actionButton: {
    backgroundColor: '#9747FF',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
