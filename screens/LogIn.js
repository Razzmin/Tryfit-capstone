import React from "react";
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Popup from '../components/Popup'; 

//firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";  


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
import { LinearGradient } from "expo-linear-gradient";

//colors
const {black} = Colors;


const Login = () => {
    const navigation = useNavigation();
    const [hidePassword,setHidePassword] = useState(true);

    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');


   const handleLogin = async (values) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            values.email,
            values.password
        );
        const user = userCredential.user;

        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User Firestore data:", userData);
        } else {
            console.log("No Firestore data found for this user.");
            Alert.alert("Note", "Logged in, but user data not found.");
        }


        navigation.navigate("LandingPage"); //keep as it is


        } catch (error) {
        console.log("Login error:", error);

         let message = '';

            switch (error.code) {
                case 'auth/user-not-found':
                message = 'No user found with that email.';
                break;
                case 'auth/wrong-password':
                message = 'Incorrect password.';
                break;
                case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
                case 'auth/network-request-failed':
                message = 'Network error. Please check your connection.';
                break;
                case 'auth/invalid-credential': 
                message = 'Invalid email or password.';
                break;
                default:
                message = 'Login failed. Please try again.';
            }
            setPopupMessage(message);
            setPopupVisible(true);
    }
};

    return(
       <LinearGradient colors={['hsl(266, 100%, 78%)', 'hsl(0, 0%, 100%)']} style={{ flex: 1 }}>
        <StyledContainer>
        <StatusBar style="dark"/>
            <InnerContainer>
                <PageLogo source={require('./../assets/adaptive-icon.png')} />
               <PageTitle> Welcome!</PageTitle>
               <SubTitle>Account Login</SubTitle>

               <Formik
                initialValues={{email:'', password:''}}
                onSubmit={handleLogin}
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

         <Popup
                visible={popupVisible}
                message={popupMessage}
                onClose={() => setPopupVisible(false)}/>
</LinearGradient>
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
