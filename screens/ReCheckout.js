import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import  {SafeAreaView} from 'react-native-safe-area-context';
import {
  Header,
  ProductContainer,
} from '../components/styles';
//icons
import { Entypo, MaterialIcons, Feather } from '@expo/vector-icons';

//animation
import LottieView from 'lottie-react-native';

// firebase
import {
  getAuth,
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
  serverTimestamp,
} from "firebase/firestore";

export default function ReCheckout({ route, navigation }) {
  const { completedID, cancelledID } = route.params || {};
  const orderID = completedID || cancelledID;
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shippingLocation, setShippingLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [total, setTotal] = useState(0);
  const [orderDetails, setOrderDetails] = useState(null);



  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        let orderData = null;

        if (completedID) {
          const q = query(
            collection(db, "completed"),
            where("completedID", "==", completedID)
          );
          const querySnap = await getDocs(q);
          if (!querySnap.empty) orderData = querySnap.docs[0].data();
        } else if (cancelledID) {
          const q = query(
            collection(db, "cancelled"),
            where("cancelledID", "==", cancelledID)
          );
          const querySnap = await getDocs(q);
          if (!querySnap.empty) orderData = querySnap.docs[0].data();
        }

        if (orderData) {
          setOrderDetails(orderData); // ✅ store the full document
          setCheckoutItems(orderData.items || []);
          setTotal(orderData.total || 0);
          setShippingLocation(orderData.shippingLocation || null);
        } else {
          console.warn("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      }
    };

    fetchOrder();
  }, [completedID, cancelledID]);




  useEffect(() => {
  // fetch shipping location
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


  const handleDelete = (productId) => {
    setCheckoutItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };


  return (
  <ProductContainer style={{ flex: 1}}>
        <Header style = {{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
          paddingBottom: 10,
          backgroundColor: '#fff',
        }}>

          <TouchableOpacity onPress={() => navigation.goBack()}
          style={{position: 'absolute', left: 16, top: -4}}>
            <Feather name="arrow-left" size={27} color="black"  />
          </TouchableOpacity>

            <Text style= {{ fontSize: 15, color: '#000', fontFamily:"KronaOne", textTransform: 'uppercase', alignContent: 'center'}}>BUY AGAIN</Text>
        </Header>

       <SafeAreaView style = {styles.container}> 

      <View style = {{ flex: 1, marginTop: -10}}>
      <FlatList
        data={checkoutItems}
        keyExtractor={(item) => item.productId || item.id}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1,
            justifyContent:
            checkoutItems.length > 2 ? 'flex-start' : 'space-between',
            paddingBottom: 180}}
        
            renderItem={({ item }) => ( 
                <View style={styles.itemContainer}>
                <Image
                  source={{ uri: item.imageUrl || 'https://placehold.co/100x100' }}
                  style={[styles.productImage, { resizeMode: 'contain' }]}
                />

  
          <View style={styles.itemInfo}>
        <View style={styles.itemTopRow}>
          <Text style={styles.itemName}>{item.productName}</Text>
          <TouchableOpacity onPress={() => handleDelete(item.productId)}>
        <Text style={styles.deleteButton}>✕</Text>
        </TouchableOpacity>
        </View>

        <Text style={styles.itemSize}>Size: {item.size}</Text>

    <View style={styles.itemBottomRow}>
      <Text style={styles.itemPrice}>₱{item.price}</Text>
      <Text style={styles.ItemQuantity}> ×{item.quantity}</Text>
    </View> 
  </View>  
   </View>
 )}
 ListFooterComponent={
  <View style = {styles.footerContainer}>
  <TouchableOpacity style = {styles.addressSection} onPress={() => navigation.navigate('ShippingLocation')} >
    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
    <Entypo name="location-pin" size={24} color="black" />
    <Text style ={styles.sectionTitle}>Shipping Address</Text>
    </View>
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
  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
  <MaterialIcons name="delivery-dining" size={24} color="black" />
  <Text style={styles.sectionTitle}> Delivery Method</Text>
  
    </View>
  <Text style ={styles.sectionText}>LOCAL STANDARD SHIPPING: ₱58</Text>
  <Text style ={styles.deliveryNote}>Order placed now are expected to be 
  delivered within 2-3 days</Text>
  </View>
    </View>
 }
  />
   </View>
    <View style = {styles.bottomBar}>
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 2,
    }}>
    <View style={{flexDirection: 'column'}}>
  <Text style={styles.total}>SubTotal: ₱{total - 58}</Text>
 <Text style={styles.total}>Shipping Fee: ₱58</Text>
 <Text style={styles.totalAfter}>Total: ₱{total}</Text>
 </View>
      </View>
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

                          const orderId = `OD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                          const orderData = {
                            orderId,
                            userId: uniqueUserId,
                            name: shippingLocation?.name || "No Name",
                            address: shippingLocation
                              ? `${shippingLocation.house || "No House"}, ${shippingLocation.fullAddress || "No Address"}`
                              : "No Address",
                              productID: orderDetails?.productID || null,   
                              delivery: orderDetails?.delivery || "Standard Shipping", 
                            deliveryFee: 58,
                            total,
                            createdAt: serverTimestamp(),
                            status: "Pending",
                            items: checkoutItems.map(item => ({
                              imageUrl: item.imageUrl || "",
                              productId: item.productId || "",
                              productName: item.productName || "",
                              quantity: item.quantity || 1,
                              price: item.price || 0,
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
 </ProductContainer>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 14,
    marginBottom: 15,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: 'hidden',
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#ccc',
    resizeMode: 'contain',
  },

  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 20,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',

  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    alignItems: 'baseline',
    gap: 10,

  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    flexShrink: 1,
    flex: 1,
  },
  itemSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
    marginLef: 2,
  },
  deleteButton: {
    fontSize: 20,
    color: '#000000ff',
    paddingHorizontal: 1,
  },
  itemPrice: {
    fontSize: 18,
    color: '#9747FF',
    marginTop: 15,
  },
  ItemQuantity: {
    fontSize: 15,
    color: '#555',
  },
  addressSection: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  deliverySection: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: -10,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "KronaOne",
    marginBottom: 1,
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  sectionText: {
    fontSize: 14,
    marginBottom: 2,
    paddingRight: 10,
    marginLeft: 20,
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
    marginLeft: 20,
  },
  total: {
    fontSize: 14,
    marginTop: 10,
    marginLeft: 5,
    fontWeight: '600'
  },
  totalAfter: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 5,
    marginBottom: 20,
    marginTop: 10,
    color:  '#9747FF',
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
     fontSize: 15,
    fontFamily: "KronaOne",
     textAlign: 'center',

  },
  bottomBar: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  paddingHorizontal: 20,
  paddingBottom: 25,
  elevation: 10,
  shadowRadius: 10,
  borderRadius: 20,
},
popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
     alignItems: 'center',
  },
  popupBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 45,
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
    padding: 16,
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
    width: 170,
    height: 170,
    marginBottom: 20,
  },
  animationContainer: {
    flex: 1,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
  }
  
});