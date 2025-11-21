import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
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
import { Header, StyledFormArea } from "../components/styles";

const MUNICIPALITIES = {
  Bamban: [
    "Anupul",
    "Banaba",
    "Bangcu",
    "Culubasa",
    "La Paz",
    "Lourdes",
    "San Nicolas",
    "San Pedro",
    "San Rafael",
    "San Vicente",
    "Santo Niño",
  ],
  Capas: [
    "Aranguren",
    "Cub-cub",
    "Dolores",
    "Estrada",
    "Lawy",
    "Manga",
    "Maruglu",
    "O’Donnell",
    "Santa Juliana",
    "Santa Lucia",
    "Santa Rita",
    "Santo Domingo",
    "Santo Rosario",
    "Talaga",
  ],
  "Tarlac City": [
    "Aguso",
    "Alvindia Segundo",
    "Amucao",
    "Armenia",
    "Asturias",
    "Atioc",
    "Balanti",
    "Balete",
    "Balibago I",
    "Balibago II",
    "Balingcanaway",
    "Banaba",
    "Bantog",
    "Baras-baras",
    "Batang-batang",
    "Binauganan",
    "Bora",
    "Buenavista",
    "Buhilit",
    "Burot",
    "Calingcuan",
    "Capehan",
    "Carangian",
    "Care",
    "Central",
    "Culipat",
    "Cut-cut I",
    "Cut-cut II",
    "Dalayap",
    "Dela Paz",
    "Dolores",
    "Laoang",
    "Ligtasan",
    "Lourdes",
    "Mabini",
    "Maligaya",
    "Maliwalo",
    "Mapalacsiao",
    "Mapalad",
    "Matatalaib",
    "Paraiso",
    "Poblacion",
    "Salapungan",
    "San Carlos",
    "San Francisco",
    "San Isidro",
    "San Jose",
    "San Jose de Urquico",
    "San Juan Bautista",
    "San Juan de Mata",
    "San Luis",
    "San Manuel",
    "San Miguel",
    "San Nicolas",
    "San Pablo",
    "San Pascual",
    "San Rafael",
    "San Roque",
    "San Sebastian",
    "San Vicente",
    "Santa Cruz",
    "Santa Maria",
    "Santo Cristo",
    "Santo Domingo",
    "Santo Niño",
    "Sapang Maragul",
    "Sapang Tagalog",
    "Sepung Calzada",
    "Sinait",
    "Suizo",
    "Tariji",
    "Tibag",
    "Tibagan",
    "Trinidad",
    "Ungot",
    "Villa Bacolor",
  ],
};

