import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import{ Header } from '../components/styles';
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
  addDoc,
} from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

const randomSizes = ['small', 'medium', 'large', 'xl', 'xxl'];

export default function ToShip() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const activeTab = 'To Ship';

  const [orders, setOrders] = useState([]);
  const [customUserId, setCustomUserId] = useState(null);

  // 1) resolve the customUserId from users collection
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

  // 2) listen to the "toShip" collection and only keep docs that belong to this customUserId
  useEffect(() => {
    if (!customUserId) {
      setOrders([]);
      return;
    }

    // ✅ Fetch from toShip instead of shipped
    const q = query(collection(db, 'toShip'), where('userId', '==', customUserId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() });
        });

        // sort by createdAt desc if present
        fetched.sort((a, b) => {
          if (a.createdAt && b.createdAt) return b.createdAt.seconds - a.createdAt.seconds;
          return 0;
        });

        setOrders(fetched);
      },
      (error) => {
        console.error('Error fetching toShip orders:', error);
        setOrders([]);
      }
    );  

    const handleCancelOrder = (orderId) => {
Alert.alert(
  'Confirm Cancellation?',
  'Are you sure you want to cancel this order?',
  [
    { text: 'No', style: 'cancel' },
    {
      text: 'Yes',
      onPress: async () => {
        try {
          await deleteDoc(doc(db, 'toShip', orderId));
          Alert.alert('Cancelled', 'Your order has been cancelled and removed.');
        } catch (err) {
          console.error('Error cancelling order:', err);
          Alert.alert('Error', 'Failed to cancel the order.');
        }
      },
      style: 'destructive',
    },
  ]
);
};

    return () => unsubscribe();
  }, [customUserId]);

  const handleCopy = (orderId) => {
    Clipboard.setStringAsync(orderId);
    Alert.alert('Copied', 'Order ID copied to clipboard');
  };

  const handleCancelOrder = (order) => {
    Alert.alert(
      'Confirm Cancellation?',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              // ✅ Step 1: Save order into "cancelled"
              await addDoc(collection(db, 'cancelled'), {
                ...order,
                status: 'Cancelled',
                cancelledAt: new Date(),
              });

              // ✅ Step 2: Remove it from "toShip"
              await deleteDoc(doc(db, 'toShip', order.id));

              Alert.alert('Cancelled', 'Your order has been moved to Cancelled.');
            } catch (err) {
              console.error('Error cancelling order:', err);
              Alert.alert('Error', 'Failed to cancel the order.');
            }
          },
          style: 'destructive',
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

    <SafeAreaView style={styles.container}>
      <Header style = {{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 16,
                      paddingBottom: 20,
                      backgroundColor: '#fff',
                    }}>
                      <TouchableOpacity onPress={() => navigation.goBack()}
                      style={{position: 'absolute', left: 10, top: -4}}>
                        <Feather name="arrow-left" size={27} color="black"  />
                      </TouchableOpacity>
        
                       <Text style= {{ fontSize: 15, color: '#000', fontFamily:"KronaOne", textTransform: 'uppercase', alignContent: 'center'}}>MY PURCHASES</Text>
                    </Header>

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

      {/* Content */}
      <ScrollView style={{marginTop: -30}}>
        {orders.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#555' }}>
            No "To Ship" orders found.
          </Text>
        ) : (
          orders.map((order) => {
            const item = order.items && order.items.length > 0 ? order.items[0] : null;
            if (!item) return null;

            const size = randomSizes[Math.floor(Math.random() * randomSizes.length)];
            const productName = item.productName || 'Product';
            const imageUri =
              item.image || item.productImage || 'https://placehold.co/100x100';

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderStatus}>{order.status}</Text>
                  <Text style={styles.orderDate}>
                  {order.createdAt?.toDate().toLocaleString() || 'N/A'}
                  </Text>
                </View>

                <View style={styles.productRow}>
                  <Image source={{ uri: imageUri }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{productName}</Text>
                    <Text style={styles.productSize}>Size: {size}</Text>
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
                    Waiting for courier to confirm{'\n'}shipment
                  </Text>
                  <TouchableOpacity style={styles.shippingBtn}>
                    <Text style={styles.shippingBtnText}>View Shipping Details</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.orderIdRow}>
                  <Text style={styles.orderIdText}>Order ID: {order.id}</Text>
                  <TouchableOpacity onPress={() => handleCopy(order.id)}>
                    <Feather name="copy" size={18} color="#9747FF" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.cancelBtn}
                  onPress={() => handleCancelOrder(order)} >
                  <Text style={styles.cancelBtnText}>Cancel Order</Text>
                </TouchableOpacity>


              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingHorizontal: 10,
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
    marginBottom: 10,
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
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderStatus: {
    fontWeight: 'bold',
    color: '#9747FF',
    textTransform: 'uppercase',
    fontSize: 13,
    marginLeft: 1,
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
    fontSize: 15,
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
    fontSize: 15,
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
  cancelBtn: {
    backgroundColor: '#F7F7F7',
    borderColor: '#9747FF',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#9747FF',
    fontSize: 14,
    fontWeight: '500',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
});
