import React from "react";
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from "../components/gradientbackground";

//formik for forms
import { Formik } from "formik";

//icons
import {Octicons, Ionicons} from '@expo/vector-icons';

import { View } from "react-native";
import {
    StyledContainer,
    InnerContainer,
    PageLogo,
    PageTitle,
    SubTitle,
    StyledFormArea,
    StyledTextInput,
    StyleInputLabel,
    LeftIcon,
    RightIcon,
    Colors,
    StyledButton,
    ButtonText,
    BottomTextWrapper,
    PlainText,
    LinkText,
    SignUpButton,
} from "./../components/styles";
import { useState } from 'react';

//colors
const {black} = Colors;


const Login = () => {
    const navigation = useNavigation();
    const [hidePassword,setHidePassword] = useState(true);
    return(
        <GradientBackground>
        <StyledContainer>
        <StatusBar style="dark"/>
            <InnerContainer>
                <PageLogo source={require('./../assets/adaptive-icon.png')} />
               <PageTitle> Welcome!</PageTitle>
               <SubTitle>Account Login</SubTitle>

               <Formik
                initialValues={{email:'', password:''}}
                onSubmit={(values)=> {
                console.log(values);
                }} 
                >
                {({handleChange,handleBlur,handleSubmit, values}) => (

                <StyledFormArea>
                    <MyTextInput
                        label="Email Address"
                        icon="mail"
                        placeholder="   "
                        placeholderTextColor={black}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        value={values.email}
                        keyboardType="email-address"
                    />
                    <MyTextInput
                        label="Password"
                        icon="lock"
                        placeholder="    "
                        placeholderTextColor={black}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                        secureTextEntry={hidePassword}
                         isPassword={true}
                        hidePassword={hidePassword}
                        setHidePassword={setHidePassword}
                    />
                    
                    <StyledButton onPress={handleSubmit}>
                        <ButtonText>LOGIN</ButtonText>
                    </StyledButton> 
                    <BottomTextWrapper>
                    <PlainText>Don't have an account? </PlainText>
                    <SignUpButton onPress={() => navigation.navigate('Signup')}>
                    <LinkText>Sign up</LinkText>
                    </SignUpButton>
                    </BottomTextWrapper>
                </StyledFormArea> 
                )}
               </Formik>
            </InnerContainer>
        </StyledContainer>
        </GradientBackground>
    );
}

const MyTextInput = ({label, icon,isPassword, hidePassword, setHidePassword ,...props}) => {
    return(
        <View style={{width: '100%', marginBottom: 20 }}>
        <LeftIcon>
            <Octicons name={icon} size={30} color={black} />
        </LeftIcon>
        <StyleInputLabel>{label}</StyleInputLabel>
        <StyledTextInput {...props} />
        {isPassword && (
        <RightIcon onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={30} color={black}/>
        </RightIcon>
        )}
        </View>
    )
}
export default Login;
