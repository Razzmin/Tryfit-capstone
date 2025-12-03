import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";

export default function ReturnRefund() {
  const navigation = useNavigation();
  const route = useRoute();
  const { confirmedItems } = route.params || {};
  const [refundOrders, setRefundOrders] = useState([]);

  const activeTab = "Return/Refund";
  const tabRoutes = {
    Orders: "Orders",
    "To Ship": "ToShip",
    "To Receive": "ToReceive",
    Completed: "Completed",
    Cancelled: "Cancelled",
    "Return/Refund": "ReturnRefund",
  };

  useEffect(() => {
    const fetchRefundOrders = async () => {
      try {
        const authUser = auth.currentUser;
        if (!authUser) return;

        const userDocRef = doc(db, "users", authUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : {};
        const savedUserId = userData.userId;

        const snapshot = await getDocs(collection(db, "return_refund"));

        const orders = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();

            return {
              id: docSnap.id,
              ...data,
              items: [
                {
                  imageUrl: data.imageUrl,
                  productName: data.productName,
                  size: data.size,
                  quantity: data.quantity,
                  price: data.price,
                  refund: data.refund,
                  pickupDate: data.pickupDate,
                  dropOffService: data.dropOffService,
                },
              ],
            };
          })
          .filter((order) => order.userId === savedUserId)
          .sort((a, b) => {
            const aDate = a.requestDate?.toDate() || new Date(0);
            const bDate = b.requestDate?.toDate() || new Date(0);
            return bDate - aDate; // most recent first
          });

        setRefundOrders(orders);
      } catch (error) {
        console.error("Error fetching return/refund orders:", error);
      }
    };

    fetchRefundOrders();
  }, []);

  const handleCancel = (orderId) => {
    Alert.alert(
      "Cancel Refund",
      "Are you sure you want to cancel this refund request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () =>
            setRefundOrders((prev) => prev.filter((o) => o.id !== orderId)),
        },
      ]
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString().slice(-2);
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    return `${d}/${m}/${y} ${hh}:${mm}`;
  };

  const formatDateOnly = (date) => {
    if (!date) return "-";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.replace("LandingPage")}
          style={{ position: "absolute", left: 2, bottom: 8 }}
        >
          <Feather name="arrow-left" size={27} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY PURCHASES</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={{
            paddingHorizontal: 20,
            alignItems: "center",
            flexGrow: 0,
          }}
        >
          {Object.keys(tabRoutes).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => {
                if (tab !== activeTab) navigation.replace(tabRoutes[tab]);
              }}
              style={styles.tabWrap}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
              <View
                style={[
                  styles.underline,
                  activeTab === tab && styles.activeUnderline,
                ]}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* REFUND ORDERS */}
      <ScrollView style={{ marginBottom: 40, paddingHorizontal: 10 }}>
        {refundOrders.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#555" }}>
            No refund requests.
          </Text>
        ) : (
          refundOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              {/* Top Row */}
              <View style={styles.topRow}>
                <Text style={styles.orderStatus}>{order.status}</Text>
                <Text style={styles.orderDateTime}>
                  {formatDateTime(order.requestDate?.toDate())}
                </Text>
              </View>

              {/* Items */}
              {order.items.map((item, index) => (
                <View key={index} style={styles.productRow}>
                  <Image
                    source={{
                      uri: item.imageUrl || "https://placehold.co/100x100",
                    }}
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.productName}</Text>
                    <Text style={styles.productSize}>Size: {item.size}</Text>
                    <Text style={styles.productQty}>Qty: {item.quantity}</Text>
                    <Text
                      style={{
                        marginTop: 5,
                        fontWeight: "700",
                        color: "#9747FF",
                      }}
                    >
                      Refund Amount: ₱{item.refund}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Shipping Info */}
              {order.items.map((item, index) => (
                <View key={index} style={styles.shippingInfoUnder}>
                  <Text>
                    Shipping Method:{" "}
                    <Text style={styles.shippingValue}>
                      {order.returnMethod === "pickup" ? "Pick Up" : "Drop Off"}
                    </Text>
                  </Text>

                  {order.returnMethod === "pickup" && (
                    <Text>
                      Pickup Date:{" "}
                      <Text style={styles.orderDateTime}>
                        {formatDateOnly(order.requestDate?.toDate())}
                      </Text>
                    </Text>
                  )}

                  {order.returnMethod === "dropoff" && (
                    <Text>
                      Drop Off Service:{" "}
                      <Text style={styles.shippingValue}>
                        {item.dropOffService || order.dropOffService}
                      </Text>
                    </Text>
                  )}
                </View>
              ))}

              {/* CANCEL BUTTON */}
              {order.status === "Pending" && (
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(order.id)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 15,
    color: "#000",
    fontFamily: "KronaOne",
    textTransform: "uppercase",
    alignContent: "center",
  },
  tabsContainer: {
    height: 56,
    width: "100%",
    flex: 0,
    justifyContent: "center",
  },
  tabScroll: {
    flex: 1,
  },
  tabWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    height: "100%",
    marginRight: 10,
  },
  tabText: {
    fontSize: 14,
    color: "#333",
  },
  activeTabText: {
    color: "#9747FF",
    fontWeight: "600",
  },
  underline: {
    height: 3,
    backgroundColor: "transparent",
    width: "100%",
    marginTop: 4,
  },
  activeUnderline: {
    backgroundColor: "#9747FF",
  },
  orderCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderStatus: {
    fontWeight: "bold",
    color: "#9747FF",
    textTransform: "uppercase",
    fontSize: 13,
  },
  orderDateTime: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9747FF",
  },
  productRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#ccc",
  },
  productInfo: {
    marginLeft: 10,
    justifyContent: "center",
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  productSize: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  productQty: {
    fontSize: 12,
    color: "#666",
  },
  shippingInfoUnder: {
    marginTop: 5,
    flexDirection: "column",
  },
  shippingValue: {
    color: "#9747FF",
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#9747FF",
    paddingVertical: 6,
    paddingHorizontal: 30,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  cancelBtnText: {
    color: "#9747FF",
    fontWeight: "600",
  },
});
