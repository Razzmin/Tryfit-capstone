import React, { useState, useEffect } from 'react';
import { View,
   Text, 
   FlatList, 
   StyleSheet, 
   Image, 
   TouchableOpacity,
   SafeAreaView,
   Modal,
  } from 'react-native';

//icons
import { FontAwesome } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';

//animation
import LottieView from 'lottie-react-native';

// firebase
import { 
  getAuth 
} from "firebase/auth";
import { 
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  getDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";


export default function Checkout({ route, navigation }) {
  const { selectedItems: initialItems = [], total = 0 } = route.params || {};
  const [checkoutItems, setCheckoutItems] = useState(initialItems);
  const [showPopup, setShowPopup] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shippingLocation, setShippingLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

useEffect(() => {
  const fetchShippingLocation = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get custom userId from users collection
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) return;

      const customUserId = userSnap.data().userId;

      // Query shippingLocations using customUserId
      const q = query(
        collection(db, "shippingLocations"),
        where("userId", "==", customUserId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setShippingLocation(null);
        return;
      }

      const shippingLoc = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort(
          (a, b) =>
            (b.createdAt?.toDate?.().getTime?.() || 0) -
            (a.createdAt?.toDate?.().getTime?.() || 0)
        )[0];

      setShippingLocation(shippingLoc || null);

      console.log("Fetched shipping location:", shippingLoc);

    } catch (error) {
      console.error("Error fetching shipping location:", error);
    }
  };

  fetchShippingLocation();
}, []);


  const handleDelete = (itemId) => {
   setCheckoutItems(prevItems => 
    prevItems.filter(item => item.productId !== itemId)
  );
  };

  return (
   <SafeAreaView style = {styles.container}> 
   
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('ShoppingCart')}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style = {{ flex: 1}}>
      <FlatList
        data={checkoutItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1,
            justifyContent:
            checkoutItems.length > 2 ? 'flex-start' : 'space-between',
            paddingBottom: 150,}}
        
      renderItem={({ item }) => ( 
          <View style={styles.itemContainer}>
          <Image
         source={{ uri: item.productImage }} 
         style={styles.itemImage} 
        resizeMode="cover" 
        />
  
      <View style={styles.itemInfo}>
     <View style={styles.itemTopRow}>
      <Text style={styles.itemName}>{item.productName}</Text>
      <TouchableOpacity onPress={() => handleDelete(item.productId)}>
        <Text style={styles.deleteButton}>✕</Text>
        </TouchableOpacity>
        </View>

    <View style={styles.itemBottomRow}>
      <Text style={styles.itemPrice}>₱{item.price}</Text>
      <Text style={styles.ItemQuantity}> ×{item.quantity}</Text>
    </View> 
  </View>  
   </View>
 )}
 ListFooterComponent={
  <View style = {styles.footerContainer}>
   <Text style={styles.total}>Total: ₱{total}</Text>

  <TouchableOpacity style = {styles.addressSection} onPress={() => navigation.navigate('ShippingLocation')} >
    <Text style ={styles.sectionTitle}>Shipping Address</Text>
  <View 
  style={{ flexDirection: 'row', 
  justifyContent: 'space-between',
  alignItems: 'center' }}>  
  <View>
    {shippingLocation ? (
        <>
          <Text style={styles.sectionText}>
            {shippingLocation.name} ({shippingLocation.phone})
          </Text>
          <Text style={styles.sectionText}>{shippingLocation.house}</Text>
          <Text style={styles.sectionText}>{shippingLocation.fullAddress}</Text>
        </>
      ) : (
        <>
          <Text style={styles.sectionText}>No shipping address saved.</Text>
          <Text style={styles.sectionText}>Tap here to add one.</Text>
        </>
      )}

  </View>
  <Entypo name="chevron-right" size={29} color="black" 
    style={{ alignSelf: 'flex-start', marginBottom: 40 }} />
</View>
</TouchableOpacity>

  <View style = {styles.deliverySection}> 
  <Text style={styles.sectionTitle}> Delivery Method</Text>
  <Text style ={styles.sectionText}>LOCAL STANDARD SHIPPING: ₱58</Text>
  <Text style ={styles.deliveryNote}>Order placed now are expected to be 
  delivered within 2-3 days</Text>
  </View>
    </View>
 }
  />
   </View>
