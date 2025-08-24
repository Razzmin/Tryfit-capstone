import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CartProvider } from './content/shoppingcartcontent';
import { NotificationProvider } from './content/notificationcontent';
import { useFonts, KronaOne_400Regular } from '@expo-google-fonts/krona-one';


// Screens
import Login from './screens/LogIn';
import Signup from './screens/SignUp';
import SplashScreen from './screens/SplashScreen';
import BodyMeasurements from './screens/BodyMeasurement';
import BodyTracking from './screens/BodyTracking';
import LandingPage from './screens/LandingPage';
import Profile from './screens/Profile';
import EditProfile from './screens/EditProfile';
import EditBodyMeasurement from './screens/EditBodyMeasurement';
import Notification from './screens/Notification';
import ShippingLocation from './screens/ShippingLocation';
import Password from './screens/Password';
import Checkout from './screens/Checkout';
import ShoppingCart from './screens/ShoppingCart';
import CategoryProductsScreen from './screens/CategoryProductsScreen'; 
import ProductDetail from './screens/Products/ProductDetail';
import ChatSupportScreen from './screens/ChatSupportScreen';
import SearchResults from './screens/SearchResults';
import CheckoutSummary from './screens/CheckoutSummary';

import Orders from './screens/Orders';
import ToShip from './screens/ToShip';
import Completed from './screens/Completed';
import Cancelled from './screens/Cancelled';
import TrackOrder from './screens/TrackOrder';     

              

const Stack = createStackNavigator();

export default function App() {

  const [isShowSplash, setIsShowSplash] = useState(true);

  const [fontsLoaded] = useFonts({
    KronaOne: KronaOne_400Regular,
  });

  useEffect(() => {
    const timer = setTimeout(() => 
    setIsShowSplash(false), 4000);
    return () => clearTimeout(timer);
  }, []);

 if (!fontsLoaded) {
    return  <SplashScreen />;
  }

  if (fontsLoaded) {
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.style = { fontFamily: "KronaOne" };
}

  return (
    <CartProvider>
    <NotificationProvider>
    <NavigationContainer> 
    {isShowSplash ? (
     <SplashScreen />
     ) : (

        <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="BodyMeasurement" component={BodyMeasurements} />
        <Stack.Screen name="BodyTracking" component={BodyTracking} />
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="EditBodyMeasurement" component={EditBodyMeasurement} />
        <Stack.Screen name="Notification" component={Notification} />
        <Stack.Screen name="ShippingLocation" component={ShippingLocation} />
        <Stack.Screen name="Password" component={Password} />
        <Stack.Screen name="ProductDetail" component={ProductDetail} />
        <Stack.Screen name="Orders" component={Orders} />
        <Stack.Screen name="ToShip" component={ToShip} />
        <Stack.Screen name="Completed" component={Completed} />
        <Stack.Screen name="Cancelled" component={Cancelled} />
        <Stack.Screen name="TrackOrder" component={TrackOrder} />
        <Stack.Screen name="Checkout" component={Checkout} />
        <Stack.Screen name="ShoppingCart" component={ShoppingCart} />
        <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
        <Stack.Screen name="ChatSupport" component={ChatSupportScreen} />
        <Stack.Screen name="SearchResults" component={SearchResults} />
        <Stack.Screen name="CheckoutSummary" component={CheckoutSummary} />
      </Stack.Navigator> 
      )}
    </NavigationContainer>
    </NotificationProvider>
    </CartProvider>
  );
}
