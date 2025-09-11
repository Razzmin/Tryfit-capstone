import React, { useEffect, useState } from 'react';
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
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';


const db = getFirestore();
const auth = getAuth();

const randomSizes = ['small', 'medium', 'large', 'xl', 'xxl'];

export default function Cancelled() {
  const navigation = useNavigation();
  const route = useRoute();
  const currentRoute = route.name;
   const activeTab = 'Cancelled';

  const user = auth.currentUser;
  const [cancelledOrders, setCancelledOrders] = useState([]);

  useEffect(() => {
    const fetchCustomUserId = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.userId) {
            const customId = userData.userId;

            // Listen to cancelled collection for this custom userId
            const unsubscribe = onSnapshot(
              collection(db, 'cancelled'), // ✅ fetch from "cancelled" collection
              (snapshot) => {
                const fetchedOrders = snapshot.docs
                  .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
                  .filter(order => order.userId === customId); // ✅ filter by custom userId
                
                // Optional: sort by cancelled date if exists
                fetchedOrders.sort(
                  (a, b) => (b.cancelledDate?.seconds || 0) - (a.cancelledDate?.seconds || 0)
                );

                setCancelledOrders(fetchedOrders);
              },
              (error) => {
                console.error('Error fetching cancelled orders:', error);
                setCancelledOrders([]);
              }
            );

            return () => unsubscribe();
          }
        }
      } catch (err) {
        console.error('Error fetching custom userId:', err);
      }
    };

    fetchCustomUserId();
  }, [user]);


   const tabRoutes = {
      
      'Orders': 'Orders',
      'To Ship': 'ToShip',
      'To Receive': 'ToReceive',
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
        >
          {Object.keys(tabRoutes).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => {
                if (tab !== activeTab) navigation.replace(tabRoutes[tab]);
              }}
              style={styles.tabWrap}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
              <View style={[styles.underline, activeTab === tab && styles.activeUnderline]} />
            </TouchableOpacity>
          ))}
        </ScrollView>

  

      {/* Cancelled Items */}
      <ScrollView>
        {cancelledOrders.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#555' }}>
            No cancelled orders found.
          </Text>
        ) : (
          cancelledOrders.map((order) => {
            // Use first item if exists, else skip
            const item = order.items && order.items.length > 0 ? order.items[0] : null;
            if (!item) return null;

            const size = randomSizes[Math.floor(Math.random() * randomSizes.length)];
            // Format date (if stored as timestamp, convert it here)
            const formattedDate = order.cancelledDate
              ? new Date(order.cancelledDate.seconds * 1000).toLocaleDateString()
              : 'N/A';

            return (
              <View key={order.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.status}>Cancelled</Text>
                  <Text style={styles.date}>{formattedDate}</Text>
                </View>

                <View style={styles.productRow}>
                  <Image
                    source={{ uri: item.image || 'https://placehold.co/100x100' }}
                    style={styles.image}
                  />
                  <View style={styles.details}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.productSize}>{size}</Text>
                    <Text style={styles.productQty}>Qty: {item.quantity || 1}</Text>
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, { marginLeft: 95 }]}>Total Payment:</Text>
                      <Text style={styles.price}>₱{order.total || 'N/A'}</Text>
                    </View>
                  </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      navigation.navigate("ReCheckout", {
                        selectedItems: order.items,   
                        total: order.total, 
                        address: order.address, 
                        deliveryFee: order.deliveryFee, }); }} >
                    <Text style={styles.primaryButtonText}>Buy Again</Text>
                  </TouchableOpacity>


                </View>
              </View>
            );
          })
        )}
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
    borderColor: '#9747FF',
  },
  primaryButtonText: {
    color: '#9747FF',
    fontSize: 14,
    fontWeight: '500',
  },
});
