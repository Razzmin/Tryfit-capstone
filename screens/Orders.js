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
import { SafeAreaView } from 'react-native-safe-area-context';
import{ Header } from '../components/styles';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc, 
  updateDoc,
  deleteDoc, 
  addDoc
} from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

export default function Orders() {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const activeTab = 'Orders';

  const [orders, setOrders] = useState([]);
  const [customUserId, setCustomUserId] = useState(null);

  const isFocused = useIsFocused();


  useEffect(() => {
    if (isFocused) {
      global.activeTab = 'Orders';
    }
  }, [isFocused]);

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

 const handleCancelOrder = async (order) => {
  Alert.alert(
    "Cancel Order",
    "Are you sure you want to cancel this order?",
    [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            // ✅ Step 1: Create cancelled order object
            const cancelledOrder = {
              cancelledID: `CN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              address: order.address || "",
              createdAt: order.createdAt || new Date(),
              deliveryFee: order.deliveryFee || 0,
              items: order.items.map((item) => ({
                productId: item.productId || "",
                productName: item.productName || "",
                imageUrl: item.imageUrl || "", // ✅ fixed: get from item
                quantity: item.quantity || 0,
                size: item.size || "-",
                price: item.price || 0,
                status: "Cancelled",
              })),
              productID: order.productID || "",
              name: order.name || "",
              orderId: order.orderId || "",
              status: "Cancelled",
              total: order.total || 0,
              userId: order.userId || "",
              cancelledAt: new Date(),
            };

            // ✅ Step 2: Save cancelled order in Firestore
            const cancelledRef = doc(collection(db, "cancelled"));
            await setDoc(cancelledRef, cancelledOrder);

            // ✅ Step 3: Restore stock per item
            for (const item of order.items) {
              const productRef = doc(db, "products", item.productId);
              const productSnap = await getDoc(productRef);
              if (!productSnap.exists()) continue;

              const productData = productSnap.data();
              const updatedStock = {
                ...productData.stock,
                [item.size]: (productData.stock?.[item.size] || 0) + item.quantity,
              };
              const totalStock = Object.values(updatedStock).reduce(
                (sum, val) => sum + val,
                0
              );

              await updateDoc(productRef, {
                stock: updatedStock,
                totalStock,
              });
            }

            // ✅ Step 4: Delete original order
            const orderRef = doc(db, "orders", order.id);
            await deleteDoc(orderRef);

            // ✅ Step 5: Add notification
            await addDoc(collection(db, "notifications"), {
              notifID: `NTC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              userId: order.userId || "",
              title: "Order Cancelled",
              message: `Your order (${order.orderId || "N/A"}) has been cancelled.`,
              orderId: order.orderId || "",
              timestamp: new Date(),
              read: false,
            });

            // ✅ Success
            Alert.alert("Success", "Your order has been cancelled successfully.");
          } catch (err) {
            console.error("Error cancelling order:", err);
            Alert.alert("Error", "Failed to cancel your order. Please try again.");
          }
        },
      },
    ]
  );
};

  const handleCopy = (orderId) => {
    Clipboard.setStringAsync(orderId);
    Alert.alert('Copied', 'Order ID copied to clipboard');
  };

  const tabRoutes = {
      
      'Orders': 'Orders',
      'To Ship': 'ToShip',
      'To Receive': 'ToReceive',
      'Completed': 'Completed',
      'Cancelled': 'Cancelled',
    };
  

  return (
    <SafeAreaView
     style={styles.container}>
       <Header style = {{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 16,
                  paddingBottom: 20,
                  backgroundColor: '#fff',
                }}>
                  <TouchableOpacity onPress={() => navigation.goBack()}
                  style={{position: 'absolute', left: 2, top: -4}}>
                    <Feather name="arrow-left" size={27} color="black"  />
                  </TouchableOpacity>
    
                   <Text style= {{ fontSize: 15, color: '#000', fontFamily:"KronaOne", textTransform: 'uppercase', alignContent: 'center'}}>MY PURCHASES</Text>
                </Header>

      {/* Nav Tabs */}
      <ScrollView
      contentContainerStyle={{ flexGrow: 1, alignItems: 'stretch', paddingBottom: 20}}
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
      <ScrollView style={{marginTop: 10}}>
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
                    source={{ uri: item.imageUrl || 'https://placehold.co/100x100' }}
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
                  </View>
                </View>

                {/* Address */}
                <Text style={{ fontSize: 13, color: '#555', marginTop: 5, fontWeight: '500' }}>
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
                
               

               {/* Cancel Order Button */}
                {order.status !== 'Cancelled' && (
                 <TouchableOpacity
                    style={[styles.actionButton, { borderColor: "red", marginBottom: 15 }]}
                    onPress={() => handleCancelOrder(order)}
                  >
                    <Text style={[styles.actionButtonText, { color: "red" }]}>
                      Cancel Order
                    </Text>
                  </TouchableOpacity>

                )}

                  <View style={styles.orderIdRow}>
                    <Text style={styles.orderIdText}>Order ID: {order.id}</Text>
                    <TouchableOpacity onPress={() => handleCopy(order.id)}
                    style={{ marginRight: 5}}>
                      <Feather name="copy" size={18} color="#9747FF" />
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

const styles = StyleSheet.create({
  // ✅ keep your styles here (no changes made)
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30, 
    paddingHorizontal: 20
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 0,
    
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
    fontWeight: 'bold',
  },
  underline: {
    height: 3,
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 1,
  },
  activeUnderline: {
    backgroundColor: '#9747FF',
  },
  orderCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 16,
    marginBottom: 30,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  orderStatus: {
    fontWeight: 'bold',
    color: '#9747FF',
    fontSize: 14,
    textTransform: 'uppercase',
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
    marginBottom: 7,
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
    marginBottom: 1,
  },
  totalLabel: {
    fontWeight: '500',
  },
  totalPrice: {
    fontWeight: '700',
    color: '#9747FF',
    marginRight: 10,
    fontSize: 15,
  },
  actionButton: {
    backgroundColor: '#F7F7F7',
    paddingVertical: 10,
    borderRadius: 10,
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
