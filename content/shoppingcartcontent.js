import React, {createContext, useState} from "react";


export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

        const addToCart = (product, color, quantity = 1) => {
            const itemIndex = cartItems.findIndex(
                item => item.id === product.id && item.color === color
            );
        
        if (itemIndex !== -1) {
            const updatedCart = [...cartItems];
            updatedCart[itemIndex].quantity += quantity;
            setCartItems(updatedCart);
            console.log("Cart Items:", cartItems);
        } else {
            const newItem = {
                id: product.id,
                name: product.name,
                price: parseInt(product.price.replace(/[^0-9]/g, "")),
                color,
                quantity: typeof quantity === 'number' ? quantity : parseInt(quantity) || 1,
                image: product.image,
                selected: false,
            };
            setCartItems(prev => [...prev, newItem]);
        }
    };

    const toggleSelected = ( id, color) => {
        const updatedCart = cartItems.map(item =>
            item.id === id && item.color === color
            ? {...item, selected: !item.selected}
            : item
        );
        setCartItems(updatedCart);
    };
    
    const increaseQuantity = (id, color) => {
  const updatedCart = cartItems.map(item =>
      item.id === id && item.color === color
        ? { ...item, quantity: item.quantity + 1 }
        : item
  );
  setCartItems(updatedCart);
  console.log("Increasing quantity for", id, color);
};

const decreaseQuantity = (id, color) => {
  const updatedCart = cartItems.map(item =>
      item.id === id && item.color === color
        ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
        : item
  );
  setCartItems(updatedCart);
};

const removeFromCart = (id, color) => {
  setCartItems(prev => prev.filter(item => !(item.id === id && item.color === color)));
};

    return(
        <CartContext.Provider value = {{ cartItems, addToCart, toggleSelected, increaseQuantity, decreaseQuantity, removeFromCart}}>
            {children}
        </CartContext.Provider>
    );
};