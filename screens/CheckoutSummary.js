import { useNavigation, useRoute } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";

export default function CheckoutSummary() {
  const navigation = useNavigation();
  const route = useRoute();
  const { total = 0 } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.header}></View>
      <View style={styles.topSection}>
        <LottieView
          source={require(".././assets/animations/Loading_car.json")}
          autoPlay
          loop={false}
          style={{ width: 190, height: 190, marginBottom: 30 }}
        />
      </View>

      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text style={styles.orderText}>Order Completed</Text>
        <Text style={styles.orderNumber}>Thank you for purchasing!</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.itemText}>Ordered Items</Text>
          <Entypo name="dots-two-horizontal" size={24} color="black" />
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.itemTotal}>Order</Text>
          <Text style={styles.itemTotal}> ₱{total}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.itemTotal}>Delivery</Text>
          <Text style={styles.itemTotal}> ₱58</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.itemText}>Summary</Text>
          <Text style={styles.itemText}> ₱{total + 58}</Text>
        </View>
      </View>

      <View style={{ alignItems: "center" }}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate("LandingPage")}
        >
          <Text style={styles.continueText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  topSection: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  orderText: {
    fontSize: 19,
    fontFamily: "KronaOne",
    color: "#000000ff",
    textTransform: "uppercase",
  },
  orderNumber: {
    fontSize: 13,
    color: "#515151ff",
    marginTop: 5,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 16,
    color: "#000000ff",
    marginBottom: 15,
    fontWeight: "bold",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 11,
  },
  itemText: {
    color: "#000000ff",
    fontSize: 13,
    fontFamily: "KronaOne",
  },
  itemTotal: {
    color: "#000000ff",
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: "#9747FF",
    paddingVertical: 20,
    borderRadius: 10,
    width: "95%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  continueText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
    color: "#ffffffff",
    fontFamily: "KronaOne",
  },
  orderButton: {
    backgroundColor: "#A9A9A9",
    paddingVertical: 20,
    borderRadius: 10,
    width: "95%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ffffffff",
  },
});
