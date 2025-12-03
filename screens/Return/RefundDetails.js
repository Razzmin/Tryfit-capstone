import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import Modal from "react-native-modal";
import RNPickerSelect from "react-native-picker-select";
import { Feather } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

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

export default function RefundDetails({ route, navigation }) {
  const { order, toreceiveID } = route.params;

  const [returnMethod, setReturnMethod] = useState("pickup");
  const [courier, setCourier] = useState("SPX Express Return Pick Up");
  const [pickupTime, setPickupTime] = useState("");
  const [pickupOptions, setPickupOptions] = useState([]);
  const [pickupAddress, setPickupAddress] = useState({
    street: "",
    barangay: "",
    municipality: "",
    contact: "",
    name: "",
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [dropOffService, setDropOffService] = useState("J&T Express Return");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    street: "",
    contact: "",
    pickupDate: "",
    municipality: "",
    barangay: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    street: false,
    contact: false,
    pickupDate: false,
    municipality: false,
    barangay: false,
  });

  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [availableBarangays, setAvailableBarangays] = useState([]);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchShippingAddress = async () => {
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
          setPickupAddress({
            street: data.house || "",
            barangay: data.barangay || "",
            municipality: data.municipality || "",
            contact: data.phone || "",
            name: data.name || "",
          });
          setSelectedMunicipality(data.municipality || "");
          setAvailableBarangays(MUNICIPALITIES[data.municipality] || []);
        }
      } catch (err) {
        console.error("Error fetching shipping address:", err);
      }
    };
    fetchShippingAddress();
  }, []);

  // Generate next 3 pickup days
  useEffect(() => {
    const options = [];
    const today = new Date();
    for (let i = 1; i <= 3; i++) {
      const nextDay = new Date();
      nextDay.setDate(today.getDate() + i);
      const formatted = nextDay.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      options.push(formatted);
    }
    setPickupOptions(options);
  }, []);

  useEffect(() => {
    if (!toreceiveID) return;

    const fetchToReceiveItem = async () => {
      try {
        const docRef = doc(db, "toReceive", toreceiveID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log("ToReceive item:", docSnap.data());
        } else {
          console.log("No such document in toReceive!");
        }
      } catch (err) {
        console.error("Error fetching toReceive item:", err);
      }
    };

    fetchToReceiveItem();
  }, [toreceiveID]);

  const handleSaveAddress = () => {
    const newErrors = {
      name: !pickupAddress.name ? "Required" : "",
      street: !pickupAddress.street ? "Required" : "",
      contact: pickupAddress.contact.length < 11 ? "Invalid" : "",
      municipality: !pickupAddress.municipality ? "Required" : "",
      barangay: !pickupAddress.barangay ? "Required" : "",
    };
    setErrors((prev) => ({ ...prev, ...newErrors }));
    setTouched({
      name: true,
      street: true,
      contact: true,
      municipality: true,
      barangay: true,
    });

    if (!Object.values(newErrors).some((e) => e)) {
      setShowAddressModal(false);
    }
  };

  const handleCancel = () => {
    navigation.navigate("ToReceive");
  };

  const handleConfirm = () => {
    if (returnMethod === "pickup" && !pickupTime) {
      setErrors((prev) => ({ ...prev, pickupDate: "Required" }));
      setTouched((prev) => ({ ...prev, pickupDate: true }));
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmShipping = async () => {
    setShowConfirmModal(false);
    if (!toreceiveID) {
      console.error("No toreceiveID found!");
      return;
    }

    try {
      const authUser = auth.currentUser;
      const userDocRef = doc(db, "users", authUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : {};
      const savedUserId = userData.userId;
      const docRef = doc(db, "toReceive", toreceiveID);
      const docSnap = await getDoc(docRef);
      const toReceiveData = docSnap.exists() ? docSnap.data() : {};

      const { reason, description, address, delivery } = route.params; // <-- get reason & description

      const confirmedItems = order.items.map((item) => ({
        imageUrl: item.imageUrl,
        productName: item.productName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        refund: item.refund ?? item.price * item.quantity ?? 0,
        returnMethod,
        status: "Pending",
        pickupDate: returnMethod === "pickup" ? pickupTime : null,
        dropOffService: returnMethod === "dropoff" ? dropOffService : null,
        name: pickupAddress.name,
        street: pickupAddress.street,
        barangay: pickupAddress.barangay,
        municipality: pickupAddress.municipality,
        contact: pickupAddress.contact,
        delivery: delivery || "",
        address: address || "",
        toreceiveID: toreceiveID,
        requestDate: new Date(),
        reason: reason || "", // <-- save reason
        description: description || "",
        userId: savedUserId || "",
      }));

      // Save each item in return_refund collection
      for (let data of confirmedItems) {
        await addDoc(collection(db, "return_refund"), data);
      }

      // Delete the original toReceive document
      await deleteDoc(doc(db, "toReceive", toreceiveID));

      // Navigate to ReturnRefund screen and pass confirmedItems
      navigation.navigate("ReturnRefund", { confirmedItems });
    } catch (err) {
      console.error("Error processing return/refund:", err);
    }
  };

  const handleMunicipalityChange = (municipality) => {
    setSelectedMunicipality(municipality);
    setPickupAddress((prev) => ({ ...prev, municipality, barangay: "" }));
    setAvailableBarangays(MUNICIPALITIES[municipality] || []);
    if (touched.municipality)
      setErrors((prev) => ({ ...prev, municipality: "" }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={27} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Return/Refund Details</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 220 }}
      >
        {/* Return Method Tabs */}
        <Text style={styles.sectionTitle}>Select Return Method</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, returnMethod === "pickup" && styles.activeTab]}
            onPress={() => setReturnMethod("pickup")}
          >
            <Text
              style={[
                styles.tabText,
                returnMethod === "pickup"
                  ? styles.activeTabText
                  : styles.inactiveTabText,
              ]}
            >
              Pick Up
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, returnMethod === "dropoff" && styles.activeTab]}
            onPress={() => setReturnMethod("dropoff")}
          >
            <Text
              style={[
                styles.tabText,
                returnMethod === "dropoff"
                  ? styles.activeTabText
                  : styles.inactiveTabText,
              ]}
            >
              Drop Off
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentWrapper}>
          {returnMethod === "pickup" && (
            <View style={styles.card}>
              <Text style={styles.courierLabel}>Courier</Text>
              <Text style={styles.courierValue}>{courier}</Text>

              {/* Pickup Date */}
              <Text style={styles.pickupLabel}>
                Pickup Date{" "}
                {!pickupTime && touched.pickupDate && (
                  <Text style={{ color: "red" }}>*</Text>
                )}
              </Text>
              <RNPickerSelect
                onValueChange={(value) => {
                  setPickupTime(value);
                  if (touched.pickupDate)
                    setErrors((prev) => ({ ...prev, pickupDate: "" }));
                }}
                items={pickupOptions.map((day) => ({ label: day, value: day }))}
                placeholder={{ label: "Select a pickup day", value: "" }}
                value={pickupTime}
              />
              {touched.pickupDate && errors.pickupDate && (
                <Text style={{ color: "red" }}>{errors.pickupDate}</Text>
              )}
              {!errors.pickupDate && !pickupTime && touched.pickupDate && (
                <Text style={{ color: "red" }}>Required</Text>
              )}

              <Text style={styles.pickupLabel}>Receiver Name</Text>
              <Text>{pickupAddress.name || "No name provided"}</Text>

              <Text style={styles.pickupLabel}>Pickup Address</Text>
              <TouchableOpacity
                style={styles.addressRow}
                onPress={() => setShowAddressModal(true)}
              >
                <Text>{`${pickupAddress.street}, ${pickupAddress.barangay}, ${pickupAddress.municipality}`}</Text>
                <Feather name="chevron-right" size={20} color="#333" />
              </TouchableOpacity>
              <Text>Contact: {pickupAddress.contact}</Text>
            </View>
          )}

          {returnMethod === "dropoff" && (
            <View style={styles.card}>
              <Text>Select Drop Off Service</Text>
              <RNPickerSelect
                onValueChange={(value) => setDropOffService(value)}
                items={[
                  { label: "J&T Express Return", value: "J&T Express Return" },
                  { label: "SPX Express Return", value: "SPX Express Return" },
                ]}
                value={dropOffService}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.stickyBottom}>
        {order?.items?.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <Image
              source={{ uri: item.imageUrl || "https://placehold.co/100x100" }}
              style={styles.itemImage}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontWeight: "700" }}>{item.productName}</Text>
              <Text>Size: {item.size}</Text>
              <Text>Quantity: {item.quantity}</Text>
              <Text
                style={{ marginTop: 5, fontWeight: "700", color: "#9747FF" }}
              >
                Refund Amount: ₱
                {item.refund ?? (order.total ?? 0) * item.quantity}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={{ color: "#9747FF" }}>Cancel Request</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={{ color: "#fff" }}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Address Modal */}
      <Modal
        isVisible={showAddressModal}
        onBackdropPress={() => setShowAddressModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Pickup Address</Text>

          {/* NAME FIELD */}
          <Text style={styles.inputLabel}>
            Name {errors.name && <Text style={{ color: "red" }}>*</Text>}
          </Text>
          <TextInput
            style={[styles.input, errors.name && { borderColor: "red" }]}
            value={pickupAddress.name}
            maxLength={50}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^a-zA-Z\s]/g, "");
              setPickupAddress((prev) => ({ ...prev, name: cleaned }));
              setErrors((prev) => ({
                ...prev,
                name: cleaned.trim() === "" ? "Required" : "",
              }));
            }}
          />

          {/* STREET FIELD */}
          <Text style={styles.inputLabel}>
            Street {errors.street && <Text style={{ color: "red" }}>*</Text>}
          </Text>
          <TextInput
            style={[styles.input, errors.street && { borderColor: "red" }]}
            value={pickupAddress.street}
            onChangeText={(text) => {
              setPickupAddress((prev) => ({ ...prev, street: text }));
              setErrors((prev) => ({
                ...prev,
                street: text.trim() === "" ? "Required" : "",
              }));
            }}
          />

          {/* MUNICIPALITY */}
          <Text style={styles.inputLabel}>
            Municipality{" "}
            {errors.municipality && <Text style={{ color: "red" }}>*</Text>}
          </Text>
          <RNPickerSelect
            onValueChange={handleMunicipalityChange}
            items={Object.keys(MUNICIPALITIES).map((m) => ({
              label: m,
              value: m,
            }))}
            placeholder={{ label: "Select municipality", value: "" }}
            value={selectedMunicipality}
          />
          {touched.municipality && errors.municipality ? (
            <Text style={{ color: "red" }}>{errors.municipality}</Text>
          ) : null}

          {/* BARANGAY */}
          <Text style={styles.inputLabel}>
            Barangay{" "}
            {errors.barangay && <Text style={{ color: "red" }}>*</Text>}
          </Text>
          <RNPickerSelect
            onValueChange={(value) =>
              setPickupAddress((prev) => ({ ...prev, barangay: value }))
            }
            items={availableBarangays.map((b) => ({ label: b, value: b }))}
            placeholder={{ label: "Select barangay", value: "" }}
            value={pickupAddress.barangay}
          />
          {touched.barangay && errors.barangay ? (
            <Text style={{ color: "red" }}>{errors.barangay}</Text>
          ) : null}

          {/* CONTACT NUMBER */}
          <Text style={styles.inputLabel}>
            Contact Number{" "}
            {errors.contact && <Text style={{ color: "red" }}>*</Text>}
          </Text>
          <TextInput
            style={[styles.input, errors.contact && { borderColor: "red" }]}
            value={pickupAddress.contact}
            keyboardType="phone-pad"
            maxLength={11}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, "");
              setPickupAddress((prev) => ({ ...prev, contact: cleaned }));
              setErrors((prev) => ({
                ...prev,
                contact: cleaned.length < 11 ? "Invalid" : "",
              }));
            }}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isVisible={showConfirmModal}
        onBackdropPress={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Shipping Option</Text>
          <Text>Please check your shipping information before proceeding</Text>

          <View style={{ marginTop: 15 }}>
            {returnMethod === "pickup" && (
              <>
                <Text style={styles.inputLabel}>Receiver Name:</Text>
                <Text>{pickupAddress.name}</Text>

                <Text style={styles.inputLabel}>Address:</Text>
                <Text>{`${pickupAddress.street}, ${pickupAddress.barangay}, ${pickupAddress.municipality}`}</Text>

                <Text style={styles.inputLabel}>Contact Number:</Text>
                <Text>{pickupAddress.contact}</Text>

                <Text style={styles.inputLabel}>Shipping Option:</Text>
                <Text>Pick Up</Text>

                <Text style={styles.inputLabel}>Pickup Date:</Text>
                <Text>{pickupTime}</Text>
              </>
            )}

            {returnMethod === "dropoff" && (
              <>
                <Text style={styles.inputLabel}>Shipping Option:</Text>
                <Text>Drop Off</Text>

                <Text style={styles.inputLabel}>Drop Off Service:</Text>
                <Text>{dropOffService}</Text>
              </>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowConfirmModal(false)}
            >
              <Text style={{ color: "#9747FF" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmShipping}
            >
              <Text style={{ color: "#fff" }}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  backBtn: { position: "absolute", left: 2, bottom: 8 },

  headerTitle: {
    fontSize: 15,
    color: "#000",
    fontFamily: "KronaOne",
    textTransform: "uppercase",
    marginTop: 40,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 15,
    color: "#9747FF",
  },

  tabs: {
    flexDirection: "row",
    marginBottom: 10,
    marginHorizontal: 10,
  },

  tab: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9747FF",
    borderRadius: 5,
    marginHorizontal: 5,
  },

  activeTab: { backgroundColor: "#9747FF" },
  tabText: { fontWeight: "700" },
  activeTabText: { color: "#fff" },
  inactiveTabText: { color: "#9747FF" },

  contentWrapper: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 10,
  },

  card: { marginBottom: 10 },

  courierLabel: { marginTop: 10, fontWeight: "700" },
  courierValue: { marginBottom: 5 },
  pickupLabel: { marginTop: 5, fontWeight: "700" },

  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },

  itemCard: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
  },

  itemImage: { width: 80, height: 80, borderRadius: 8 },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  cancelBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#9747FF",
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },

  confirmBtn: {
    padding: 10,
    backgroundColor: "#9747FF",
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },

  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  inputLabel: {
    marginTop: 10,
    fontWeight: "700",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },

  saveBtn: {
    backgroundColor: "#9747FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },
});
