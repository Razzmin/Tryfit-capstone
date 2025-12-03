import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/styles";
import ReturnRefund from "./Return/ReturnRefund";

const db = getFirestore();
const auth = getAuth();

const randomSizes = ["small", "medium", "large", "xl", "xxl"];

export default function Cancelled() {
  const navigation = useNavigation();
  const route = useRoute();
  const currentRoute = route.name;
  const activeTab = "Cancelled";

  const user = auth.currentUser;
  const [cancelledOrders, setCancelledOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      setCancelledOrders([]);
      return;
    }

    let unsubscribe = null;

    const fetchCustomUserId = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const customId = userSnap.data()?.userId;
        if (!customId) return;

        const cancelledRef = collection(db, "cancelled");

        unsubscribe = onSnapshot(
          cancelledRef,
          (snapshot) => {
            const fetchedOrders = snapshot.docs
              .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
              .filter((order) => order.userId === customId);

            fetchedOrders.sort(
              (a, b) =>
                (b.cancelledDate?.seconds || 0) -
                (a.cancelledDate?.seconds || 0)
            );

            setCancelledOrders(fetchedOrders);
          },
          (error) => {
            console.error("Error fetching cancelled orders:", error);
            setCancelledOrders([]);
          }
        );
      } catch (err) {
        console.error("Error fetching custom userId:", err);
        setCancelledOrders([]);
      }
    };

    fetchCustomUserId();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const tabRoutes = {
    Orders: "Orders",
    "To Ship": "ToShip",
    "To Receive": "ToReceive",
    Completed: "Completed",
    Cancelled: "Cancelled",
    "Return/Refund": "ReturnRefund",
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
          onPress={() => navigation.replace("LandingPage")}
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
        style={{ height: 56, width: "100%", flex: 0, justifyContent: "center" }}
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

      <ScrollView>
        {cancelledOrders.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#555" }}>
            No cancelled orders found.
          </Text>
        ) : (
          cancelledOrders.map((order) => {
            const item =
              order.items && order.items.length > 0 ? order.items[0] : null;
            if (!item) return null;

            const size =
              randomSizes[Math.floor(Math.random() * randomSizes.length)];

            const formattedDate = order.cancelledDate
              ? new Date(
                  order.cancelledDate.seconds * 1000
                ).toLocaleDateString()
              : "N/A";

            return (
              <View key={order.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.status}>{order.status}</Text>
                  <Text style={styles.date}>
                    {order.createdAt?.toDate().toLocaleString() || "N/A"}
                  </Text>
                </View>

                <View style={styles.productRow}>
                  <Image
                    source={{
                      uri: item.imageUrl || "https://placehold.co/100x100",
                    }}
                    style={styles.image}
                  />
                  <View style={styles.details}>
                    <Text style={styles.name}>{item.productName}</Text>
                    <Text style={styles.productSize}>
                      {" "}
                      Size: {item.size || "N/A"}
                    </Text>
                    <Text style={styles.productQty}>
                      Qty: {item.quantity || 1}
                    </Text>
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, { marginLeft: 80 }]}>
                        Total Payment:{" "}
                      </Text>
                      <Text style={styles.price}>₱{order.total || "0"}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      navigation.navigate("ReCheckout", {
                        cancelledID: order.cancelledID || order.id,
                      });
                    }}
                  >
                    <Text style={styles.primaryButtonText}>Buy Again</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
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
  tabContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  tabWrap: {
    alignItems: "center",
    marginRight: 10,
    justifyContent: "center",
    paddingHorizontal: 18,
    height: "100%",
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

  card: {
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  status: {
    fontWeight: "bold",
    color: "#9747FF",
    fontSize: 13,
    marginLeft: 1,
    textTransform: "uppercase",
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  productRow: {
    flexDirection: "row",
  },
  totalRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#ccc",
  },
  details: {
    marginLeft: 10,
    justifyContent: "center",
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  price: {
    fontWeight: "600",
    color: "#9747FF",
    marginRight: 5,
  },
  productSize: {
    fontSize: 12,
    color: "#666",
  },
  productQty: {
    fontSize: 12,
    color: "#666",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    paddingHorizontal: 120,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#9747FF",
  },
  primaryButtonText: {
    color: "#9747FF",
    fontSize: 14,
    fontWeight: "500",
  },
});
