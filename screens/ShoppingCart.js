import React, {useContext} from "react";
import { CartContext } from "../content/shoppingcartcontent";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, Text, View } from "react-native";
import { ScrollView } from "react-native";


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

//icons
import { FontAwesome } from '@expo/vector-icons';



export default function ShoppingCart () {
   const {cartItems, toggleSelected, increaseQuantity, decreaseQuantity, removeFromCart} = useContext(CartContext);
   const navigation = useNavigation();

    const totalPrice = cartItems
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

return (
     <CartContainer>
     <Header>
     <BackBtn onPress={() => navigation.navigate('LandingPage')}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </BackBtn>

           <View style={{ flex: 1, alignItems: 'center' }}>
          <ShoppingCartTitle> Shopping Cart ({cartItems.length}) </ShoppingCartTitle>
          </View>

        <View style={{ width: 24 }} />
        </Header>

          <ScrollView contentContainerStyle={{ paddingBottom: 150}}>
          {cartItems.length === 0 ? (
            <CartEmpty> Your cart is Empty. </CartEmpty>
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
  onPress={() => removeFromCart(item.id, item.color)}
  style={{ position: 'absolute', top: 10, right: 10 }}
>
  <FontAwesome name="trash" size={20} color='#000000' />
</TouchableOpacity>

  <ItemImage source={{ uri: item.image || 'https://via.placeholder.com/70' }} />

  <ItemInfo>
    <ItemName>{item.name}</ItemName>
    <Text style={{ fontSize: 12, color: 'black', paddingBottom: 10, paddingTop: 0, }}>Color: {item.color} </Text>

    <ItemFooter>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color:'#9747FF' }}>₱{item.price}</Text>

      <QuantityControl>
        <QtyButton onPress ={() => decreaseQuantity(item.id, item.color)} >
          <Text style={{ fontSize: 18 }}>−</Text>
        </QtyButton>
        <ItemQty>{item.quantity}</ItemQty>
        <QtyButton onPress={() => increaseQuantity(item.id, item.color)}>
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
                        <TotalPrice> Total: ₱{totalPrice}</TotalPrice>

                        <CheckoutBtn onPress={() => {
                            const selectedItems = cartItems.filter(item => item.selected);
                            const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                            navigation.navigate('Checkout', { selectedItems, total });
                        }}>
                        <CheckoutText> CHECKOUT </CheckoutText>
                        </CheckoutBtn>
                </CartFooter>
                )}
            </CartContainer>
);
}