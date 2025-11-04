import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import{ Header } from '../components/styles';
import { useNavigation } from '@react-navigation/native';
import {  Feather } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

export default function Completed() {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const activeTab = 'Completed';
  const item = order.items && order.items.length > 0 ? order.items[0] : null;


  const [orders, setOrders] = useState([]);
  const [customUserId, setCustomUserId] = useState(null);

  // 🔑 Step 1: Fetch custom userId
  useEffect(() => {
    const fetchCustomUserId = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.userId) setCustomUserId(userData.userId);
        }
      } catch (err) {
        console.error('Error fetching custom userId:', err);
      }
    };
    fetchCustomUserId();
  }, [user]);

 
  useEffect(() => {
    if (!customUserId) return;

    const unsubscribe = onSnapshot(
      collection(db, 'completed'), // ✅ Fetch from "completed" collection
      (snapshot) => {
        const fetchedOrders = snapshot.docs
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
          .filter(order => order.userId === customUserId); // ✅ Only orders that match the custom userId

        // Optional: sort by creation date if available
        fetchedOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setOrders(fetchedOrders);
      },
      (error) => {
        console.error('Error fetching completed orders:', error);
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
      horizontal showsHorizontalScrollIndicator={false} 
      style={styles.tabContainer}>
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

      {/* Orders List */}
      <ScrollView style= {{marginBottom: 40}}>
        {orders.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#555' }}>
            No completed orders found.
          </Text>
        ) : (
          orders.map((order) => {
            const item = order.items && order.items.length > 0 ? order.items[0] : null;
            if (!item) return null;

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderStatus}>{order.status}</Text>
                  <Text style={styles.orderDate}>
                  {order.createdAt?.toDate().toLocaleString() || 'N/A'}
                  </Text>
                </View>

                <View style={styles.productRow}>
                  <Image
                    source={{ uri: item.imageUrl || 'https://placehold.co/100x100' }}
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.productName || item.name}</Text>
                    <Text style={styles.productSize}>Size: {item.size || '-'}</Text>
                    <Text style={styles.productQty}>Qty: {item.quantity || 1}</Text>
                  </View>
                </View>

                <Text style={{ fontSize: 12, color: '#555', marginTop: 5 }}>
                  Delivery Address: {order.address}
                </Text>

                <View style={styles.expectedDelivery}>
                  <Text style={styles.expectedText}>Delivery: {order.delivery || 'TBD'}</Text>
                </View>


                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Payment:</Text>
                  <Text style={styles.totalPrice}>₱{order.total || 0}</Text>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.secondaryButton, { marginRight: 10 }]}
                    onPress={() =>
                     navigation.navigate("ToRate", {
                      orderData: order,
                      items: order.items,
                      userId: order.userId
                      }) } >
                    <Text style={styles.secondaryButtonText}>Rate</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() =>
                      navigation.navigate("ReCheckout", {
                        productImage: item.productImage,
                        selectedItems: order.items,      
                        total: order.total,               
                        address: order.address,  
                        deliveryFee: order.deliveryFee, }) } >
                    <Text style={styles.actionButtonText}>Buy Again</Text>
                  </TouchableOpacity>


                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// re-use styles

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

  /* Fixed Nav Tabs */
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

  /* Cards */
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
     fontSize: 13,
    marginLeft: 1,
    textTransform: 'uppercase',
  },
   orderDate: {
    fontSize: 12,
    color: '#666',
  },
  deliveryDate: {
    fontSize: 13,
    color: '#9747FF',
    fontWeight: '500',
    letterSpacing: 1,
  },
  /* Product */
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
    marginBottom: 11,
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

  /* Totals */
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 10,
    marginRight: 50,

  },
  totalLabel: {
    fontWeight: '500',
    fontSize: 13,
  },
  totalPrice: {
    fontWeight: '700',
    color: '#9747FF',
    fontSize: 15,
     marginRight: 150,
  },

  /* Buttons */
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#9747FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
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
    paddingHorizontal: 30, 
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#9747FF',
    fontSize: 14,
    fontWeight: '500',
  },
  expectedDelivery: {
    marginTop: 10,
    marginBottom: 9,
  },
  expectedText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#444',
    marginBottom: 2,
  },
});
