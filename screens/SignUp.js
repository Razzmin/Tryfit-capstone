import React, { useRef, useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Popup from '../components/Popup';
import {
    KeyboardAvoidingView,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    ImageBackground,
} from "react-native";

// Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, setDoc, serverTimestamp, runTransaction } from "firebase/firestore";
import { db } from "../firebase/config";

// Formik for forms
import { Formik } from "formik";

// Icons
import { Ionicons, Octicons, FontAwesome } from '@expo/vector-icons';

// Custom styled components
import {
  CreateAccountTitle,
  SignUpStyleInputLabel,
  SignupFormArea,
  SignUpTextInput,
  SignInButton,
  SignInButtonText,
  SignUpBottomTextWrapper,
  LogInButton,
  LogInLinkText,
  LogInPlainText,
  SignHeader,
  SignBackBtn,
  SignTitle,
  SignUpLeftIcon,
  SignUpRightIcon,
  InnerContainer,
} from "./../components/styles";

// Colors
const colors = {
  bg: "#382a47",
  purple: "#9747FF",
  main: "#1f1926",
  text: "#bba1d4",
  white: "#EDEDED",
  gray: "#717171",
  whites: "#FFFFFF",
};

const Signup = () => {
  const navigation = useNavigation();
  const [hidePassword, setHidePassword] = useState(true);
  const isFocused = useIsFocused();
  const formikRef = useRef();

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [loading, setLoading] = useState(false); // <-- Added loading state

  // Reset form when returning to screen
  useEffect(() => {
    if (isFocused && formikRef.current) {
      formikRef.current.resetForm();
    }
  }, [isFocused]);

  // ✅ Firebase Signup Function
  const handleSignup = async (values, { setFieldValue }) => {
    setLoading(true); // <-- Start loading
    try {
      values.username = values.username.trim();
      values.email = values.email.trim();

      if (!values.username || values.username.length < 3) {
        setPopupMessage("Username must be at least 3 characters long");
        setPopupVisible(true);
        setLoading(false);
        return;
      }
      if (values.username.length > 50) {
        setPopupMessage("Username cannot exceed 50 characters");
        setPopupVisible(true);
        setLoading(false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!values.email || !emailRegex.test(values.email)) {
        setPopupMessage("Please enter a valid email address");
        setPopupVisible(true);
        setLoading(false);
        return;
      }
      if (values.email.length > 100) {
        setPopupMessage("Email cannot exceed 100 characters");
        setPopupVisible(true);
        setLoading(false);
        return;
      }
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
      if (!passwordRegex.test(values.password)) {
        setPopupMessage("Password must be at least 6 characters long and include at least 1 number and 1 special character");
        setPopupVisible(true);
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      const counterRef = doc(db, "counters", "userId");
      let userId;

      // Transaction to generate unique userId
      await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);

        let newId;
        if (!counterDoc.exists()) {
          transaction.set(counterRef, { lastId: 1 });
          newId = 1;
        } else {
          newId = counterDoc.data().lastId + 1;
          transaction.update(counterRef, { lastId: newId });
        }

        userId = `U${String(newId).padStart(9, "0")}`;
        if (userId.length > 10) {
          throw new Error("Generated userId exceeds max length of 10 characters!");
        }
      });

      await setDoc(doc(db, "users", user.uid), {
        username: values.username,
        email: values.email,
        userId,
        createdAt: serverTimestamp(),
      });

      console.log("✅ New user created:", userId);
      setLoading(false); // <-- Stop loading

      navigation.navigate("BodyMeasurement", {
        userId,
        username: values.username,
        email: values.email,
      });

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
      setLoading(false); // <-- Stop loading on error
      formikRef.current?.resetForm();
    }
  };

  return (
    <ImageBackground
      source={require('../assets/bg.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              <StatusBar style="dark" />
              <View style={styles.inner}>
                <Text style={styles.subtitle}>Create your account</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', paddingLeft: 20, marginBottom: 30 }}>
                  <LogInPlainText>Already have an account?</LogInPlainText>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <LogInLinkText> Log In</LogInLinkText>
                  </TouchableOpacity>
                </View>

                <Formik
                  innerRef={formikRef}
                  initialValues={{ username: '', email: '', password: '' }}
                  onSubmit={handleSignup}
                >
                  {({ handleChange, handleBlur, handleSubmit, values }) => (
                    <View style={styles.formArea}>
                      {/* Username */}
                      <Text style={styles.label}>Username:</Text>
                      <View style={styles.inputWrapper}>
                        <Octicons name="person" size={24} style={styles.leftIcon} />
                        <TextInput
                          label="Username"
                          placeholder="Enter username"
                          placeholderTextColor={colors.gray}
                          style={[
                            styles.inputArea,
                            focusedInput === 'username' && { borderColor: colors.purple },
                          ]}
                          onFocus={() => setFocusedInput('username')}
                          onBlur={(e) => { handleBlur('username')(e); setFocusedInput(null); }}
                          onChangeText={handleChange('username')}
                          value={values.username}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>

                      {/* Email */}
                      <Text style={styles.label}>Email Address:</Text>
                      <View style={styles.inputWrapper}>
                        <Octicons name="mail" size={24} style={styles.leftIcon} />
                        <TextInput
                          label="Email Address"
                          placeholder="Enter email"
                          placeholderTextColor={colors.gray}
                          style={[
                            styles.inputArea,
                            focusedInput === 'email' && { borderColor: colors.purple },
                          ]}
                          onFocus={() => setFocusedInput('email')}
                          onBlur={(e) => { handleBlur('email')(e); setFocusedInput(null); }}
                          onChangeText={handleChange('email')}
                          value={values.email}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>

                      {/* Password */}
                      <Text style={styles.label}>Password:</Text>
                      <View style={styles.inputWrapper}>
                        <FontAwesome name="lock" size={24} style={styles.leftIcon} />
                        <TextInput
                          label="Password"
                          placeholder="Enter password"
                          placeholderTextColor={colors.gray}
                          style={[
                            styles.inputArea,
                            focusedInput === 'password' && { borderColor: colors.purple },
                          ]}
                          onFocus={() => setFocusedInput('password')}
                          onBlur={(e) => { handleBlur('password')(e); setFocusedInput(null); }}
                          onChangeText={handleChange('password')}
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
                        <TouchableOpacity
                          style={styles.rightIcon}
                          onPress={() => setHidePassword(!hidePassword)}
                        >
                          <Ionicons
                            name={hidePassword ? 'eye-off' : 'eye'}
                            size={30}
                            color={colors.main}
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Next Button */}
                      <SignInButton
                        onPress={handleSubmit}
                        disabled={!values.username || !values.email || !values.password || loading}
                        style={{
                          opacity: !values.username || !values.email || !values.password || loading ? 0.5 : 1,
                        }}
                      >
                        <SignInButtonText>{loading ? "Processing..." : "Next"}</SignInButtonText>
                      </SignInButton>
                    </View>
                  )}
                </Formik>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Popup message */}
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
    </ImageBackground>
  );
};

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
    marginBottom: 20,
    gap: 17,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.main,
    marginLeft: 5,
    fontFamily: "KronaOne",
  },
  subtitle: {
    fontSize: 19,
    marginTop: 90,
    fontWeight:'600',
    color: colors.main,
    textAlign: "left",
    padding: 20,
    fontFamily: "KronaOne",
  },
  formArea: {
    width: "99%",
    paddingHorizontal: 15,
  },
  inputWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  leftIcon: {
    position: "absolute",
    left: 17,
    top: 20,
    color: colors.bg,
    zIndex: 1,
  },
  rightIcon: {
    position: "absolute",
    right: 17,
    top: 15,
    color: colors.bg,
    zIndex: 1,
  },
  inputArea: {
    backgroundColor: colors.whites,
    borderWidth: 1,
    borderColor: colors.bg,
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingLeft: 50,
    borderRadius: 10,
    fontSize: 16,
    height: 55,
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  }
});
