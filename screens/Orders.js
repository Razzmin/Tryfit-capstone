import React, { useEffect, useState } from 'react';
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
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

export default function Orders() {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const activeTab = 'Orders';

  const [orders, setOrders] = useState([]);
  const [customUserId, setCustomUserId] = useState(null);

  // 🔑 Step 1: Get custom userId from users collection
  useEffect(() => {
    const fetchCustomUserId = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid); // assumes users collection stores custom userId
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.userId) {
            setCustomUserId(userData.userId); // save the generated unique userId
          }
        }
      } catch (err) {
        console.error('Error fetching custom userId:', err);
      }
    };

    fetchCustomUserId();
  }, [user]);

  // 🔑 Step 2: Listen to orders filtered by customUserId + attach product delivery time
  useEffect(() => {
    if (!customUserId) return;

    const unsubscribe = onSnapshot(
      collection(db, 'orders'),
      async (snapshot) => {
        let fetchedOrders = [];

        for (const docSnap of snapshot.docs) {
          const orderData = { id: docSnap.id, ...docSnap.data() };

          if (orderData.userId === customUserId) {
            // Default expectedDelivery
            let expectedDelivery = 'TBD';

            // If order has items, fetch the product delivery time
            if (orderData.items && orderData.items.length > 0) {
              const firstItem = orderData.items[0]; // you can expand if multiple
              if (firstItem.productId) {
                try {
                  const productRef = doc(db, 'products', firstItem.productId);
                  const productSnap = await getDoc(productRef);
                  if (productSnap.exists()) {
                    const productData = productSnap.data();
                    if (productData.delivery) {
                      expectedDelivery = productData.delivery;
                    }
                  }
                } catch (err) {
                  console.error('Error fetching product delivery:', err);
                }
              }
            }

            fetchedOrders.push({
              ...orderData,
              expectedDelivery, // ✅ attach delivery from products
            });
          }
        }

        // Sort by createdAt descending
        fetchedOrders.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.seconds - a.createdAt.seconds;
          }
          return 0;
        });

        setOrders(fetchedOrders);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setOrders([]);
      }
    );

    return () => unsubscribe();
  }, [customUserId]);

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
            <Text
              style={[styles.tabText, activeTab === tab && styles.activeTabText]}
            >
              {tab}
            </Text>
            <View
              style={[
                styles.underline,
                activeTab === tab && styles.activeUnderline,
              ]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView>
        {orders.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#555' }}>
            No orders found.
          </Text>
        ) : (
          orders.map((order) => {
            const item =
              order.items && order.items.length > 0 ? order.items[0] : null;
            if (!item) return null;

            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Status */}
                <View style={styles.cardHeader}>
                  <Text style={styles.orderStatus}>{order.status}</Text>
                  <Text style={styles.orderDate}>
                    {order.createdAt?.toDate().toLocaleString() || 'N/A'}
                  </Text>
                </View>

                {/* Product Info */}
                <View style={styles.productRow}>
                  <Image
                    source={{ uri: item.image || 'https://placehold.co/100x100' }}
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.productName}</Text>
                    <Text style={styles.productSize}>
                      Size: {item.size || 'N/A'}
                    </Text>
                    <Text style={styles.productQty}>
                      Qty: {item.quantity || 1}
                    </Text>
                    <Text style={styles.productColor}>
                      Color: {item.color || '-'}
                    </Text>
                  </View>
                </View>

                {/* Address */}
                <Text style={{ fontSize: 12, color: '#555', marginTop: 5 }}>
                  Delivery Address: {order.address}
                </Text>

                {/* Expected Delivery from product */}
                <View style={styles.expectedDelivery}>
                  <Text style={styles.expectedText}>Expected Delivery:</Text>
                  <Text style={styles.deliveryDate}>
                    {order.expectedDelivery || 'TBD'}
                  </Text>
                </View>

                {/* Total */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Payment:</Text>
                  <Text style={styles.totalPrice}>₱{order.total || 0}</Text>
                </View>

                {/* Track Order */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate('TrackOrder', { orderId: order.id })
                  }
                >
                  <Text style={styles.actionButtonText}>Track Order</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ✅ keep your styles here (no changes made)
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
    marginBottom: 30,
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
  productSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  productQty: {
    fontSize: 12,
    color: '#666',
  },
  productColor: {
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
    marginBottom: 5,
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
