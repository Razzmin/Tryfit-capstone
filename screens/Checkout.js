import { useState, useEffect } from 'react';
import { View,
   Text, 
   FlatList, 
   StyleSheet, 
   Image, 
   TouchableOpacity,
   Modal,
  } from 'react-native';
import {
  ProductContainer,
  Header,
} from '../components/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
//icons
import { Entypo, MaterialIcons, Feather } from '@expo/vector-icons';

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
import { useIsFocused } from '@react-navigation/native';


export default function Checkout({ route, navigation }) {
  const { selectedItems: initialItems = [], total = 0 } = route.params || {};
  const [checkoutItems, setCheckoutItems] = useState(initialItems);
  const [showPopup, setShowPopup] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shippingLocation, setShippingLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFocused = useIsFocused();
  const auth = getAuth();
  const db = getFirestore();

useEffect(() => {

  if(!isFocused) return; 

  const fetchShippingLocation = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get custom userId from users collection
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) return;

      const customUserId = userSnap.data().userId;

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
}, [isFocused]);


  const handleDelete = (itemId) => {
   setCheckoutItems(prevItems => 
    prevItems.filter(item => item.productId !== itemId)
  );
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
                         <Text style= {{ fontSize: 15, color: '#000', fontFamily:"KronaOne", textTransform: 'uppercase', alignContent: 'center'}}>CHECKOUT</Text>
                      </Header>

       <SafeAreaView style = {styles.container}> 

      <View style = {{ flex: 1, marginTop: -10}}>
      <FlatList
        data={checkoutItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1,
            justifyContent:
            checkoutItems.length > 2 ? 'flex-start' : 'space-between',
            paddingBottom: 180}}
        
      renderItem={({ item }) => ( 
          <View style={styles.itemContainer}>
         <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/70' }}
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
  <Text style={styles.total}>SubTotal: ₱{total}</Text>
 <Text style={styles.total}>Shipping Fee: ₱58</Text>
 <Text style={styles.totalAfter}>Total: ₱{total + 58}</Text>
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
    if (!user) {
      alert("You must be logged in to place an order.");
      setIsSubmitting(false);
      return;
    }

    // 🔹 Get custom userId
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      alert("User not found in the database.");
      setIsSubmitting(false);
      return;
    }
    const customUserId = userSnap.data().userId;

    if (!shippingLocation) {
      alert("Please add a shipping address before placing an order.");
      setIsSubmitting(false);
      return;
    }

    const deliveryFee = 58;

    // 🔹 Group checkout items by productId + size
    const groupedItemsMap = new Map();
    checkoutItems.forEach((item) => {
      const key = `${item.productId}_${item.size}`;
      if (groupedItemsMap.has(key)) {
        const existing = groupedItemsMap.get(key);
        existing.quantity += item.quantity;
      } else {
        groupedItemsMap.set(key, { ...item });
      }
    });

    // 🔹 Loop through grouped items to create individual orders
    for (const groupedItem of groupedItemsMap.values()) {
      const subtotal = (groupedItem.price || 0) * (groupedItem.quantity || 1);
      const total = subtotal + deliveryFee;
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const orderData = {
        orderId,
        userId: customUserId,
        name: shippingLocation.name || "",
        address: `${shippingLocation.house || ""}, ${shippingLocation.fullAddress || ""}`,
        productID: groupedItem.productId || null,
        deliveryFee,
        total,
        delivery: groupedItem.delivery,
        createdAt: serverTimestamp(),
        status: "Pending",
        items: [
          {
            imageUrl: groupedItem.imageUrl || "",
            productId: groupedItem.productId || "",
            productName: groupedItem.productName || "",
            quantity: groupedItem.quantity || 1,
            price: groupedItem.price || 0,
            size: groupedItem.size || "-",
          },
        ],
      };

      if (!orderData.productID) {
        console.warn("⚠️ Skipping item with undefined productID:", groupedItem);
        continue;
      }

      // 🔹 Save order to Firestore
      await addDoc(collection(db, "orders"), orderData);

      // 🔹 Send notification
      await addDoc(collection(db, "notifications"), {
        notifID: `NCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: customUserId,
        title: "Order Placed",
        message: `Your order ${orderId} with total ₱${total.toLocaleString()} has been placed.`,
        orderId,
        timestamp: serverTimestamp(),
        read: false,
      });

      // 🔹 Update product stock
      const productRef = doc(db, "products", groupedItem.productId);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const productData = productSnap.data();
        const currentStock = productData.stock || {};
        const currentQty = currentStock[groupedItem.size] || 0;
        const newQty = Math.max(currentQty - groupedItem.quantity, 0);

        await setDoc(
          productRef,
          {
            stock: {
              ...currentStock,
              [groupedItem.size]: newQty,
            },
          },
          { merge: true }
        );
      }
    }

    // 🔹 Delete ordered items from user's cart
    const cartRef = collection(db, "cartItems");
    const cartSnap = await getDocs(query(cartRef, where("userId", "==", customUserId)));

    const deletePromises = cartSnap.docs.map(async (docSnap) => {
      const cartData = docSnap.data();
      const isOrdered = checkoutItems.some(
        (item) =>
          item.productId === cartData.productId && item.size === cartData.size
      );
      if (isOrdered) await deleteDoc(docSnap.ref);
    });

    await Promise.all(deletePromises);

                        setOrderPlaced(true);
                      } catch (err) {
                        console.error("Error saving order:", err);
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                  >
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