export default function ShippingLocation() {
  const navigation = useNavigation();
  const db = getFirestore();
  const auth = getAuth();

  const [stage, setStage] = useState("municipality");
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");
  const [finalAddress, setFinalAddress] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [house, setHouse] = useState("");
  const [postal, setPostal] = useState("");

  const [isDefault, setIsDefault] = useState(true);
  const [focusedField, setFocusedField] = useState("");
  const [errors, setErrors] = useState({});
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

  useEffect(() => {
    const fetchShippingLocation = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) return;
        const customUserId = userDocSnap.data().userId;

        const q = query(
          collection(db, "shippingLocations"),
          where("userId", "==", customUserId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setName(data.name || "");
          setPhone(data.phone || "");
          setHouse(data.house || "");
          setMunicipality(data.municipality || "");
          setBarangay(data.barangay || "");
          setPostal(data.postalCode || "");
          setFinalAddress(`${data.barangay}, ${data.municipality}, Tarlac`);
          setStage("final");
        }
      } catch (err) {
        console.error("Error fetching shipping location:", err);
      }
    };

    fetchShippingLocation();
  }, []);

  const handlePickerChange = (value) => {
    if (stage === "municipality") {
      setMunicipality(value);
      setStage("barangay");
    } else if (stage === "barangay") {
      setBarangay(value);
      const composed = `${value}, ${municipality}, Tarlac`;
      setFinalAddress(composed);
      setStage("final");
    } else if (stage === "final") {
      setMunicipality("");
      setBarangay("");
      setFinalAddress("");
      setStage("municipality");
    }
  };

  const getPickerItems = () => {
    if (stage === "municipality") {
      return [
        <Picker.Item key="default" label="Select Municipality" value="" />,
        ...Object.keys(MUNICIPALITIES).map((m) => (
          <Picker.Item key={m} label={m} value={m} />
        )),
      ];
    } else if (stage === "barangay") {
      return [
        <Picker.Item
          key="default"
          label={`Select Barangay in ${municipality}`}
          value=""
        />,
        ...MUNICIPALITIES[municipality]?.map((b) => (
          <Picker.Item key={b} label={b} value={b} />
        )),
      ];
    } else {
      return [
        <Picker.Item
          key="selected"
          label={finalAddress}
          value={finalAddress}
        />,
      ];
    }
  };

  const handleSave = async () => {
    const cleanedName = name.trim();
    const cleanedPhone = phone.replace(/\s+/g, "");
    const cleanedHouse = house.trim();
    const cleanedPostal = postal.trim();

    if (!cleanedName || !/^[A-Za-z\s.]+$/.test(cleanedName)) {
      return Alert.alert(
        "Validation Error",
        "Please enter a valid name(letters only)."
      );
    }

    if (!cleanedPhone || !/^(09\d{9}|(\+639)\d{9})$/.test(cleanedPhone)) {
      return Alert.alert(
        "Validation Error",
        "Please enter a valid mobile number(e.g., 09xxx)."
      );
    }
    if (!cleanedHouse || cleanedHouse.length < 5) {
      return Alert.alert(
        "Validation Error",
        "Please enter a more complete house/street/building information"
      );
    }
    if (!municipality) {
      return Alert.alert("Validation Error", "Please select a municipality.");
    }
    if (!barangay) {
      return Alert.alert("Validation Error", "Please select a barangay.");
    }
    if (!cleanedPostal || !/^\d{4}$/.test(cleanedPostal)) {
      return Alert.alert(
        "Validation Error",
        "Please enter a valid 4-digit postal code."
      );
    }

    try {
      setSaving(true);

      const user = auth.currentUser;
      if (!user) {
        Alert.alert(
          "Not logged in",
          "Please login to save your shipping location."
        );
        setSaving(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        Alert.alert("Error", "User profile not found.");
        setSaving(false);
        return;
      }
      const customUserId = userDocSnap.data().userId;

      const q = query(
        collection(db, "shippingLocations"),
        where("userId", "==", customUserId)
      );
      const querySnapshot = await getDocs(q);

      const addressData = {
        userId: customUserId,
        name: cleanedName,
        phone: cleanedPhone,
        house: cleanedHouse,
        municipality,
        barangay,
        postalCode: cleanedPostal,
        fullAddress: `${barangay}, ${municipality}, Tarlac`,
        createdAt: new Date(),
      };

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await setDoc(docRef, addressData, { merge: true });
      } else {
        await addDoc(collection(db, "shippingLocations"), addressData);
      }

      Alert.alert("Success", "Shipping location saved successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving shipping location:", error);
      Alert.alert("Error", "Failed to save shipping location.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Header
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 16,
                paddingBottom: 10,
                backgroundColor: "#fff",
                borderBottomWidth: 1,
                borderBottomColor: "#ddd",
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ position: "absolute", left: 16, top: -4 }}
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
                Shipping Address
              </Text>
            </Header>

            <StyledFormArea
              style={{
                width: "95%",
                justifyContent: "center",
                alignSelf: "center",
              }}
            >
              <Text style={styles.label}>Name (Receiver):</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "name" && { borderColor: "#9747FF" },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Juan Dela Cruz"
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField("")}
                maxLength={40}
              />

              <Text style={styles.label}>Phone Number:</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "phone" && { borderColor: "#9747FF" },
                ]}
                value={phone}
                onChangeText={(text) => {
                  let cleaned = text.replace(/\D/g, "");

                  if (cleaned.length > 11) {
                    cleaned = cleaned.slice(0, 11);
                  }

                  let formatted = cleaned;
                  if (cleaned.length > 4 && cleaned.length <= 7) {
                    formatted = cleaned.replace(/(\d{4})(\d{1,3})/, "$1 $2");
                  } else if (cleaned.length > 7) {
                    formatted = cleaned.replace(
                      /(\d{4})(\d{3})(\d{1,4})/,
                      "$1 $2 $3"
                    );
                  }

                  setPhone(formatted);
                }}
                keyboardType="numeric"
                placeholder="e.g. 09xx xxx xxxx"
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField("")}
              />

              <Text style={styles.label}>House No., Street / Building:</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "house" && { borderColor: "#9747FF" },
                  errors.name && { borderColor: "red" },
                ]}
                value={house}
                onChangeText={setHouse}
                placeholder="e.g., Kamanggahan, Care"
                onFocus={() => setFocusedField("house")}
                onBlur={() => setFocusedField("")}
                maxLength={150}
              />

              <View style={{ marginBottom: 10 }}>
                <Text style={styles.label}>Municipality:</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <TextInput
                    style={{ flex: 1, padding: 12 }}
                    value={municipality}
                    editable={false}
                    placeholder="Select Municipality"
                  />

                  <Feather
                    name="chevron-down"
                    size={20}
                    color="#999"
                    style={{
                      position: "absolute",
                      right: 10,
                      pointerEvents: "none",
                    }}
                  />

                  <Picker
                    selectedValue={municipality}
                    style={{ width: 150, opacity: 0.01 }}
                    onValueChange={(value) => {
                      setMunicipality(value);
                      setBarangay("");
                    }}
                  >
                    <Picker.Item label="Select Municipality" value="" />
                    {Object.keys(MUNICIPALITIES).map((m) => (
                      <Picker.Item key={m} label={m} value={m} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={styles.label}>Barangay:</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <TextInput
                    style={{ flex: 1, padding: 12 }}
                    value={barangay}
                    editable={false}
                    placeholder="Select Barangay"
                  />

                  <Feather
                    name="chevron-down"
                    size={20}
                    color="#999"
                    style={{
                      position: "absolute",
                      right: 10,
                      pointerEvents: "none",
                    }}
                  />

                  <Picker
                    selectedValue={barangay}
                    style={{ width: 150, opacity: 0.01 }}
                    onValueChange={(value) => setBarangay(value)}
                    enabled={municipality !== ""}
                  >
                    <Picker.Item
                      label={`Select Barangay in ${municipality || "..."}`}
                      value=""
                    />
                    {municipality &&
                      MUNICIPALITIES[municipality].map((b) => (
                        <Picker.Item key={b} label={b} value={b} />
                      ))}
                  </Picker>
                </View>
              </View>

              <Text style={styles.label}>Postal Code:</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "postal" && { borderColor: "#9747FF" },
                ]}
                value={postal}
                onChangeText={setPostal}
                keyboardType="numeric"
                placeholder="e.g., 2300"
                onFocus={() => setFocusedField("postal")}
                onBlur={() => setFocusedField("")}
                maxLength={4}
              />
            </StyledFormArea>

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
                  <Text style={styles.saveText}>Saving...</Text>
                </View>
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  pickerWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    height: 55,
  },
  picker: {
    height: "100%",
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#9747FF",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 190,
    marginTop: 30,
    width: "90%",
    justifyContent: "center",
    alignSelf: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "KronaOne",
    letterSpacing: 2,
  },
});
