import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from "../components/gradientbackground";

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
                initialValues={{name: '', email:'', password:''}}
                onSubmit={(values)=> {
                console.log(values);
                }} 
                >
                {({handleChange,handleBlur,handleSubmit, values}) => (
                <SignupFormArea>
                      <UserTextInput
                        label="Username"
                         icon="person"
                        placeholder="ex. Kween LengLeng   "
                        placeholderTextColor={gray}
                        onChangeText={handleChange('username')}
                        onBlur={handleBlur('username')}
                        value={values.name}
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
                    />
                    <SignInButton onPress={handleSubmit}>
                    <SignInButtonText>SIGN UP</SignInButtonText>
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