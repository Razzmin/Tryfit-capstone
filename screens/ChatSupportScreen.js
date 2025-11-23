import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BOT_NAME = "Tryfit Admin";
const CONVO_DELETED_KEY = "conversationDeleted";

const ChatSupportScreen = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const db = getFirestore(getApp());
  const auth = getAuth();
  const chatCollection = collection(db, "chatMessages");

  const convoDeletedRef = useRef(false);
  const isSending = useRef(false);

  useEffect(() => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    const fetchMessages = async () => {
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) return;

        const customUserId = userDocSnap.data().userId;

        const markAdminMessagesAsRead = async () => {
          const adminQuery = query(
            chatCollection,
            where("userId", "==", customUserId),
            where("sender", "==", "admin"),
            where("read", "==", false)
          );

          const snapshot = await getDocs(adminQuery);
          if (snapshot.empty) return;

          const batch = writeBatch(db);
          snapshot.forEach((docSnap) => {
            batch.update(docSnap.ref, { read: true });
          });

          await batch.commit();
          console.log("Admin messages marked as read.");
        };

        await markAdminMessagesAsRead();

        const q = query(
          chatCollection,
          where("userId", "==", customUserId),
          orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const loadedMessages = querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              messageId: data.messageId,
              text: data.text,
              sender: data.sender,
              userId: data.userId,
              username: data.username,
              timestamp: data.timestamp?.toDate?.() || new Date(),
              read: data.read ?? false,
            };
          });

          setMessages(loadedMessages);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  const sendMessage = async () => {
    console.log("Send button pressed");
    if (input.trim() === "") {
      console.log("Input empty, returning");
      return;
    }

    const user = auth.currentUser;
    console.log("Current user:", user?.uid || "no user");

    if (!user) {
      console.error("User not logged in");
      return;
    }

    isSending.current = true;
    console.log("Send button pressed");

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.error("No user document found!");
        return;
      }

      const userData = userDocSnap.data();
      const customUserId = userData.userId;
      const username = userData.username;
      const messageId = `MS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await addDoc(chatCollection, {
        messageId,
        text: input.trim(),
        sender: "user",
        userId: customUserId,
        username: username,
        read: false,
        timestamp: serverTimestamp(),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          messageId,
          text: input.trim(),
          sender: "user",
          userId: customUserId,
          username: username,
          read: false,
          timestamp: new Date(),
        },
      ]);

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setTimeout(() => {
        isSending.current = false;
      }, 1000);
    }
  };

  const deleteConversation = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;

      const customUserId = userDoc.data().userId;

      const q = query(chatCollection, where("userId", "==", customUserId));
      const snapshot = await getDocs(q);

      const batch = writeBatch(db);

      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();

      console.log("Conversation deleted from Firestore.");
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user" ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  const confirmDelete = async () => {
    await deleteConversation();
    await AsyncStorage.setItem(CONVO_DELETED_KEY, "true");

    setMessages([]);
    setModalVisible(false);
  };

  const closeModal = () => setModalVisible(false);
  const onStartConversation = async () => {
    await AsyncStorage.removeItem(CONVO_DELETED_KEY);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          closeModal();
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.navigate("LandingPage")}
            >
              <FontAwesome name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{BOT_NAME}</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="trash-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={closeModal}
          >
            <TouchableWithoutFeedback onPress={closeModal}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalText}>
                      Are you sure you want to delete the conversation?
                    </Text>
                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={[styles.modalBtn, styles.cancelBtn]}
                        onPress={closeModal}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalBtn, styles.confirmBtn]}
                        onPress={confirmDelete}
                      >
                        <Text style={styles.confirmBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
          >
            {messages.length === 0 && (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>
                  Start your conversation...
                </Text>
              </View>
            )}

            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.chatContainer}
              initialNumToRender={20}
              windowSize={10}
            />

            <View style={styles.inputContainer}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Type a message..."
                style={styles.textInput}
              />
              <TouchableOpacity
                style={[styles.sendBtn, isSending.current && { opacity: 0.5 }]}
                onPress={sendMessage}
                disabled={isSending.current}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  startContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  startBtn: {
    backgroundColor: "#9747FF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  startBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#dfcdf5ff",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#EAEAEA",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f1f1f1",
    alignItems: "center",
    borderTopwidth: 1,
    bordercolor: "#ddd",
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#9747FF",
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 9,
  },
  header: {
    flexDirection: "row",
    height: 70,
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  backBtn: {
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 30,
    padding: 20,
    borderRadius: 8,
    width: "80%",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 100,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#ccc",
  },
  confirmBtn: {
    backgroundColor: "#d9534f",
  },
  cancelBtnText: {
    color: "#333",
    fontWeight: "bold",
  },
  confirmBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  placeholderContainer: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  placeholderText: {
    color: "#999",
    fontSize: 24,
  },
});

export default ChatSupportScreen;
