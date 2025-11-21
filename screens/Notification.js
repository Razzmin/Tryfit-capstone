import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/styles";

export default function Notification() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const auth = getAuth();
  const db = getFirestore();
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    let unsubscribe;

    const fetchNotifications = async () => {
      const user = auth.currentUser;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) return;

        const customUserId = userDoc.data().userId;

        const q = query(
          collection(db, "notifications"),
          where("userId", "==", customUserId)
        );

        unsubscribe = onSnapshot(q, async (snapshot) => {
          const notifs = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());

          setNotifications(notifs);

          const unreadDocs = snapshot.docs.filter(
            (docSnap) => !docSnap.data().read
          );

          await Promise.all(
            unreadDocs.map((docSnap) => {
              const notifRef = doc(db, "notifications", docSnap.id);
              return updateDoc(notifRef, { read: true });
            })
          );
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
        return (
          <Ionicons name="checkmark-done-circle" size={20} color="#FF9800" />
        );
      default:
        return <Ionicons name="notifications-outline" size={20} color="#888" />;
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;

    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              await Promise.all(
                notifications.map((notif) =>
                  deleteDoc(doc(db, "notifications", notif.id))
                )
              );

              setNotifications([]);
            } catch (err) {
              console.error("Failed to clear notifications:", err);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
          paddingBottom: 10,
          backgroundColor: "#fff",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: "absolute", left: 10, top: -4 }}
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
          Notifications
        </Text>

        {notifications.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAll}
            style={{ position: "absolute", right: 10, top: -4 }}
          >
            <Text style={{ color: "red", fontWeight: "bold" }}>Clear All</Text>
          </TouchableOpacity>
        )}
      </Header>

      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <ActivityIndicator size="large" color="#9747FF" />
          <Text style={{ color: "#fff", marginTop: 10 }}>
            Deleting notifications...
          </Text>
        </View>
      )}

      {notifications.length === 0 ? (
        <Text style={{ color: "#999", marginTop: 20 }}>
          No notifications yet.
        </Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationBox}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
              >
                {getIcon(item.type)}
                <Text style={styles.message}>{item.message}</Text>
              </View>
              <Text style={styles.timestamp}>
                {item.timestamp?.toDate().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
    backgroundColor: "#fff",
    paddingTop: 30,
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
  notificationBox: {
    padding: 18,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    marginBottom: 15,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
});