<View style = {styles.bottomBar}>
<Text style={styles.totalAfter}>Total: ₱{total + 58}</Text>
 <TouchableOpacity style={styles.button} onPress={() => setShowPopup(true)} >
    <Text style= {styles.buttonText}> PROCEED</Text>
    </TouchableOpacity>

    <Modal visible={showPopup} transparent animationType="fade">
          {orderPlaced ? (
          <View style ={styles.animationContainer}>

          <LottieView source={require('./../assets/animations/success.json')}
          autoPlay loop={false}
          style={styles.animationStyle}
          onAnimationFinish={() => {
          setShowPopup(false);
          setOrderPlaced(false);
          navigation.navigate('CheckoutSummary', {
            total: total + 58,
          });
                }}
                />
                <Text style = {styles.popupText}>Order placed successfully!</Text>
                </View>
               ) : ( 
                  <View style = {styles.popupOverlay}>
                  <View style = {styles.popupBox}>
                  <Text style={styles.popupText}>You’re about to place your order. Proceed to checkout?</Text>
                  <View style={styles.popupButtons}> 
                    <TouchableOpacity
                      style={styles.popupButtonYes}
                      onPress={async () => {
                        if (isSubmitting) return;
                        setIsSubmitting(true);
                        try {
                          const user = auth.currentUser;
                          if (!user) return;

                          const userDocRef = doc(db, "users", user.uid);
                          const userSnap = await getDoc(userDocRef);
                          if (!userSnap.exists()) return;

                          const uniqueUserId = userSnap.data().userId;

                          // Calculate subtotal
                          const subtotal = checkoutItems.reduce(
                            (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
                            0
                          );

                          // Add delivery fee
                          const total = subtotal + 58;


                          const orderData = {
                            userId: uniqueUserId,
                            address: shippingLocation
                              ? `${shippingLocation.house}, ${shippingLocation.fullAddress}`
                              : null,
                            deliveryFee: 58,
                            total,  
                            createdAt: serverTimestamp(),
                            status: "Pending",
                            items: checkoutItems.map(item => ({
                              id: item.id,
                              productId: item.productId,
                              productName: item.productName,
                              quantity: item.quantity,
                              price: item.price, 
                              size: item.size || "-",
                            })),
                          };

                       // Save order and get a reference back
                          const orderRef = await addDoc(collection(db, "orders"), orderData);

                          // Save notification
                          await addDoc(collection(db, "notifications"), {
                            userId: uniqueUserId,
                            title: "Order Placed",
                            message: `Your order with total ₱${total} has been placed.`,
                            orderId: orderRef.id, // ✅ now works
                            timestamp: serverTimestamp(),
                            read: false,
                          });


                          for (const item of checkoutItems) {
                            const productRef = doc(db, "products", item.productId);
                            const productSnap = await getDoc(productRef);

                            if (productSnap.exists()) {
                              const productData = productSnap.data();
                              const currentStock = productData.stock || {};
                              const currentQty = productData.stock?.[item.size] || 0;
                              const newQty = Math.max(currentQty - item.quantity, 0);

                              await setDoc(
                                productRef,
                                {
                                  stock: {
                                    ...currentStock,
                                    [item.size]: newQty,
                                  },
                                },
                                { merge: true }
                              );
                            }
                          }

                          // delete ordered items from cart
                          const cartSnap = await getDocs(
                            query(collection(db, "cartItems"), where("userId", "==", user.uid))
                          );
                          const deletePromises = cartSnap.docs.map(async (docSnap) => {
                            const isOrdered = checkoutItems.some(item => item.id === docSnap.id);
                            if (isOrdered) await deleteDoc(docSnap.ref);
                          });
                          await Promise.all(deletePromises);

                          setOrderPlaced(true);
                        } catch (err) {
                          console.error("Error saving order:", err);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}  >
                      <Text style={{ color: "#fff", fontSize: 15 }}>Yes, proceed</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.popupButtonNo}
                      onPress={() => setShowPopup(false)}
                    >
                      <Text style={{ color: '#fff' , fontSize: 15, }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
              </View>
              </View>
               )}
            </Modal>
 </View>
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
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
  itemContainer: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: '#EDEDED',
    overflow: 'hidden',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    alignItems: 'baseline',
    gap: 10,

  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    flex: 1,
  },
  deleteButton: {
    fontSize: 15,
    color: '#000000ff',
    paddingHorizontal: 1,
  },
  itemPrice: {
    fontSize: 17,
    color: '#9747FF',
    marginTop: 15,
  },
  ItemQuantity: {
    fontSize: 15,
    color: '#555',
  },
  addressSection: {
    paddingVertical: 10,
  },
  deliverySection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    marginBottom: 2,
    paddingRight: 10,
  },
  deliveryRow: {
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryNote: {
    fontSize: 12,
    color: '#000000ff',
    marginTop: 4,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'right',
  },
  totalAfter: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 20,
    marginTop: 10,
  },
  footerContainer: {
  backgroundColor: '#fff',
  paddingTop: 10,
  paddingBottom: 10,
},
  button: {
    backgroundColor: '#9747FF',
    paddingVertical: 19,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '95%',
    alignSelf: 'center',
    marginBottom: 25,
  },
  buttonText: {
    color: 'white',
     fontSize: 16,
     fontWeight: 'bold',
     textAlign: 'center',
  },
  bottomBar: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  paddingHorizontal: 20,
  paddingTop: 10,
  paddingBottom: 25,
  borderTopWidth: 1,
  borderColor: '#ddd',
},
popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
     alignItems: 'center',
  },
  popupBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.79)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '80%',
  },
  popupText: {
    fontSize: 17,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  popupButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '120%',
  },
  popupButtonYes: {
    backgroundColor: '#9747FF',
    padding: 14,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  popupButtonNo: {
    backgroundColor: '#A9A9A9',
    padding: 14,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  animationStyle: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  animationContainer: {
    flex: 1,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
  }
});