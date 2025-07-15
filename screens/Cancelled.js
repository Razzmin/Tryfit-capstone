import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

export default function Cancelled() {
  const navigation = useNavigation();
  const route = useRoute(); // ✅ Get current route
  const currentRoute = route.name;

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

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {Object.keys(tabRoutes).map((tab) => {
          const routeName = tabRoutes[tab];
          const isActive = routeName === currentRoute;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => {
                if (!isActive) navigation.replace(routeName);
              }}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
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
                <Text style={styles.productSize}>small</Text>
                <Text style={styles.productQty}>Qty: 1</Text>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { marginLeft: 95 }]}>Total Payment:</Text>
                  <Text style={styles.price}>{item.price}</Text>
                </View>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Buy Again</Text>
              </TouchableOpacity>
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
    borderBottomColor: '#9747FF',
    color: '#9747FF',
    fontWeight: '600',
    borderBottomWidth: 2,
  },
  card: {
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
  totalRow: {
    flexDirection: 'row',
    marginTop: 20,
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
  productSize: {
    fontSize: 12,
    color: '#666',
  },
  productQty: {
    fontSize: 12,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#F7F7F7',
    borderRadius: 2,
    paddingHorizontal: 120,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#9747FF'
  },
  primaryButtonText: {
    color: '#9747FF',
    fontSize: 14,
    fontWeight: '500',
  },
});
