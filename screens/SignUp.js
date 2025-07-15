import React, {useRef, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Popup from '../components/Popup'; 
import { LinearGradient } from 'expo-linear-gradient';


//Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

//formik for forms
import { Formik } from "formik";

//icons
import {Ionicons} from '@expo/vector-icons';
import {Octicons} from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

//content structure
import {
    CreateAccountTitle,
    SignupContainer,
    Colors,
    SignUpStyleInputLabel,
    SignupFormArea,
    SignUpTextInput,
    SignInButton,
    SignInButtonText,
    SignUpRightIcon,
    SignUpBottomTextWrapper,
    LogInButton,
    LogInLinkText,
    LogInPlainText,
    SignHeader,
    SignBackBtn,
    SignTitle,
    SignUpLeftIcon,

} from "./../components/styles";

import { useState } from 'react';
import { Header } from '@react-navigation/stack';

//colors
const {black} = Colors;
const {gray} = Colors;

const Signup = () => {
    const navigation = useNavigation();
    const [hidePassword,setHidePassword] = useState(true);
    const isFocused = useIsFocused();
    const formikRef = useRef();

    useEffect(() => {
    if (isFocused && formikRef.current) {
      formikRef.current.resetForm();
    }
  }, [isFocused]);

     //popup state
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');


    
     // Firebase Signup Function
    const handleSignup = async (values, {setFieldValue }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(
            auth,
            values.email,
            values.password
            );
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
            username: values.username, 
            email: values.email,
            createdAt: new Date()
            });
          
            navigation.navigate("BodyMeasurement");
            } catch (error) {
                console.log("Firebase Error:", error);
               let message = '';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already in use.';
        setFieldValue('email', '');
        break;
      case 'auth/invalid-email':
        message = 'The email address is not valid.';
        setFieldValue('email', '');
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters.';
        setFieldValue('password', '');
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet.';
        break;
      default:
        message = 'Something went wrong. Please try again.';
    }
    setPopupMessage(message);
    setPopupVisible(true);
    formikRef.current?.resetForm();
        }
    };
  return (
     <LinearGradient colors={['hsl(266, 100%, 78%)', 'hsl(0, 0%, 100%)']} style={{ flex: 1 }}>
     <SignupContainer>
            <StatusBar style="dark"/>
            <SignHeader>
              <SignBackBtn onPress={() => navigation.navigate('Login')}>
                        <FontAwesome name="arrow-left" size={24} color="#000" />
                      </SignBackBtn>
                         <View style={{ flex: 1, alignItems: 'center' }}>
                        <SignTitle> Create your account </SignTitle>
                        </View>
              
                      <View style={{ width: 24 }} />
                      </SignHeader>
            
                <CreateAccountTitle> Personal Details </CreateAccountTitle>

                <Formik
                innerRef={formikRef}
                initialValues={{username: '', email:'', password:''}}
                onSubmit={handleSignup}
                >
                {({handleChange,handleBlur,handleSubmit, values}) => (
                <SignupFormArea>
                      <UserTextInput
                        label="Username"
                        icon="person"
                        placeholder="ex. Kween LengLeng"
                        placeholderTextColor={gray}
                        onChangeText={handleChange('username')}
                        onBlur={handleBlur('username')}
                        value={values.username}
                        keyboardType="username"
                        autoCompleteType="off"
                        autoCapitalize="none"
                        autoCorrect={false}
                        importantForAutofill="no" 
                    />
                     <UserTextInput
                        label="Email Address"
                        icon="mail"
                        placeholder="ex. lenglenggandamoh@vvko.com"
                        placeholderTextColor={gray}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        value={values.email}
                        keyboardType="email-address"
                        autoCompleteType="off"
                        autoCapitalize="none"
                        autoCorrect={false}
                        importantForAutofill="no"  
                    />
                    <UserTextInput
                        label="Password"
                         icon="lock"
                        placeholder="    "
                        placeholderTextColor={gray}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                        secureTextEntry={hidePassword}
                        isPassword={true}
                        hidePassword={hidePassword}
                        setHidePassword={setHidePassword}
                        autoCompleteType="off"
                        autoCapitalize="none"
                        autoCorrect={false}
                        importantForAutofill="no"  
                    />
                    <SignInButton 
                   onPress={() => navigation.navigate('BodyMeasurement')}>
                    <SignInButtonText>Next</SignInButtonText>
                    </SignInButton>
                    <SignUpBottomTextWrapper>
                        <LogInPlainText>Already have an account?</LogInPlainText>
                        <LogInButton onPress={() => navigation.navigate('BodyMeasurement')}>
                        <LogInLinkText> Log In</LogInLinkText>
                        </LogInButton>
                    </SignUpBottomTextWrapper>
                </SignupFormArea>
                )}
                 </Formik>
    </SignupContainer>

                <Popup
        visible={popupVisible}
        message={popupMessage}
        onClose={() => {
          setPopupVisible(false);
          if (popupMessage === "Account created successfully!") {
            navigation.navigate("BodyMeasurement");
          }
        }}
      />
    </LinearGradient>
    )
}
const UserTextInput = ({label, icon,isPassword, hidePassword, setHidePassword ,...props}) => {
    return(
        <View style={{width: '100%', marginBottom: 20 }}>
        <SignUpLeftIcon>
            <Octicons name={icon} size={27} color={black} />
        </SignUpLeftIcon>
        <SignUpStyleInputLabel>{label}</SignUpStyleInputLabel>
        <SignUpTextInput {...props} />
        {isPassword && (
        <SignUpRightIcon onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={30} color={black}/>
        </SignUpRightIcon>
        )}
        </View>
    )
}
export default Signup; 