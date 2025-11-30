import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/styles";
import { auth, db } from "../firebase/config";

export default function EditProfile() {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [isSaving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [errors, setErrors] = useState({}); 

  const validateField = (field, value) => {
    let error = "";
    switch (field) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (!/^[a-zA-Z\s]+$/.test(value.trim()))
          error = "Name cannot contain numbers";
        break;
      case "username":
        if (!value.trim()) error = "Username is required";
        break;
      case "gender":
        if (!value || value === "Select Gender") error = "Gender is required";
        break;
      case "phone":
        const cleanedPhone = value.replace(/\s/g, "");
        if (!cleanedPhone) error = "Phone number is required";
        else if (!/^(09\d{9}|(\+639)\d{9})$/.test(cleanedPhone))
          error = "Enter a valid mobile number (e.g., 09xxx)";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Enter a valid email address";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const validateInputs = () => {
    const fields = ["name", "username", "gender", "phone", "email"];
    let valid = true;
    fields.forEach((field) => {
      const value = { name, username, gender, phone, email }[field];
      if (!validateField(field, value)) valid = false;
    });
    return valid;
  };

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

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDoc = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDoc);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setName(userData.name || "");
            setUsername(userData.username || "");
            setGender(userData.gender || "");
            setPhone(userData.phone || "");
            setEmail(userData.email || "");
          }
        } catch (error) {
          console.log("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!validateInputs()) return;

    const currentUser = auth.currentUser;
    if (currentUser) {
      setSaving(true);
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        let userId = "";
        if (userSnap.exists()) {
          const userData = userSnap.data();
          userId = userData.userId || "";
        }
        await updateDoc(userRef, {
          name,
          username,
          gender,
          phone,
          email,
          userId,
        });

        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);

      } catch (error) {
        console.log("Error updating profile:", error);
        alert("Failed to update profile");
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SafeAreaView style={styles.container}>
            <Header
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 16,
                paddingBottom: 30,
                backgroundColor: "#fff",
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ position: "absolute", left: 0, top: -4 }}
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
                EDIT PROFILE
              </Text>
            </Header>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Name {(!name || errors.name) && <Text style={{ color: "red" }}>*</Text>}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "name" && { borderColor: "#9747FF" },
                  errors.name && { borderColor: "red" },
                ]}
                value={name}
                onChangeText={(text) => {
                  const clean = text.replace(/[0-9]/g, "");
                  setName(clean);
                  validateField("name", clean);
                }}
                placeholder="Enter your name"
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField("")}
                maxLength={40}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Username {(!username || errors.username) && <Text style={{ color: "red" }}>*</Text>}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "username" && { borderColor: "#9747FF" },
                  errors.username && { borderColor: "red" },
                ]}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  validateField("username", text);
                }}
                placeholder="Enter your username"
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField("")}
                maxLength={40}
              />
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Gender {(!gender || errors.gender) && <Text style={{ color: "red" }}>*</Text>}
              </Text>
              <View
                style={[
                  styles.pickerWrapper,
                  errors.gender && { borderColor: "red" },
                ]}
              >
                <Picker
                  selectedValue={gender}
                  onValueChange={(itemValue) => {
                    setGender(itemValue);
                    validateField("gender", itemValue);
                  }}
                  style={[styles.picker]}
                >
                  <Picker.Item label="Select Gender" value="" enabled={false} />
                  <Picker.Item label="Female" value="Female" />
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Other" value="Other" />
                  <Picker.Item
                    label="Prefer not to say"
                    value="Prefer not to say"
                  />
                </Picker>
              </View>
              {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Phone Number (Recovery) {(!phone || errors.phone) && <Text style={{ color: "red" }}>*</Text>}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "phone" && { borderColor: "#9747FF" },
                  errors.phone && { borderColor: "red" },
                ]}
                value={phone}
                onChangeText={(text) => {
                  let cleaned = text.replace(/\D/g, "");
                  if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);

                  let formatted = cleaned;
                  if (cleaned.length > 4 && cleaned.length <= 7) {
                    formatted = cleaned.replace(/(\d{4})(\d{1,3})/, "$1 $2");
                  } else if (cleaned.length > 7) {
                    formatted = cleaned.replace(/(\d{4})(\d{3})(\d{1,4})/, "$1 $2 $3");
                  }

                  setPhone(formatted);
                  validateField("phone", formatted);
                }}
                keyboardType="phone-pad"
                placeholder="Enter your phone number"
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField("")}
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email Address {(!email || errors.email) && <Text style={{ color: "red" }}>*</Text>}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "email" && { borderColor: "#9747FF" },
                  errors.email && { borderColor: "red" },
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validateField("email", text);
                }}
                keyboardType="email-address"
                placeholder="Enter your email"
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.saveButtonText}>Saving...</Text>
                </View>
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>

            {/* SIMPLE SUCCESS POPUP */}
            {showSuccessModal && (
              <View style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.3)"
              }}>
                <View style={{
                  backgroundColor: "#fff",
                  padding: 20,
                  borderRadius: 10,
                }}>
                  <Text style={{ fontSize: 16, color: "#000" }}>Profile Updated</Text>
                </View>
              </View>
            )}

          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
    marginLeft: 20,
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 10,
    fontSize: 15,
    color: "#000",
    borderWidth: 1,
    borderColor: "#ccc",
    width: "90%",
    justifyContent: "center",
    alignSelf: "center",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 5,
    backgroundColor: "#fff",
    width: "90%",
    justifyContent: "center",
    alignSelf: "center",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#333",
    backgroundColor: "#fff",
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#9747FF",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    justifyContent: "center",
    alignSelf: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "KronaOne",
    letterSpacing: 1,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginLeft: 20,
    marginTop: 4,
  },
});
