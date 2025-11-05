import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  Image,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { SafeAreaView } from 'react-native-safe-area-context';
import{ Header } from '../components/styles';


const db = getFirestore();

export default function ToRate() {
  const route = useRoute();
  const navigation = useNavigation();

  // Receive completed order ID and custom userId
  const { completedOrderId, userId: passedUserId } = route.params || {};

  const [items, setItems] = useState([]);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch completed order by ID
  useEffect(() => {
    if (!completedOrderId) return;

    const fetchCompletedOrder = async () => {
      try {
        const orderRef = doc(db, "completed", completedOrderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          setItems(orderData.items || []);
        } else {
          Alert.alert("Error", "Completed order not found.");
        }
      } catch (err) {
        console.error("Error fetching completed order:", err);
      }
    };

    fetchCompletedOrder();
  }, [completedOrderId]);

   const allRated = useMemo(
    () => items.length > 0 && items.every((it) => !!ratings[it.productId]),
    [items, ratings]
  );





  const handleRating = (itemId, value) => {
    setRatings((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleCommentChange = (itemId, text) => {
    setComments((prev) => ({ ...prev, [itemId]: text }));
  };

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
  if (!allRated) {
    Alert.alert("Error", "Please provide a star rating for all items before submitting.");
    return;
  }

  try {
    setSubmitting(true);

    const reviewsCollection = collection(db, "productReviews");

    // Get reviewer name
    const reviewerUsername = anonymous
      ? "Anonymous"
      : passedUserId
      ? await fetchUsernameByCustomId(passedUserId)
      : "Anonymous";

    // Use the order-level productID for all items
    const orderProductID = items.length > 0 ? items[0].productID || items[0].productId : null;

    for (const item of items) {
      if (!orderProductID) continue; // fallback

      const reviewDoc = {
        reviewID: `RV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productID: orderProductID,        // 🔥 using order-level productID
        productName: item.productName,
        size: item.size || "N/A",
        rating: ratings[item.productId],
        comment: comments[item.productId]?.trim() || "",
        userName: reviewerUsername,
        createdAt: new Date(),
      };

      await addDoc(reviewsCollection, reviewDoc);

      // Recalculate average rating for this productID
      const reviewsQuery = query(reviewsCollection, where("productID", "==", orderProductID));

      const reviewSnap = await getDocs(reviewsQuery);

      let totalRating = 0;
      let count = 0;
      reviewSnap.forEach((doc) => {
        const data = doc.data();
        if (data.rating !== undefined) {
          totalRating += data.rating;
          count++;
        }
      });

      const avgRating = count > 0 ? totalRating / count : 0;

      // Update the product's average rating
      const productsQuery = query(collection(db, "products"), where("productID", "==", orderProductID));
      const productSnap = await getDocs(productsQuery);
      for (const productDoc of productSnap.docs) {
        const productRef = doc(db, "products", productDoc.id);
        await updateDoc(productRef, { rating: avgRating });
      }
    }

    Alert.alert("Success", "Your ratings have been submitted. Thank you!");
    navigation.goBack();
  } catch (err) {
    console.error("Error submitting ratings:", err);
    Alert.alert("Error", "Failed to submit ratings. Try again.");
  } finally {
    setSubmitting(false);
  }
};



  return (
    <SafeAreaView style={styles.container}>
        <Header style = {{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingBottom: 20,
        backgroundColor: '#fff',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}
        style={{position: 'absolute', left: 2, top: -4}}>
          <Feather name="arrow-left" size={27} color="black"  />
        </TouchableOpacity>

          <Text style= {{ fontSize: 15, color: '#000', fontFamily:"KronaOne", textTransform: 'uppercase', alignContent: 'center'}}>MY PROFILE</Text>
      </Header>

      <ScrollView>
        {items.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#555" }}>
            No items to rate.
          </Text>
        ) : (
          items.map((item) => (
            <View key={item.productId} style={styles.itemCard}>


               <View style={styles.productRow}>
                               <Image
                                 source={{ uri: item.imageUrl || 'https://placehold.co/100x100' }}
                                 style={styles.productImage}
                               />
                               <View style={styles.productInfo}>
                                 <Text style={styles.productName}>{item.productName}</Text>
                                 <Text style={styles.productSize}>
                                   Size: {item.size || 'N/A'}
                                 </Text>
                                 </View>
                                 </View>

              <View style= {{flexDirection: 'row', alignItems: 'center', marginBottom: -10}}>
              <Text style={[styles.ratingLabel, {marginRight: 10}]}>Rate your Product:</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                 <TouchableOpacity
                  key={star}
                  onPress={() => handleRating(item.productId, star)}
                >
                  <FontAwesome
                    name={ratings[item.productId] && ratings[item.productId] >= star ? "star" : "star-o"}
                    size={30}
                    color="#9747FF"
                    style={{ marginHorizontal: 3 }}
                  />
                </TouchableOpacity>

                ))}
              </View>
              </View>

              <TextInput
                style={styles.commentInput}
                placeholder="Write your feedback (optional)..."
                placeholderTextColor="#999"
                value={comments[item.productId] || ""}
                onChangeText={(text) => handleCommentChange(item.productId, text)}

                multiline
                maxLength={200}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
     flex: 1,
      backgroundColor: "#fff",
       paddingTop: 30, 
       paddingHorizontal: 20
       },
  itemCard: { 
    backgroundColor: "#F7F7F7", 
    borderRadius: 10,
     padding: 15,
      marginBottom: 20
     },
    productInfo: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 17,
    fontWeight: '500',
    marginTop: -10,
    marginBottom: 10,
  },
  productSize: {
    fontSize: 12,
    color: '#666',
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#ccc',
  }, 
  productDetails: {
     fontSize: 13,
      color: "#555",
       marginBottom: 2 
      },
  ratingLabel: {
     fontSize: 15,
      fontWeight: "500",
       color: "#333",
        marginBottom: 40,
         marginTop: 10 
        },
  starRow: {
     flexDirection: "row",
      marginTop: 10,
       marginBottom: 40
       },
  commentInput: {
    borderWidth: 1, 
    borderColor: "#9747FF",
     borderRadius: 8,
    padding: 15, 
    fontSize: 14,
     textAlignVertical: "top",
    minHeight: 90,
     color: "#333",
  },
  anonymousRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  anonymousText: { 
    fontSize: 14, 
    color: "#333" 
  },
  submitButton: {
    backgroundColor: "#9747FF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10, 
    marginBottom: 40,
  },
  submitButtonText: { 
    color: "#fff",
     fontSize: 14, 
      fontFamily: "KronaOne",
    },
});
