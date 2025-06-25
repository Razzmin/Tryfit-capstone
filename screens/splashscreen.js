import React from 'react';
import { View } from "react-native";
import GradientBackground from '../components/gradientbackground';


import Icon from "./../assets/icon.png";

import {
        SplashContainer,
        SplashImage,
    } from "./../components/styles";

export default function SplashScreen(){
    return (
    <GradientBackground>
    <SplashContainer>
    <SplashImage source={require('./../assets/icon.png')}  resizeMode="contain" />
    </SplashContainer>
    </GradientBackground>
  );
}
