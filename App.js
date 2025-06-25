import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {useState} from "react";


// Screens
import Login from './screens/LogIn';
import Signup from './screens/SignUp';
import SplashScreen from './screens/splashscreen';

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
      </Stack.Navigator> 
      )}
    </NavigationContainer>
  );
}
