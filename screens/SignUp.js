import React, {useRef, useEffect } from 'react';
import { useIsFocused, useNavigation  } from '@react-navigation/native';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Popup from '../components/Popup'; 
import { LinearGradient } from 'expo-linear-gradient';


//Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

//formik for forms
import { Formik } from "formik";

//icons
import {Ionicons, Octicons, FontAwesome  } from '@expo/vector-icons';

//content structure
import {
    CreateAccountTitle,
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
    InnerContainer,

} from "./../components/styles";

import { useState } from 'react';


//colors
const colors = {
  bg: "#382a47",
  purple: "#9747FF",
  main: "#1f1926",
  text: "#bba1d4",
  white: "#EDEDED",
};

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
    // Firebase Signup Function
const handleSignup = async (values, { setFieldValue }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password
    );
    const user = userCredential.user;

    // ✅ Generate a Firestore-style custom userId
    const userId = doc(collection(db, "tmp")).id;

    // ✅ Save user data to Firestore with userId included
    await setDoc(doc(db, "users", user.uid), {
      username: values.username,
      email: values.email,
      userId,
      createdAt: serverTimestamp()
    });

    navigation.navigate("BodyMeasurement");
  } catch (error) {
    console.log("Firebase Error:", error);
    let message = "";

    switch (error.code) {
      case "auth/email-already-in-use":
        message = "This email is already in use.";
        setFieldValue("email", "");
        break;
      case "auth/invalid-email":
        message = "The email address is not valid.";
        setFieldValue("email", "");
        break;
      case "auth/weak-password":
        message = "Password should be at least 6 characters.";
        setFieldValue("password", "");
        break;
      case "auth/network-request-failed":
        message = "Network error. Please check your internet.";
        break;
      default:
        message = "Something went wrong. Please try again.";
    }

    setPopupMessage(message);
    setPopupVisible(true);
    formikRef.current?.resetForm();
  }
};

  return (
       <LinearGradient colors={['hsl(266, 100%, 79%)', 'hsl(0, 0%, 100%)']}style={{ flex: 1 }}>
      <View style= {styles.container}>
            <StatusBar style="dark"/>
            <View style={styles.inner}>
            <TouchableOpacity style={styles.header} onPress={() => navigation.goBack()}>
                       <FontAwesome name="arrow-left" size={16} color= "#1f1926" />
                       <Text style={styles.title}> Create your account</Text>
                     </TouchableOpacity>
                      <View style={{ width: 24 }} />

              <Text style={styles.subtitle}>Personal Details</Text>

                <Formik
                innerRef={formikRef}
                initialValues={{username: '', email:'', password:''}}
                onSubmit={handleSignup}
                >
                {({handleChange,handleBlur,handleSubmit, values}) => (

                <View style={styles.formArea}>
                  <Text style = {styles.label}> Username: </Text>
                        <View style= {styles.inputWrapper}>
                        <Octicons name = "person" size={24} style={styles.leftIcon} />
                        <TextInput
                        label="Username"
                        placeholder=""
                        style ={styles.inputArea}
                        onChangeText={handleChange('username')}
                        onBlur={handleBlur('username')}
                        value={values.username}
                        keyboardType="username"
                        autoCompleteType="off"
                        autoCapitalize="none"
                        autoCorrect={false}
                        importantForAutofill="no" 
                    />
                    </View>

                      <Text style = {styles.label}> Email Address: </Text>
                      <View style= {styles.inputWrapper}>
                      <Octicons name = "mail" size={24} style={styles.leftIcon} />
                        <TextInput
                        label="Email Address"
                        placeholder=""
                        style ={styles.inputArea}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        value={values.email}
                        keyboardType="email-address"
                        autoCompleteType="off"
                        autoCapitalize="none"
                        autoCorrect={false}
                        importantForAutofill="no"  
                    />
                    </View>

                  <Text style = {styles.label}> Password: </Text>
                    <View style= {styles.inputWrapper}>
                    <FontAwesome name = "lock" size={24} style={styles.leftIcon}/>
                        <TextInput
                        label="Password"
                        placeholder=""
                        style ={styles.inputArea}
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
                     </View>
                    <SignInButton 
                      onPress={handleSubmit}
                      disabled={!values.username || !values.email || !values.password}
                      style={{
                        opacity: !values.username || !values.email || !values.password ? 0.5 : 1 }} >
                      <SignInButtonText>Next</SignInButtonText>
                    </SignInButton>

                    <SignUpBottomTextWrapper>
                        <LogInPlainText>Already have an account?</LogInPlainText>
                        <LogInButton onPress={() => navigation.navigate('Login')}>
                        <LogInLinkText> Log In</LogInLinkText>
                        </LogInButton>
                    </SignUpBottomTextWrapper>
               </View>
                )}
                 </Formik>
               </View>  
        </View>


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
function UserTextInput ({label, icon,isPassword, hidePassword, setHidePassword ,...props}) {
    return(
        <View style={{width: '100%', marginBottom: 20 }}>
        <SignUpLeftIcon>
            <Octicons name={icon} size={27} color= "#1f1926" />
        </SignUpLeftIcon>
        <SignUpStyleInputLabel>{label}</SignUpStyleInputLabel>
        <SignUpTextInput {...props} />
        {isPassword && (
        <SignUpRightIcon onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={30} color= "#1f1926"/>
        </SignUpRightIcon>
        )}
        </View>
    )
}
export default Signup; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 15,
    paddingTop: 70,
    fontFamily: 'System',
  },
  inner: {
    maxWidth: 330,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 17,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.main,
    marginLeft: 5,
    fontFamily: "KronaOne",
  },
  subtitle: {
    fontSize: 19,
    marginTop: 50,
    marginBottom: 3,
    fontWeight:'600',
    color: colors.main,
    textAlign: "left",
    padding: 20,
    fontFamily: "KronaOne",
  },
  formArea: {
    width: "100%",
    paddingHorizontal: 15,
    marginTop: 5,
  },
  inputWrapper: {
    position: "relative",
    marginBottom: 20,
  },
  leftIcon: {
    position: "absolute",
    left: 15,
    top: 20,
    color: colors.bg,
    zIndex: 1,
  },
  rightIcon: {
     position: "absolute",
    left: 15,
    top: 15,
    color: colors.bg,
    zIndex: 1,
  },
  inputArea: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.bg,
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingLeft: 45,
    borderRadius: 10,
    fontSize: 16,
    height: 55,
    color: colors.bg,
    marginVertical: 6,
    marginBottom: 5,
    color: colors.bg,
    width: "100%",
  },
  label: {
    color: colors.bg,
    fontSize: 16,
    textAlign: "left",
    marginBottom: 5,
  },  
  button: {
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
  }
  
});