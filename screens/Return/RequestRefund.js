import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RequestRefund() {
  const navigation = useNavigation();
  const route = useRoute();

  const { reason, order } = route.params;

  const [description, setDescription] = useState("");
  const maxChars = 2000;
  const minChars = 30;

  const handleSubmit = () => {
    if (description.length < minChars) {
      return;
    }

    navigation.navigate("RefundDetails", {
      reason,
      description,
      order,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ToReceive")}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={27} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Return/Refund</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 15 }}>
        {/* ORDER DETAILS */}
        {order?.items?.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.productRow}>
              <Image
                source={{ uri: item.imageUrl || "https://placehold.co/100x100" }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productTitle}>{item.productName}</Text>
                <Text style={styles.productDetails}>Size: {item.size}</Text>
                <Text style={styles.productDetails}>Qty: {item.quantity}</Text>
                <View style={styles.totalRow}>
                  <Text style={styles.productTotal}>Total Payment:</Text>
                  <Text style={styles.totalPrice}>₱{order.total ?? "0.00"}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* REASON SECTION */}
        <View style={styles.card}>
          <Text style={styles.label}>Reason</Text>
          <Text style={styles.value}>{reason}</Text>
          <Text style={styles.solution}>Solution: Return and Refund</Text>
        </View>

        {/* DESCRIPTION (REQUIRED) */}
        <View style={styles.card}>
          <Text style={styles.label}>
            Description {description.length < minChars && <Text style={{ color: "red" }}>*</Text>}
          </Text>

          <TextInput
            style={[
              styles.textArea,
              description.length < minChars && description.length > 0
                ? { borderColor: "red" }
                : description.length >= minChars
                ? { borderColor: "green" }
                : {}
            ]}
            placeholder="Describe the problem you faced"
            multiline
            maxLength={maxChars}
            value={description}
            onChangeText={setDescription}
          />

          {/* LIVE REQUIREMENT MESSAGE */}
          {description.length === 0 ? (
            <Text style={styles.reqRed}>Minimum of 30 letters required.</Text>
          ) : description.length < minChars ? (
            <Text style={styles.reqRed}>
              {minChars - description.length} more characters required.
            </Text>
          ) : (
            <Text style={styles.reqGreen}>Looks good!</Text>
          )}

          <Text style={styles.charCount}>{description.length}/{maxChars}</Text>
        </View>

        {/* REFUND METHOD */}
        <View style={styles.card}>
          <Text style={styles.label}>Refund To</Text>
          <Text style={styles.value}>Preferred Refund Method</Text>
        </View>

        {/* TOTAL REFUND */}
        <View style={styles.card}>
          <Text style={styles.label}>Total Refund</Text>
          <Text style={styles.total}>₱{order?.total ?? "0.00"}</Text>
        </View>

        {/* NEXT BUTTON */}
        <TouchableOpacity 
          style={[
            styles.submitBtn,
            description.length >= minChars ? {} : { backgroundColor: "#C5A5F5" }
          ]}
          disabled={description.length < minChars}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>Next</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    position: "absolute",
    left: 2,
    bottom: 8,
  },
  headerTitle: {
    fontSize: 15,
    color: "#000",
    fontFamily: "KronaOne",
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 30,
  },
  card: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  /* PRODUCT */
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
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  productDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
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

  /* TEXT */
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: "#333",
  },
  solution: {
    fontSize: 12,
    color: "#999",
    marginTop: 3,
  },

  /* TEXT AREA */
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    height: 120,
    padding: 10,
    textAlignVertical: "top",
  },

  /* REQUIREMENT COLORS */
  reqRed: {
    color: "red",
    marginTop: 5,
    fontSize: 12,
  },
  reqGreen: {
    color: "green",
    marginTop: 5,
    fontSize: 12,
  },

  charCount: {
    textAlign: "right",
    marginTop: 5,
    fontSize: 12,
    color: "#999",
  },

  total: {
    fontSize: 16,
    fontWeight: "700",
    color: "#9747FF",
    marginTop: 5,
  },

  submitBtn: {
    backgroundColor: "#9747FF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
