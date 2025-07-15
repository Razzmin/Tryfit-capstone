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

export default function Completed() {
  const navigation = useNavigation();
  const activeTab = 'Completed';

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

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {Object.keys(tabRoutes).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              if (tab !== activeTab) {
                navigation.replace(tabRoutes[tab]);
              }
            }}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView>
        <View style={styles.orderCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderStatus}>Completed</Text>
          </View>

          <View style={styles.productRow}>
            <Image
              source={{ uri: 'https://placehold.co/100x100' }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>Coquette Ruffle Skirt</Text>
              <Text style={styles.productSize}>small</Text>
              <Text style={styles.productQty}>Qty: 1</Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { marginLeft: 175 }]}>Total Payment:</Text>
            <Text style={styles.totalPrice}>₱250</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.secondaryButton, { marginLeft: 90}]}>
              <Text style={styles.secondaryButtonText }>Rate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Buy Again</Text>
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
    marginRight: 30,
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
    width: 90,
    height: 90,
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
    marginBottom: 10
  },
  productPrice: {
    color: '#9747FF',
    fontWeight: '600',
  },
  productSize: {
    fontSize: 12,
    color: '#666',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#9747FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#9747FF',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 6,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#9747FF',
    fontSize: 14,
    fontWeight: '500',
  },
});
