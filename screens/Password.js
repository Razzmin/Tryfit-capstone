import { Feather, FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/styles";
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

export default function Password() {
  const navigation = useNavigation();
  const auth = getAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedField, setFocusedField] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  const handleSetPassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert(
        "Error",
        "New passwords must be different from the current password."
      );
      return;
    }

    const user = auth.currentUser;

    if (!user || !user.email) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Alert.alert("Success", "Your password has been changed.", [
        {
          text: "OK",
          onPress: () => {
            auth.signOut().then(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            });
          },
        },
      ]);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password change error:", error);
      if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "Current password is incorrect.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Error", "New password should be at least 6 characters.");
      } else {
        Alert.alert("Error", "Failed to change password. Try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <Header
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 16,
              paddingBottom: 20,
              backgroundColor: "#fff",
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ position: "absolute", left: 5, top: -4 }}
            >
              <Feather name="arrow-left" size={27} color="black" />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 15,
                color: "#000",
                fontFamily: "KronaOne",
                textTransform: "uppercase",
                alignContent: "center",
              }}
            >
              Change Password
            </Text>
          </Header>

          <Text style={styles.instructionText}>
            Enter new password below to change your password
          </Text>

          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                focusedField === "CurrentPassword" && {
                  borderColor: "#9747FF",
                },
              ]}
              secureTextEntry={!showCurrent}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              onFocus={() => setFocusedField("CurrentPassword")}
            />
            <TouchableOpacity
              onPress={() => setShowCurrent(!showCurrent)}
              style={styles.eyeIcon}
            >
              <FontAwesome
                name={showCurrent ? "eye" : "eye-slash"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                focusedField === "NewPassword" && { borderColor: "#9747FF" },
              ]}
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
              onFocus={() => setFocusedField("NewPassword")}
            />
            <TouchableOpacity
              onPress={() => setShowNew(!showNew)}
              style={styles.eyeIcon}
            >
              <FontAwesome
                name={showNew ? "eye" : "eye-slash"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                focusedField === "ConfirmPassword" && {
                  borderColor: "#9747FF",
                },
              ]}
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setFocusedField("ConfirmPassword")}
            />
            <TouchableOpacity
              onPress={() => setShowConfirm(!showConfirm)}
              style={styles.eyeIcon}
            >
              <FontAwesome
                name={showConfirm ? "eye" : "eye-slash"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.setButton}
            onPress={handleSetPassword}
            disabled={isSaving}
          >
            {isSaving ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.setButtonText}>Setting...</Text>
              </View>
            ) : (
              <Text style={styles.setButtonText}>SET</Text>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  instructionText: {
    textAlign: "center",
    color: "#9747FF",
    fontSize: 15,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 20,
    color: "#333",
    marginBottom: 10,
    marginLeft: 20,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    color: "#333",
    padding: 15,
    paddingRight: 40,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "90%",
    justifyContent: "center",
    alignSelf: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 25,
    top: 12,
  },
  setButton: {
    backgroundColor: "#9747FF",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
    alignSelf: "center",
    width: "90%",
    justifyContent: "center",
  },
  setButtonText: {
    color: "#fff",
    fontFamily: "KronaOne",
    fontSize: 15,
    letterSpacing: 2,
    alignSelf: "center",
  },
});
