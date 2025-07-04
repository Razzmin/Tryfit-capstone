import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';



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

const Stack = createStackNavigator();

export default function App() {

  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => 
    setIsShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);


  return (
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
      </Stack.Navigator> 
      )}
    </NavigationContainer>
  );
}
