import React, { useEffect, useState } from 'react';
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
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

const randomSizes = ['small', 'medium', 'large', 'xl', 'xxl'];

export default function ToReceive() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const activeTab = 'To Receive';

  const [orders, setOrders] = useState([]);
  const [customUserId, setCustomUserId] = useState(null);

  // Fetch customUserId from users collection
  useEffect(() => {
    const fetchCustomUserId = async () => {
      try {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.userId) setCustomUserId(data.userId);
        }
      } catch (err) {
        console.error('Error fetching custom userId:', err);
      }
    };
    fetchCustomUserId();
  }, [user]);

  // Listen to "toReceive" collection
  useEffect(() => {
    if (!customUserId) {
      setOrders([]);
      return;
    }

    const q = query(collection(db, 'toReceive'), where('userId', '==', customUserId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ docId: docSnap.id, ...docSnap.data() });
        });


        // Sort by createdAt descending if present
        fetched.sort((a, b) => {
          if (a.createdAt && b.createdAt) return b.createdAt.seconds - a.createdAt.seconds;
          return 0;
        });

        setOrders(fetched);
      },
      (error) => {
        console.error('Error fetching toReceive orders:', error);
        setOrders([]);
      }
    );

    return () => unsubscribe();
  }, [customUserId]);

  const handleCopy = (orderId) => {
    Clipboard.setStringAsync(orderId);
    Alert.alert('Copied', 'Order ID copied to clipboard');
  };

  const handleReceiveOrder = (order) => {
    Alert.alert(
      'Confirm Receive',
      'Have you received this order successfully?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, received',
          onPress: async () => {
            try {
              
              const completedRef = doc(collection(db, 'completed')); // 
                await setDoc(completedRef, {
                  ...order,
                  status: 'Completed',
                  completedAt: new Date(),
                });

              await deleteDoc(doc(db, 'toReceive', order.docId));


              Alert.alert('Success', 'Your order has been marked as completed.');
            } catch (err) {
              console.error('Error moving order to completed:', err);
              Alert.alert('Error', 'Failed to complete the order.');
            }
          },
        },
      ]
    );
  };

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
        contentContainerStyle={{ paddingHorizontal: 20 }}
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

      {/* Orders */}
      <ScrollView>
        {orders.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#555' }}>
            No "To Receive" orders found.
          </Text>
        ) : (
          orders.map((order) => {
            const item = order.items && order.items.length > 0 ? order.items[0] : null;
            if (!item) return null;

            const size = randomSizes[Math.floor(Math.random() * randomSizes.length)];
            const productName = item.productName || 'Product';
            const imageUri = item.image || item.productImage || 'https://placehold.co/100x100';

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderStatus}>To Receive</Text>
                </View>

                <View style={styles.productRow}>
                  <Image source={{ uri: imageUri }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{productName}</Text>
                    <Text style={styles.productSize}>{size}</Text>
                    <Text style={styles.productQty}>Qty: {item.quantity || 1}</Text>
                    <View style={styles.totalRow}>
                      <Text style={styles.productTotal}>Total Payment:</Text>
                      <Text style={[styles.totalPrice, { marginLeft: 90 }]}>
                        ₱{order.total ?? 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.shippingRow}>
                  <Text style={styles.waitingMessage}>
                    Waiting for you to confirm{'\n'}receipt of order
                  </Text>
                  <TouchableOpacity style={styles.shippingBtn} onPress={() => handleReceiveOrder(order)}>
                    <Text style={styles.shippingBtnText}>Mark as Received</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.orderIdRow}>
                  <Text style={styles.orderIdText}>Order ID: {order.id}</Text>
                  <TouchableOpacity onPress={() => handleCopy(order.id)}>
                    <Feather name="copy" size={18} color="#9747FF" />
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
    marginRight: 40,
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
