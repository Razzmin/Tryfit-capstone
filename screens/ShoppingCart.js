import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, Text, View, ScrollView, Alert } from "react-native";
import {
  BackBtn,
  CartContainer,
  CartEmpty,
  CartItem,
  CheckoutBtn,
  CheckoutText,
  Header,
  ItemImage,
  ItemName,
  ShoppingCartTitle,
  TotalPrice,
  ItemFooter,
  ItemInfo,
  QuantityControl,
  QtyButton,
  ItemQty,
  CartFooter,
} from '../components/styles';
import { FontAwesome } from '@expo/vector-icons';
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

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }
    const q = query(collection(db, 'cartItems'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setCartItems(items);
      },
      (error) => {
        console.error('Error fetching cart items:', error);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const toggleSelected = async (id, color) => {
    try {
      const item = cartItems.find(i => i.id === id && i.color === color);
      if (!item) return;
      const docRef = doc(db, 'cartItems', id);
      await updateDoc(docRef, { selected: !item.selected });
    } catch (err) {
      Alert.alert('Error', 'Failed to update selection.');
      console.error(err);
    }
  };

  const getAvailableStock = async (productId, color) => {
    try {
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const data = productSnap.data();
        if (data.stock && data.stock[color]) {
          return Object.values(data.stock[color]).reduce((a, b) => a + b, 0);
        }
        return 0;
      }
    } catch (err) {
      console.error("Error fetching stock:", err);
    }
    return 0;
  };

  const increaseQuantity = async (id, color, productId) => {
    try {
      const item = cartItems.find(i => i.id === id && i.color === color);
      if (!item) return;

      const stock = await getAvailableStock(productId, color);

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

  const decreaseQuantity = async (id, color) => {
    try {
      const item = cartItems.find(i => i.id === id && i.color === color);
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
    <CartContainer>
      <Header>
        <BackBtn onPress={() => navigation.navigate('LandingPage')}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </BackBtn>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <ShoppingCartTitle>
            Shopping Cart ({cartItems.length})
          </ShoppingCartTitle>
        </View>
        <View style={{ width: 24 }} />
      </Header>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        {cartItems.length === 0 ? (
          <CartEmpty>Your cart is Empty.</CartEmpty>
        ) : (
          cartItems.map(item => (
            <CartItem key={item.id + item.color}>
              <TouchableOpacity
                onPress={() => toggleSelected(item.id, item.color)}
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
                style={{ position: 'absolute', top: 10, right: 10 }}
              >
                <FontAwesome name="trash" size={20} color='#000000' />
              </TouchableOpacity>

              <ItemImage source={{ uri: item.productImage || 'https://via.placeholder.com/70' }} />
              <ItemInfo>
                <ItemName>{item.productName}</ItemName>
                <Text style={{ fontSize: 12, color: 'black', paddingBottom: 10 }}>
                  Color: {item.color}
                </Text>
                <ItemFooter>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color:'#9747FF' }}>
                    ₱{item.price}
                  </Text>
                  <QuantityControl>
                    <QtyButton disabled={item.quantity <= 1} onPress={() => decreaseQuantity(item.id, item.color)}>
                      <Text style={{ fontSize: 18, opacity: item.quantity <= 1 ? 0.3 : 1 }}>−</Text>
                    </QtyButton>
                    <ItemQty>{item.quantity}</ItemQty>
                    <QtyButton onPress={() => increaseQuantity(item.id, item.color, item.productId)}>
                      <Text style={{ fontSize: 18 }}>＋</Text>
                    </QtyButton>
                  </QuantityControl>
                </ItemFooter>
              </ItemInfo>
            </CartItem>
          ))
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <CartFooter>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <TotalPrice>Selected Items: {totalSelectedQuantity}</TotalPrice>
          </View> 
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
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
    </CartContainer>
  );
}
