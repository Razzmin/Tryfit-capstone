import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/styles";

const db = getFirestore();
const auth = getAuth();

export default function ToReceive() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const activeTab = "To Receive";

  const [orders, setOrders] = useState([]);
  const [customUserId, setCustomUserId] = useState(null);

  const [showReturnSheet, setShowReturnSheet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [arrowAnimations, setArrowAnimations] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); 

  useEffect(() => {
    const fetchCustomUserId = async () => {
      try {
        if (!user) return;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.userId) setCustomUserId(data.userId);
        }
      } catch (err) {
        console.error("Error fetching custom userId:", err);
      }
    };
    fetchCustomUserId();
  }, [user]);

  useEffect(() => {
    if (!customUserId) {
      setOrders([]);
      return;
    }

    const q = query(
      collection(db, "toReceive"),
      where("userId", "==", customUserId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ docId: docSnap.id, ...docSnap.data() });
        });

        fetched.sort((a, b) => {
          if (a.createdAt && b.createdAt)
            return b.createdAt.seconds - a.createdAt.seconds;
          return 0;
        });

        setOrders(fetched);
      },
      (error) => {
        console.error("Error fetching toReceive orders:", error);
        setOrders([]);
      }
    );

    return () => unsubscribe();
  }, [customUserId]);

  const handleCopy = (orderId) => {
    Clipboard.setStringAsync(orderId);
    Alert.alert("Copied", "Order ID copied to clipboard");
  };

  const handleReceiveOrder = (order) => {
    Alert.alert(
      "Confirm Receive",
      "Have you received this order successfully?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, received",
          onPress: async () => {
            try {
              const completedOrder = {
                toshipID: order.toshipID,
                toreceiveID: order.toreceiveID,
                productID: order.productID,
                completedID: `CP-${Date.now()}-${Math.floor(
                  Math.random() * 1000
                )}`,
                address: order.address,
                createdAt: order.createdAt,
                deliveryFee: order.deliveryFee,
                delivery: order.delivery,
                items: order.items.map((item) => ({
                  imageUrl: item.imageUrl,
                  productId: item.productId,
                  productName: item.productName,
                  quantity: item.quantity,
                  size: item.size,
                  price: item.price,
                })),
                name: order.name,
                orderId: order.orderId,
                packedAt: order.packedAt,
                shippedAt: order.shippedAt,
                receivedAt: new Date(),
                status: "Completed",
                total: order.total,
                userId: order.userId,
              };

              const completedRef = doc(collection(db, "completed"));
              await setDoc(completedRef, completedOrder);

              for (const item of order.items) {
                const productRef = doc(db, "products", item.productId);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                  const productData = productSnap.data();
                  const currentSold = productData.sold || 0;
                  const newSold = currentSold + item.quantity;

                  await setDoc(productRef, { sold: newSold }, { merge: true });
                }
              }

              await deleteDoc(doc(db, "toReceive", order.docId));

              await addDoc(collection(db, "notifications"), {
                notifID: `NTC-${Date.now()}-${Math.floor(
                  Math.random() * 1000
                )}`,
                userId: order.userId,
                title: "Order Received",
                message: "Orders is received",
                orderId: order.orderId,
                timestamp: new Date(),
                read: false,
              });

              Alert.alert("Received", "Your order has been Received.");
            } catch (err) {
              console.error("Error marking order as received:", err);
              Alert.alert(
                "Error",
                "Failed to mark order as received. Try again."
              );
            }
          },
        },
      ]
    );
  };

  const tabRoutes = {
    Orders: "Orders",
    "To Ship": "ToShip",
    "To Receive": "ToReceive",
    Completed: "Completed",
    Cancelled: "Cancelled",
    "Return/Refund": "ReturnRefund",
  };

  useEffect(() => {
    setArrowAnimations([
      new Animated.Value(0),
      new Animated.Value(0),
      new Animated.Value(0),
    ]);
  }, []);

  const toggleCategory = (index) => {
    if (!arrowAnimations[index]) return;

    const toValue = selectedCategory === index ? 0 : 1;
    Animated.timing(arrowAnimations[index], {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setSelectedCategory(selectedCategory === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
          paddingVertical: 11,
          backgroundColor: "#fff",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: "absolute", left: 2, bottom: 8 }}
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
          MY PURCHASES
        </Text>
      </Header>

      <View
        style={{
          height: 56,
          width: "100%",
          flex: 0,
          justifyContent: "center",
        }}
      >
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

      <ScrollView style={{ marginBottom: 40 }}>
        {orders.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#555" }}>
            No "To Receive" orders found.
          </Text>
        ) : (
          orders.map((order) => {
            const item =
              order.items && order.items.length > 0 ? order.items[0] : null;
            if (!item) return null;

            const imageUri = item.imageUrl || "https://placehold.co/100x100";

            return (
              <View key={order.toreceiveID} style={styles.orderCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderStatus}>{order.status}</Text>
                  <Text style={styles.orderDate}>
                    {order.createdAt?.toDate().toLocaleString() || "N/A"}
                  </Text>
                </View>

                <View style={styles.productRow}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.productName}</Text>
                    <Text style={styles.productSize}>Size: {item.size}</Text>
                    <Text style={styles.productQty}>
                      Qty: {item.quantity || 1}
                    </Text>
                    <View style={styles.totalRow}>
                      <Text style={styles.productTotal}>Total Payment:</Text>
                      <Text style={[styles.totalPrice, { marginLeft: 90 }]}>
                        ₱{order.total ?? "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.shippingRow}>
                  <Text style={styles.waitingMessage}>
                    Waiting for you to confirm{"\n"}receipt of order
                  </Text>

                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: "#9747FF",
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      borderRadius: 6,
                      marginRight: 6,
                      marginLeft: 10,
                    }}
                    onPress={() => {
                      setSelectedOrder(order);
                      setShowReturnSheet(true);
                    }}
                  >
                    <Text
                      style={{
                        color: "#9747FF",
                        fontSize: 12,
                        fontWeight: "500",
                      }}
                    >
                      Return / Refund
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.shippingBtn}
                    onPress={() => handleReceiveOrder(order)}
                  >
                    <Text style={styles.shippingBtnText}>Mark as Received</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.orderIdRow}>
                  <Text style={styles.orderIdText}>
                    Order ID: {order.orderId}
                  </Text>
                  <TouchableOpacity onPress={() => handleCopy(order.orderId)}>
                    <Feather name="copy" size={16} color="#9747FF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* >>> RETURN/REFUND BOTTOM SHEET */}
      {showReturnSheet && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowReturnSheet(false)}
              style={{ alignSelf: "flex-end" }}
            >
              <Text style={{ fontSize: 20 }}>✕</Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 20,
                color: "#9747FF",
              }}
            >
              What happened to your order?
            </Text>

            {[
              {
                title: "Received damaged item(s)",
                options: ["Damaged item", "Product is defective"],
              },
              {
                title: "Received incorrect item(s)",
                options: ["Wrong item", "Wrong size"],
              },
              {
                title: "Did not receive some/all of the items",
                options: ["Did not receive some of the item(s)", "Did not receive all of the item(s)"],
              },
            ].map((cat, index) => {
              const rotation = arrowAnimations[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "180deg"],
              });

              return (
                <View key={`cat-${index}`} style={{ marginBottom: 12 }}>
                  <TouchableOpacity
                    onPress={() => toggleCategory(index)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 20,
                      backgroundColor: "#f5f0ff",
                      borderRadius: 12,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "600" }}>{cat.title}</Text>
                    <Animated.Text
                      style={{
                        color: "#9747FF",
                        fontSize: 16,
                        transform: [{ rotate: rotation }, { scaleX: 1.8 }],
                      }}
                    >
                      ˅
                    </Animated.Text>
                  </TouchableOpacity>

                  {selectedCategory === index && (
                    <View style={{ marginTop: 8, paddingLeft: 10 }}>
                      {cat.options.map((opt, optIndex) => (
                        <TouchableOpacity
                          key={`opt-${index}-${optIndex}`}
                          onPress={() => setSelectedReason(opt)}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 15,
                            marginBottom: 6,
                            borderRadius: 10,
                            backgroundColor:
                              selectedReason === opt ? "#fff" : "#f8f5ff",
                            borderWidth: selectedReason === opt ? 2 : 1,
                            borderColor:
                              selectedReason === opt ? "#9747FF" : "#ccc",
                          }}
                        >
                          <Text>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              disabled={!selectedReason}
              style={{
                backgroundColor: selectedReason ? "#9747FF" : "#c8b6ff",
                paddingVertical: 12,
                borderRadius: 14,
                marginTop: 10,
                alignItems: "center",
              }}
              onPress={() => {
                navigation.navigate("RequestRefund", {
                  order: selectedOrder,
                  items: selectedOrder?.items || [],
                  orderId: selectedOrder?.orderId,
                  category: selectedCategory,
                  reason: selectedReason,
                });

                setShowReturnSheet(false);
                setSelectedCategory(null);
                setSelectedReason(null);
                setSelectedOrder(null);
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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

  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },

  tabWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    height: "100%",
    marginRight: 10,
  },

  tabScroll: {
    flex: 1,
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
    marginBottom: 10,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  orderStatus: {
    fontWeight: "bold",
    color: "#9747FF",
    textTransform: "uppercase",
    fontSize: 13,
    marginLeft: 1,
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

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    marginBottom: 10,
  },

  productTotal: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },

  totalPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9747FF",
  },

  shippingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 1,
  },

  waitingMessage: {
    fontSize: 12,
    color: "#555",
    fontStyle: "italic",
  },

  shippingBtn: {
    backgroundColor: "#9747FF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  shippingBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },

  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 12,
  },

  orderIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderIdText: {
    fontSize: 13,
    color: "#333",
  },

  orderDate: {
    fontSize: 12,
    color: "#666",
  },
});
