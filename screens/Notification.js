import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Feather, Ionicons, AntDesign, MaterialIcons  } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from "firebase/auth";
import{Header } from '../components/styles';
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
        return <Ionicons name="notifications-outline" size={20}  color="#888" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header style = {{
                     flexDirection: 'row',
                     alignItems: 'center',
                     justifyContent: 'center',
                     paddingHorizontal: 16,
                     paddingBottom: 10,
                     backgroundColor: '#fff',
                   }}>
                     <TouchableOpacity onPress={() => navigation.goBack()}
                     style={{position: 'absolute', left: 10, top: -4}}>
                       <Feather name="arrow-left" size={27} color="black"  />
                     </TouchableOpacity>
       
                      <Text style= {{ fontSize: 15, color: '#000', fontFamily:"KronaOne", textTransform: 'uppercase', alignContent: 'center'}}>Notifications</Text>
                   </Header>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Text style={{ color: '#999', marginTop: 20 }}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3}}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
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
    padding: 18,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 15,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
