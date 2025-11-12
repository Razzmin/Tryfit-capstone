import { useState, useEffect } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { TouchableOpacity, Text, View, ScrollView, Alert } from "react-native";
import Swipeable from 'react-native-gesture-handler/Swipeable';

import {
  CartEmpty,
  CartItem,
  CheckoutBtn,
  CheckoutText,
  Header,
  ItemImage,
  ItemName,
  TotalPrice,
  ItemFooter,
  ItemInfo,
  QuantityControl,
  QtyButton,
  ItemQty,
  CartFooter,
  ProductContainer,
  ItemSize,
} from '../components/styles';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc, 
} from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

export default function ShoppingCart() {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();


  useEffect(() => {
    if (isFocused) {
      global.activeTab = 'ShoppingCart';
    }
  }, [isFocused]);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    const fetchCartItems = async () => {
      try {
        // Get custom userId
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          console.warn("User data not found in Firestore.");
          setCartItems([]);
          setLoading(false);
          return;
        }

        const customUserId = userDocSnap.data().userId;

        if (!customUserId) {
          console.warn("Custom userId missing in user data.");
          setCartItems([]);
          setLoading(false);
          return;
        }

        const q = query(collection(db, 'cartItems'), where('userId', '==', customUserId));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const items = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              selected: doc.data().selected || false,
              quantity: doc.data().quantity || 1,
            }));
            setCartItems(items);
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching cart items:', error);
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (err) {
        console.error('Error fetching custom userId:', err);
        setLoading(false);
      }
    };

    const unsubscribePromise = fetchCartItems();

    return () => {
      unsubscribePromise && unsubscribePromise instanceof Function && unsubscribePromise();
    };
  }, [user]);


  const toggleSelected = async (id, color) => {
    try {
      const item = cartItems.find(i => i.id === id);
      if (!item) return;
      const docRef = doc(db, 'cartItems', id);
      await updateDoc(docRef, { selected: !item.selected });
    } catch (err) {
      Alert.alert('Error', 'Failed to update selection.');
      console.error(err);
    }
  };

  const getAvailableStock = async (productId, size) => {
    try {
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const data = productSnap.data(); 
        
        if (data.stock && data.stock[size] != null) {
          return data.stock[size];
        }

        return 0;
      }
    } catch (err) {
      console.error("Error fetching stock:", err);
    }

    return 0;
  };


  const increaseQuantity = async (id, size, productId) => {
    try {
      const item = cartItems.find(i => i.id === id);
      if (!item) return;

      const stock = await getAvailableStock(productId, size);

      if (item.quantity >= 20) {
        Alert.alert("Limit reached", "You can only add up to 20 units of this item.");
        return;
      }
      if (item.quantity >= stock) {
        Alert.alert("Out of stock", "You have reached the maximum available stock.");
        return;
      }

      const docRef = doc(db, "cartItems", id);
      await updateDoc(docRef, { quantity: item.quantity + 1 });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to increase quantity.");
    }
  };

  const decreaseQuantity = async (id, size) => {
    try {
      const item = cartItems.find(i => i.id === id);
      if (!item || item.quantity <= 1) return;
      const docRef = doc(db, "cartItems", id);
      await updateDoc(docRef, { quantity: item.quantity - 1 });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to decrease quantity.");
    }
  };

  const removeFromCart = async (id) => {
    try {
      await deleteDoc(doc(db, 'cartItems', id));
    } catch (err) {
      Alert.alert('Error', 'Failed to remove item.');
      console.error(err);
    }
  };

  const confirmRemoveFromCart = (id) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(id) },
      ]
    );
  };

  const selectedItems = cartItems.filter(item => item.selected === true);

  const totalSelectedQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0); 
  const finalTotal = totalPrice;

  return (
    <ProductContainer style={{ flex: 1}}>
                <Header style = {{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 16,
                  paddingBottom: 10,
                  backgroundColor: '#fff',
                  borderBottomWidth: 1,
                  borderBottomColor: '#ddd',
                }}>
                  <TouchableOpacity onPress={() => navigation.goBack()}
                  style={{position: 'absolute', left: 16, top: -4}}>
                    <Feather name="arrow-left" size={27} color="black"  />
                  </TouchableOpacity>
    
                   <Text style= {{ fontSize: 15, color: '#000', fontFamily:"KronaOne", textTransform: 'uppercase', alignContent: 'center'}}>Shopping Cart</Text>
                </Header>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
      {loading ? (
        <Text style={{textAlign: 'center', marginTop: 30}}>Loading your cart..</Text>
      ) : cartItems.length === 0 ? (
          <CartEmpty>Your cart is Empty.</CartEmpty>
        ) : (
          cartItems.map(item => (
            <Swipeable
            key={item.id + item.size}
            overshootRight = {false}
            friction={2}
            rightThreshold={40}
            renderRightActions={()  => (
              <View style={{
                height: '90%',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 16,
                overflow: 'hidden',
              }}
              >
              <TouchableOpacity onPress={() => confirmRemoveFromCart(item.id)}
              style={{
                backgroundColor:'#ff5c5c',
                justifyContent: 'center',
                alignItems: 'center',
                width: 80,
                height: '95%',
                borderRadius: 16,
                alignSelf: 'center',
              }}>
                <Feather name="trash" size={26} color="#fff">
                </Feather>
              </TouchableOpacity>
              </View>
            )}
            >
              <CartItem>
              <TouchableOpacity
                onPress={() => toggleSelected(item.id)}
                style={{ marginRight: 10, marginTop: 5 }}
              >
                <FontAwesome
                  name={item.selected ? "check-square" : "square-o"}
                  size={24}
                  color={item.selected ? "#9747FF" : "#999"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmRemoveFromCart(item.id)}
                style={{ position: 'absolute', top: 10, right: 10 }}>
              </TouchableOpacity>

              
              <ItemImage source={{ uri: item.imageUrl || 'https://via.placeholder.com/70' }} />


              <ItemInfo>
                <ItemName>{item.productName}</ItemName>
                <ItemSize>Size: {item.size}</ItemSize>   

                <ItemFooter>
                  <Text style={{ fontSize: 17, fontWeight: 'bold', color:'#9747FF' }}>
                    ₱{item.price}
                  </Text>


                  <QuantityControl>
                    <QtyButton 
                    disabled={item.quantity <= 1} 
                    onPress={() => decreaseQuantity(item.id, item.size)}
                    >
                      <Text style={{fontSize: 20, opacity: item.quantity <= 1 ? 0.3 : 1 }}>−</Text>
                    </QtyButton>

                    <ItemQty>  {item.quantity}  </ItemQty>

                    <QtyButton 
                    disabled={item.quantity >= item.stock} 
                    onPress={() => increaseQuantity(item.id, item.size, item.productId)}> 
                      <Text style={{ fontSize: 18  }}>＋</Text>
                    </QtyButton>
                  </QuantityControl>
                </ItemFooter>
             </ItemInfo>
            </CartItem>
            </Swipeable>
          ))
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <CartFooter>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <TotalPrice>Selected Items: {totalSelectedQuantity}</TotalPrice>
            <TotalPrice>Total: ₱{finalTotal}</TotalPrice>
          </View>
          <View style={{ alignItems: 'center' }}>
            <CheckoutBtn
              style={{ width: '100%' }}
              onPress={async () => {
                const selectedItems = cartItems.filter(item => item.selected === true);

                const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                const deliveryFee = selectedItems.length > 0 ? 50 : 0;
                const finalTotal = subtotal; 

                if (selectedItems.length === 0) {
                  Alert.alert('No items selected', 'Please select items to checkout.');
                  return;
                }

                try {
                  if (!user) {
                    Alert.alert('Error', 'You must be logged in.');
                    return;
                  }

                  // ✅ Fetch shippingLocation of this user
                  const userDocRef = doc(db, "users", user.uid);
                  const userDocSnap = await getDoc(userDocRef);

                  if (!userDocSnap.exists()) {
                    Alert.alert("Error", "User profile not found.");
                    return;
                  }

                  const customUserId = userDocSnap.data().userId;

                  const q = query(
                    collection(db, "shippingLocations"),
                    where("userId", "==", customUserId)
                  );
                  const snapshot = await getDocs(q);

                  let shippingLocation = null;
                  if (!snapshot.empty) {
                    shippingLocation = snapshot.docs
                      .map(doc => ({ id: doc.id, ...doc.data() }))
                      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)[0];
                  } 
                  
                  // ✅ Pass shippingLocation to Checkout screen
                  navigation.navigate("Checkout", {
                    selectedItems,
                    subtotal,
                    deliveryFee,
                    total: finalTotal,
                    shippingLocation,
                  });
                } catch (error) {
                  console.error("Checkout error:", error);
                  Alert.alert("Error", "Failed to complete checkout.");
                }
              }}

            >
              <CheckoutText>CHECKOUT</CheckoutText>
            </CheckoutBtn>
          </View>
        </CartFooter>
      )}
    </ProductContainer>
  );
}
