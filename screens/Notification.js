import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc  } from "firebase/firestore";

export default function Notification() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const auth = getAuth();
  const db = getFirestore();
useEffect(() => {
  const user = auth.currentUser;
  if (!user) return;

  let unsubscribe;

  const fetchNotifications = async () => {
    try {
      // 1. Get custom userId from users collection
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;

      const customUserId = userDoc.data().userId;

      // 2. Query notifications for that user
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", customUserId)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          // ✅ Sort newest first (highest timestamp first)
          .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());

        setNotifications(notifs);
      });
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  fetchNotifications();

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []);


  const getIcon = (type) => {
    switch (type) {
      case "cart":
        return <AntDesign name="shoppingcart" size={20} color="#9747FF" />;
      case "order":
        return <MaterialIcons name="receipt-long" size={20} color="#4CAF50" />;
      case "shipped":
        return <Ionicons name="cube" size={20} color="#2196F3" />;
      case "ready":
        return <Ionicons name="checkmark-done-circle" size={20} color="#FF9800" />;
      default:
        return <AntDesign name="bells" size={20} color="#888" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Text style={{ color: '#999', marginTop: 20 }}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {getIcon(item.type)}
                <Text style={styles.message}>{item.message}</Text>
              </View>
              <Text style={styles.timestamp}>
                {item.timestamp?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {" • "}
                {item.timestamp?.toDate().toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  notificationBox: {
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 15,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
