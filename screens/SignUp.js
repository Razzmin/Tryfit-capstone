import { useIsFocused, useNavigation } from "@react-navigation/native"; 
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Popup from "../components/Popup";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

import { Formik } from "formik";

import { FontAwesome, Ionicons, Octicons } from "@expo/vector-icons";

import {
  LogInLinkText,
  LogInPlainText,
  SignInButton,
  SignInButtonText,
} from "./../components/styles";

const colors = {
  bg: "#382a47",
  purple: "#9747FF",
  main: "#1f1926",
  text: "#bba1d4",
  white: "#EDEDED",
  gray: "#717171",
  whites: "#FFFFFF",
  weak: "#FF4D4F",
  medium: "#FAAD14",
  strong: "#52C41A",
};

const Signup = () => {
  const navigation = useNavigation();
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const isFocused = useIsFocused();
  const formikRef = useRef();

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isFocused && formikRef.current) {
      formikRef.current.resetForm();
    }
  }, [isFocused]);

  const handleSignup = async (values) => {
    setLoading(true);
    try {
      const username = values.username.trim();
      const email = values.email.trim();
      const password = values.password;

      if (!username || username.length < 3) {
        setPopupMessage("Username must be at least 3 characters long");
        setPopupVisible(true);
        setLoading(false);
        return;
      }

      if (username.length > 50) {
        setPopupMessage("Username cannot exceed 50 characters");
        setPopupVisible(true);
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setPopupMessage("Invalid email address");
        setPopupVisible(true);
        setLoading(false);
        return;
      }

      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
      if (!passwordRegex.test(password)) {
        setPopupMessage(
          "Password must be at least 6 characters long and include at least 1 number and 1 special character"
        );
        setPopupVisible(true);
        setLoading(false);
        return;
      }

      if (password !== values.confirmPassword) {
        setPopupMessage("Passwords do not match");
        setPopupVisible(true);
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const counterRef = doc(db, "counters", "userId");
      let userId;

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
        if (userId.length > 10) throw new Error("Generated userId exceeds max length of 10 characters!");
      });

      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        userId,
        createdAt: serverTimestamp(),
      });

      setLoading(false);
      navigation.navigate("BodyMeasurement", { userId, username, email });
    } catch (error) {
      console.log("Firebase Error:", error);
      let message = "";

      switch (error.code) {
        case "auth/email-already-in-use":
          message = "This email is already in use.";
          break;
        case "auth/invalid-email":
          message = "The email address is not valid.";
          break;
        case "auth/weak-password":
          message = "Password should be at least 6 characters.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Please check your internet.";
          break;
        default:
          message = "Something went wrong. Please try again.";
      }

      setPopupMessage(message);
      setPopupVisible(true);
      setLoading(false);
      formikRef.current?.resetForm();
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length >= 6 && /[0-9]/.test(password) && /[!@#$^&*]/.test(password)) {
      return password.length >= 10 ? "strong" : "medium";
    }
    return "weak";
  };

  const renderStrengthBar = (strength) => {
    let color = colors.weak;
    let width = "33%";
    if (strength === "medium") {
      color = colors.medium;
      width = "66%";
    } else if (strength === "strong") {
      color = colors.strong;
      width = "100%";
    }
    return (
      <View style={{ height: 6, width: "100%", backgroundColor: "#E5E5E5", borderRadius: 3, marginBottom: 5 }}>
        <View style={{ height: 6, width, backgroundColor: color, borderRadius: 3 }} />
      </View>
    );
  };

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <ImageBackground source={require("../assets/bg.png")} style={{ flex: 1 }} resizeMode="cover">
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              <StatusBar style="dark" />
              <View style={styles.inner}>
                <Text style={styles.subtitle}>Create your account</Text>

                <View style={{ flexDirection: "row", paddingLeft: 20, marginBottom: 30 }}>
                  <LogInPlainText>Already have an account?</LogInPlainText>
                  <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <LogInLinkText> Log In</LogInLinkText>
                  </TouchableOpacity>
                </View>

                <Formik
                  innerRef={formikRef}
                  initialValues={{ username: "", email: "", password: "", confirmPassword: "" }}
                  onSubmit={handleSignup}
                >
                  {({ handleChange, handleBlur, handleSubmit, values }) => {
                    const passwordStrength = getPasswordStrength(values.password);
                    return (
                      <View style={styles.formArea}>
                        {/* USERNAME */}
                        <Text style={styles.label}>Username:</Text>
                        <View style={styles.inputWrapper}>
                          <Octicons name="person" size={24} style={styles.leftIcon} />
                          <TextInput
                            placeholder="Enter username"
                            placeholderTextColor={colors.gray}
                            style={[styles.inputArea, focusedInput === "username" && { borderColor: colors.purple }]}
                            onFocus={() => setFocusedInput("username")}
                            onBlur={(e) => { handleBlur("username")(e); setFocusedInput(null); }}
                            onChangeText={handleChange("username")}
                            value={values.username}
                            autoCapitalize="none"
                          />
                        </View>
                        {focusedInput === "username" && values.username.length < 3 && (
                          <Text style={{ color: "red", marginBottom: 10 }}>Username must be at least 3 characters long</Text>
                        )}

                        {/* EMAIL */}
                        <Text style={styles.label}>Email Address:</Text>
                        <View style={styles.inputWrapper}>
                          <Octicons name="mail" size={24} style={styles.leftIcon} />
                          <TextInput
                            placeholder="Enter email"
                            placeholderTextColor={colors.gray}
                            style={[styles.inputArea, focusedInput === "email" && { borderColor: colors.purple }]}
                            onFocus={() => setFocusedInput("email")}
                            onBlur={() => setFocusedInput(null)}
                            onChangeText={handleChange("email")}
                            value={values.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                          />
                        </View>
                        {values.email.length > 0 && !isEmailValid(values.email) && (
                          <Text style={{ color: "red", marginBottom: 10, paddingLeft: 5 }}>Invalid email address</Text>
                        )}

                        {/* PASSWORD */}
                        <Text style={styles.label}>Password:</Text>
                        <View style={styles.inputWrapper}>
                          <FontAwesome name="lock" size={24} style={styles.leftIcon} />
                          <TextInput
                            placeholder="Enter password"
                            placeholderTextColor={colors.gray}
                            style={[styles.inputArea, focusedInput === "password" && { borderColor: colors.purple }]}
                            onFocus={() => setFocusedInput("password")}
                            onBlur={() => setFocusedInput(null)}
                            onChangeText={handleChange("password")}
                            value={values.password}
                            secureTextEntry={hidePassword}
                            autoCapitalize="none"
                          />
                          <TouchableOpacity style={styles.rightIcon} onPress={() => setHidePassword(!hidePassword)}>
                            <Ionicons name={hidePassword ? "eye-off" : "eye"} size={30} color={colors.main} />
                          </TouchableOpacity>
                        </View>

                        {focusedInput === "password" && (
                          <View style={{ marginBottom: 10, paddingLeft: 5 }}>
                            <Text
                              style={{
                                color: /^(?=.*[0-9])(?=.*[!@#$^&*])[A-Za-z0-9!@#$%^&*]{6,}$/.test(values.password)
                                  ? "green"
                                  : "red",
                                marginBottom: 5,
                              }}
                            >
                              Password must be at least 6 characters long and include 1 number and 1 special character (!@#$^&*)
                            </Text>
                            {values.password.length > 0 && renderStrengthBar(passwordStrength)}
                            {values.password.length > 0 && (
                              <Text style={{ color: colors[passwordStrength] }}>
                                Strength: {passwordStrength.toUpperCase()}
                              </Text>
                            )}
                          </View>
                        )}

                        {/* CONFIRM PASSWORD */}
                        <Text style={styles.label}>Confirm Password:</Text>
                        <View style={styles.inputWrapper}>
                          <FontAwesome name="lock" size={24} style={styles.leftIcon} />
                          <TextInput
                            placeholder="Confirm password"
                            placeholderTextColor={colors.gray}
                            style={[styles.inputArea, focusedInput === "confirmPassword" && { borderColor: colors.purple }]}
                            onFocus={() => setFocusedInput("confirmPassword")}
                            onBlur={(e) => { handleBlur("confirmPassword")(e); setFocusedInput(null); }}
                            onChangeText={handleChange("confirmPassword")}
                            value={values.confirmPassword}
                            secureTextEntry={hideConfirmPassword}
                            autoCapitalize="none"
                          />
                          <TouchableOpacity style={styles.rightIcon} onPress={() => setHideConfirmPassword(!hideConfirmPassword)}>
                            <Ionicons name={hideConfirmPassword ? "eye-off" : "eye"} size={30} color={colors.main} />
                          </TouchableOpacity>
                        </View>
                        {focusedInput === "confirmPassword" && values.confirmPassword.length > 0 && values.password !== values.confirmPassword && (
                          <Text style={{ color: "red", marginBottom: 10, paddingLeft: 5 }}>Passwords do not match</Text>
                        )}

                        {/* SIGNUP BUTTON */}
                        <SignInButton
                          onPress={handleSubmit}
                          disabled={
                            !values.username || !values.email || !values.password || !values.confirmPassword ||
                            values.password !== values.confirmPassword ||
                            !/^(?=.*[0-9])(?=.*[!@#$^&*])[A-Za-z0-9!@#$%^&*]{6,}$/.test(values.password) ||
                            !isEmailValid(values.email) ||
                            loading
                          }
                          style={{ opacity: !values.username || !values.email || !values.password || !values.confirmPassword || values.password !== values.confirmPassword || !/^(?=.*[0-9])(?=.*[!@#$^&*])[A-Za-z0-9!@#$%^&*]{6,}$/.test(values.password) || !isEmailValid(values.email) || loading ? 0.5 : 1 }}
                        >
                          <SignInButtonText>{loading ? "Processing..." : "Next"}</SignInButtonText>
                        </SignInButton>
                      </View>
                    );
                  }}
                </Formik>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Popup visible={popupVisible} message={popupMessage} onClose={() => setPopupVisible(false)} />
    </ImageBackground>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    paddingHorizontal: 15,
    paddingTop: 70,
    fontFamily: "System",
  },
  inner: {
    maxWidth: 330,
    alignSelf: "center",
    width: "100%",
  },
  subtitle: {
    fontSize: 19,
    marginTop: 90,
    fontWeight: "600",
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
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
