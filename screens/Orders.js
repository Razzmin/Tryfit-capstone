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
import { LinearGradient } from 'expo-linear-gradient';

export default function Orders() {
  const navigation = useNavigation();
  const activeTab = 'To Receive';

  const tabRoutes = {
    'To Ship': 'ToShip',
    'To Receive': 'Orders',
    'Completed': 'Completed',
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

      {/* Nav Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {Object.keys(tabRoutes).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              if (tab !== activeTab) navigation.replace(tabRoutes[tab]);
            }}
            style={styles.tabWrap}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            <View style={[styles.underline, activeTab === tab && styles.activeUnderline]} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* To Receive Content */}
      <ScrollView>
        <View style={styles.orderCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderStatus}>To Receive</Text>
          </View>

          <View style={styles.productRow}>
            <Image
              source={{ uri: 'https://placehold.co/100x100' }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>Y2K Long Sleeve Top</Text>
              <Text style={styles.productSize}>small</Text>
              <Text style={styles.productQty}>Qty: 1</Text>
            </View>
          </View>

          {/* Expected Delivery */}
          <View style={styles.expectedDelivery}>
            <Text style={styles.expectedText}>Expected Delivery:</Text>
            <Text style={styles.deliveryDate}>July 10-14, 2025</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payment:</Text>
            <Text style={styles.totalPrice}>₱180</Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton} onPress={() => navigation.navigate('TrackOrder')}
          >
            <Text style={styles.actionButtonText}>Track Order</Text>
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
  tabWrap: {
    alignItems: 'center',
    marginRight: 30,
  },
  tabText: {
    fontSize: 14,
    color: '#333',
  },
  activeTabText: {
    color: '#9747FF',
    fontWeight: '600',
  },
  underline: {
    height: 3,
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 4,
  },
  activeUnderline: {
    backgroundColor: '#9747FF',
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
  productSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3
  },
  productQty: {
    fontSize: 12,
    color: '#666',
  },
  expectedDelivery: {
    marginTop: 8,
    marginBottom: 4,
  },
  expectedText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#444',
    marginBottom: 5
  },
  deliveryDate: {
    fontSize: 13,
    color: '#9747FF',
    fontWeight: '500',
    letterSpacing: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
    backgroundColor: '#F7F7F7',
    paddingVertical: 10,
    borderRadius: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9747FF',
    marginTop: 10,
  },
  actionButtonText: {
    color: '#9747FF',
    fontSize: 14,
    fontWeight: '500',
  },
});
