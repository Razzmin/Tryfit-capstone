import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const db = getFirestore();

export default function ToRate() {
  const route = useRoute();
  const navigation = useNavigation();

  // Expect Completed.js to pass items[] and userId (custom id stored in completed)
  const { items = [], userId: passedUserId = null } = route.params || {};

  const [ratings, setRatings] = useState({});   // { [itemId]: star }
  const [comments, setComments] = useState({}); // { [itemId]: comment }
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // convenience: are all items rated?
  const allRated = useMemo(
    () => items.length > 0 && items.every((it) => !!ratings[it.id]),
    [items, ratings]
  );

  const handleRating = (itemId, value) => {
    setRatings((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleCommentChange = (itemId, text) => {
    setComments((prev) => ({ ...prev, [itemId]: text }));
  };

  // Fetch username from users collection by the custom userId field
  const fetchUsernameByCustomId = async (customUserId) => {
    if (!customUserId) return "Guest";
    try {
      const q = query(collection(db, "users"), where("userId", "==", customUserId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        return data.username || "Guest";
      }
    } catch (err) {
      console.error("fetchUsernameByCustomId error:", err);
    }
    return "Guest";
  };

  const handleSubmit = async () => {
    try {
      if (!allRated) {
        Alert.alert("Error", "Please provide a star rating for all items before submitting.");
        return;
      }

      setSubmitting(true);

      // decide which custom userId to use (prefer passedUserId, fallback to first item.userId)
      const lookupUserId = passedUserId || items?.[0]?.userId || null;

      // fetch reviewer username once (unless anonymous)
      let reviewerUsername = "Guest";
      if (anonymous) {
        reviewerUsername = "Anonymous";
      } else if (lookupUserId) {
        reviewerUsername = await fetchUsernameByCustomId(lookupUserId);
      }

      // iterate and save updates
      for (const item of items) {
        const userRating = ratings[item.id]; // guaranteed to exist due to allRated
        const commentText = (comments[item.id] || "").trim();

        // Update product rating fields (ratecount, totalrate, rating)
        const productRef = doc(db, "products", item.productId);
        const productSnap = await getDoc(productRef);

        let updatedAverage = 0;
        if (productSnap.exists()) {
          const productData = productSnap.data();
          const currentRateCount = productData.ratecount || 0;
          const currentTotalRate = productData.totalrate || 0;

          // inside handleSubmit, where you compute updatedAverage
          const newRateCount = currentRateCount + 1;
          const newTotalRate = currentTotalRate + userRating;
          updatedAverage = newTotalRate / newRateCount;

          // ✅ round to 2 decimals but keep as number
          updatedAverage = Math.round(updatedAverage * 100) / 100;

          await updateDoc(productRef, {
            ratecount: newRateCount,
            totalrate: newTotalRate,
            rating: updatedAverage,
          });

        } else {
          // if product doc doesn't exist (unlikely), still try to set some fields
          updatedAverage = Math.round(userRating * 100) / 100;
          await updateDoc(productRef, {
            ratecount: 1,
            totalrate: userRating,
            rating: updatedAverage,
          });

        }

        // Save review entry (comment optional, rating required)
        await addDoc(collection(db, "productReviews"), {
          productId: item.productId,
          productName: item.productName,
          size: item.size,
          color: item.color,
          rating: userRating,
          comment: commentText, // may be empty string
          username: anonymous ? "Anonymous" : reviewerUsername,
          userId: lookupUserId || null,
          productRating: updatedAverage, // snapshot of product avg after this rating
          createdAt: new Date(),
        });
      }

      Alert.alert("Success", "Your ratings have been submitted. Thank you!");
      navigation.goBack();
    } catch (err) {
      console.error("Error saving rating:", err);
      Alert.alert("Error", "Failed to submit rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Items</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {items.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#555" }}>
            No items to rate.
          </Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.productName}>{item.productName}</Text>
              <Text style={styles.productDetails}>Size: {item.size}</Text>
              <Text style={styles.productDetails}>Color: {item.color}</Text>

              <Text style={styles.ratingLabel}>Rate your Product:</Text>

              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRating(item.id, star)}
                  >
                    <FontAwesome
                      name={ratings[item.id] && ratings[item.id] >= star ? "star" : "star-o"}
                      size={34}
                      color="#9747FF"
                      style={{ marginHorizontal: 3 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.commentInput}
                placeholder="Write your feedback (optional)..."
                placeholderTextColor="#999"
                value={comments[item.id] || ""}
                onChangeText={(text) => handleCommentChange(item.id, text)}
                multiline
              />
            </View>
          ))
        )}

        {/* Anonymous toggle */}
        {items.length > 0 && (
          <View style={styles.anonymousRow}>
            <Text style={styles.anonymousText}>Post comment anonymously</Text>
            <Switch
              value={anonymous}
              onValueChange={setAnonymous}
              trackColor={{ false: "#ccc", true: "#9747FF" }}
              thumbColor={anonymous ? "#fff" : "#fff"}
            />
          </View>
        )}

        {items.length > 0 && (
          <TouchableOpacity
            disabled={!allRated || submitting}
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              (!allRated || submitting) && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? "Submitting..." : "Submit Ratings"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  itemCard: { backgroundColor: "#F7F7F7", borderRadius: 10, padding: 15, marginBottom: 20 },
  productName: { fontSize: 16, fontWeight: "600", marginBottom: 6, color: "#333" },
  productDetails: { fontSize: 13, color: "#555", marginBottom: 2 },
  ratingLabel: { fontSize: 15, fontWeight: "500", color: "#333", marginBottom: 6, marginTop: 10 },
  starRow: { flexDirection: "row", marginTop: 10, marginBottom: 10 },
  commentInput: {
    borderWidth: 1, borderColor: "#9747FF", borderRadius: 8,
    padding: 10, fontSize: 14, textAlignVertical: "top",
    minHeight: 60, color: "#333",
  },
  anonymousRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  anonymousText: { fontSize: 14, color: "#333" },
  submitButton: {
    backgroundColor: "#9747FF", paddingVertical: 12,
    borderRadius: 8, alignItems: "center",
    marginTop: 10, marginBottom: 40,
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
