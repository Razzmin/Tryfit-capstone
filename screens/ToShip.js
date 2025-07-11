import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function ToShip() {
  const navigation = useNavigation();
  const orderId = 'ORD-20250712-01';

  const handleCopy = () => {
    Clipboard.setStringAsync(orderId);
    Alert.alert('Copied', 'Order ID copied to clipboard');
  };

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
          </View>

          <View style={styles.productRow}>
            <Image
              source={{ uri: 'https://placehold.co/100x100' }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>Unisex Oversized Hoodie</Text>
              <Text style={styles.productSize}>small</Text>
              <Text style={styles.productQty}>Qty: 1</Text>
              <View style={styles.totalRow}>
              <Text style={styles.productTotal}>Total Payment:</Text>
              <Text style={[styles.totalPrice, { marginLeft: 90 }]}>₱350</Text>
            </View>
            </View>
          </View>

          <View style={styles.shippingRow}>
            <Text style={styles.waitingMessage}>Waiting for courier to confirm{'\n'} shipment</Text>
            <TouchableOpacity style={styles.shippingBtn}>
              <Text style={styles.shippingBtnText}>View Shipping Details</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Order ID + Copy */}
          <View style={styles.orderIdRow}>
            <Text style={styles.orderIdText}>Order ID: {orderId}</Text>
            <TouchableOpacity onPress={handleCopy}>
              <Feather name="copy" size={18} color="#9747FF" />
            </TouchableOpacity>
          </View>
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
    marginBottom: 500,
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
    marginBottom: 2,
  },
  productSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  totalRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 5,
  marginBottom: 10,
  },
  productTotal: {
  fontSize: 14,
  fontWeight: '500',
  color: '#333',
  },
  totalPrice: {
  fontSize: 14,
  fontWeight: '700',
  color: '#9747FF',
  },
  productQty: {
    fontSize: 12,
    color: '#666',
  },
  shippingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  waitingMessage: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
  },
  shippingBtn: {
    backgroundColor: '#9747FF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  shippingBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 12,
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 13,
    color: '#333',
  },
});
