import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { NotificationProvider } from './components/notificationcontent';

// Screens
import Login from './screens/LogIn';
import Signup from './screens/SignUp';
import SplashScreen from './screens/splashscreen';
import BodyMeasurements from './screens/BodyMeasurement';
import BodyTracking from './screens/BodyTracking';
import LandingPage from './screens/LandingPage';
import Profile from './screens/Profile';
import EditProfile from './screens/EditProfile';
import Notification from './screens/Notification';
import ShippingLocation from './screens/ShippingLocation';
import Password from './screens/Password';

//product details screens
import ProductDetail from './screens/Products/ProductDetail';

import Orders from './screens/Orders';
import ToShip from './screens/ToShip';
import Completed from './screens/Completed';
import Return from './screens/Return'; 
import Cancelled from './screens/Cancelled';
import TrackOrder from './screens/TrackOrder';     
              

const Stack = createStackNavigator();

export default function App() {

  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => 
    setIsShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);


  return (
    <NotificationProvider>
    <NavigationContainer> 
    {isShowSplash ? (
     <SplashScreen />
     ) : (

        <Stack.Navigator screenOptions={{ headerShown: false }}  initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="BodyMeasurement" component={BodyMeasurements} />
        <Stack.Screen name="BodyTracking" component={BodyTracking} />
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="Notification" component={Notification} />
        <Stack.Screen name="ShippingLocation" component={ShippingLocation} />
        <Stack.Screen name="Password" component={Password} />
        <Stack.Screen name="ProductDetail" component={ProductDetail} />
        <Stack.Screen name="Orders" component={Orders} />
        <Stack.Screen name="ToShip" component={ToShip} />
        <Stack.Screen name="Completed" component={Completed} />
        <Stack.Screen name="Return" component={Return} />
        <Stack.Screen name="Cancelled" component={Cancelled} />
        <Stack.Screen name="TrackOrder" component={TrackOrder} />
      </Stack.Navigator> 
      )}
    </NavigationContainer>
    </NotificationProvider>
  );
}
