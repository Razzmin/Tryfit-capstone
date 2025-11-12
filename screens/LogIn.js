import React from "react";
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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

import { View, 
    KeyboardAvoidingView,
    ScrollView,
     TouchableWithoutFeedback,
    Keyboard,
    ImageBackground,
    ActivityIndicator,
    Text,
    BackHandler,
  } from "react-native";

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
    LoadingOverlay,
} from "./../components/styles";
import { useState, useCallback } from 'react';


//colors
const {black, main, gray } = Colors;


const Login = () => {
    const navigation = useNavigation();
    const [hidePassword,setHidePassword] = useState(true);

    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [loading, setLoading] = useState(false);


   const handleLogin = async (values) => {
    try {
        setLoading(true);

        const email = values.email.trim();
        const password = values.password.trim();

        
        if (!email || !password) {
            setPopupMessage("Please fill in all fields");
            setPopupVisible(true);
            setLoading(false);
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setPopupMessage("Please enter a valid email address");
            setPopupVisible(true);
            return;
        }
        if (password.length < 6) {
        setPopupMessage("Password must be at least 6 characters long");
        setPopupVisible(true);
        return;
}
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
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

            } finally {
                setLoading(false);
            }
            };

         useFocusEffect(
            useCallback(() => {
                const onBackPress = () => {
                // Disable going back from login screen
                return true; // prevents default behavior
                };

                const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

                return () => subscription.remove();
            }, [])
            );

    return(
    <ImageBackground
    source={require('../assets/bg.png')}
    style={{ flex: 1}}
    resizeMode="cover">

     <KeyboardAvoidingView
     behavior = "height" style= {{ flex: 1 }}
     >
     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

     <ScrollView
        contentContainerStyle={{ flexGrow: 1}}
        keyboardShouldPersistTaps="handled">

        <StyledContainer>
        <StatusBar style="dark"/>
            <InnerContainer>
                <PageLogo source={require('./../assets/adaptive-icon.png')} />
               <PageTitle> Welcome,</PageTitle>
               <SubTitle>Account Login</SubTitle>

               <Formik
                initialValues={{email:'', password:''}}
                onSubmit={handleLogin}
                >
                {({handleChange,handleBlur,handleSubmit, values}) => (

                <StyledFormArea>
                    <MyTextInput
                        label="Email Address:"
                        icon="mail"
                        placeholder="Enter email"
                        placeholderTextColor={gray}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        value={values.email}
                        keyboardType="email-address"
                    />
                    <MyTextInput
                        label="Password:"
                        icon="lock"
                        placeholder="Enter Password"
                        placeholderTextColor={gray}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                        secureTextEntry={hidePassword}
                         isPassword={true}
                        hidePassword={hidePassword}
                        setHidePassword={setHidePassword}
                    />
                    
                    <StyledButton onPress={handleSubmit}>
                        <ButtonText>Login</ButtonText>
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
       </ScrollView>
        </TouchableWithoutFeedback>
 </KeyboardAvoidingView>
         <Popup
                visible={popupVisible}
                message={popupMessage}
                onClose={() => setPopupVisible(false)}
                />
                
                {loading && (
                    <LoadingOverlay>
                        <ActivityIndicator size="large" color="#9747FF"/>
                        <Text style={{marginTop: 10}}>Logging in...</Text>
                    </LoadingOverlay>
                )}
</ImageBackground>
    );
}; 

const MyTextInput = ({label, icon,isPassword, hidePassword, setHidePassword ,...props}) => {
    const [isFocused, setIsFocused] = useState(false);
    return(
        <View style={{width: '100%', marginBottom: 20 }}>
        <LeftIcon>
            <Octicons name={icon} size={27} color={main} />
        </LeftIcon>
        <StyleInputLabel>{label}</StyleInputLabel>

           <StyledTextInput 
        {...props}
        isFocused={isFocused}
        onFocus={(e) => { 
            setIsFocused(true); 
        if(props.onFocus) props.onFocus(e);
        }}
        onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
        }}
         />
        {isPassword && (
        <RightIcon onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons name={hidePassword ? 'eye-off-outline' : 'eye-outline'} size={30} color={black}/>
        </RightIcon>
        )}
        </View>
    );
};
export default Login;

