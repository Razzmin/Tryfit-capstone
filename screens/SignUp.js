import React, {useRef, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from "../components/gradientbackground";
import Popup from '../components/Popup'; 



//Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

//formik for forms
import { Formik } from "formik";

//icons
import {Octicons, Ionicons} from '@expo/vector-icons';

//content structure
import {
    CreateAccountTitle,
    SignupContainer,
    SignupInnerContainer,
    BackArrowWrapper,
    BackArrowtIcon,
    BackText,
    Colors,
    SignUpStyleInputLabel,
    SignupFormArea,
    SignUpTextInput,
    SignInButton,
    SignInButtonText,
    SignUpRightIcon,
    PersonalDetailsSubtitle,
    SignUpBottomTextWrapper,
    LogInButton,
    LogInLinkText,
    LogInPlainText,
} from "./../components/styles";
import { useState } from 'react';

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
            username: values.username,  // or values.username depending on your key
            email: values.email,
            createdAt: new Date()
            });

        setPopupMessage("Account created successfully!");
        setPopupVisible(true);

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
        }
    };
  return (
    <GradientBackground>
     <SignupContainer>
            <StatusBar style="dark"/>
            <SignupInnerContainer>
            <View style={{ width: '100%', alignItems: 'flex-start' }}>
                <BackArrowWrapper onPress={() => navigation.navigate('Login')}>
                <BackArrowtIcon>
                    <Ionicons name="arrow-back" size={24} color="black" /> 
                    <BackText>Back</BackText>
                </BackArrowtIcon>  
                </BackArrowWrapper> 
                </View>
                <CreateAccountTitle> Create your account </CreateAccountTitle>
                <PersonalDetailsSubtitle> Personal Details</PersonalDetailsSubtitle>
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
                    onPress={handleSubmit} >
                    <SignInButtonText>Next</SignInButtonText>
                    </SignInButton>
                    <SignUpBottomTextWrapper>
                        <LogInPlainText>Already have an account?</LogInPlainText>
                        <LogInButton onPress={() => navigation.navigate('Login')}>
                        <LogInLinkText> Log In</LogInLinkText>
                        </LogInButton>
                    </SignUpBottomTextWrapper>
                </SignupFormArea>
                )}
                 </Formik>
                </SignupInnerContainer>
    </SignupContainer>

                <Popup
        visible={popupVisible}
        message={popupMessage}
        onClose={() => {
          setPopupVisible(false);
          if (popupMessage === "Account created successfully!") {
            navigation.navigate("Login");
          }
        }}
      />
    </GradientBackground>
    )
}
const UserTextInput = ({label, icon,isPassword, hidePassword, setHidePassword ,...props}) => {
    return(
        <View style={{width: '100%', marginBottom: 20 }}>

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