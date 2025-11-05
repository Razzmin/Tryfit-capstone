import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { 
  getFirestore, collection, addDoc, query, orderBy, onSnapshot, where, doc, getDoc, serverTimestamp 
} from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';

const BOT_NAME = 'Tryfit Admin';
const CONVO_DELETED_KEY = 'conversationDeleted';

const ChatSupportScreen = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [started, setStarted] = useState(false);
  const navigation = useNavigation();

  const db = getFirestore(getApp());
  const auth = getAuth();
  const chatCollection = collection(db, 'chatMessages');

  const convoDeletedRef = useRef(false);

  // Fetch messages using custom userId
  useEffect(() => {
    let unsubscribe;

    const fetchMessages = async () => {
      const deletedFlag = await AsyncStorage.getItem(CONVO_DELETED_KEY);
      convoDeletedRef.current = deletedFlag === 'true';

      if (convoDeletedRef.current) {
        setMessages([]);
        setStarted(false);
        return;
      }

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          console.error('No user found in users collection!');
          return;
        }

        const customUserId = userDocSnap.data().userId;

        const q = query(
          chatCollection,
          where('userId', '==', customUserId),
          orderBy('timestamp', 'asc')
        );

        unsubscribe = onSnapshot(q, async (querySnapshot) => {
          const deletedNow = await AsyncStorage.getItem(CONVO_DELETED_KEY);
          convoDeletedRef.current = deletedNow === 'true';

          if (convoDeletedRef.current) {
            setMessages([]);
            setStarted(false);
            if (unsubscribe) unsubscribe();
            return;
          }

          const loadedMessages = [];
          querySnapshot.forEach(doc => {
            loadedMessages.push({ id: doc.id, ...doc.data() });
          });
          setMessages(loadedMessages);
          setStarted(loadedMessages.length > 0);
        });

      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Send message using custom userId
  const sendMessage = async () => {
    if (input.trim() === '') return;

    const user = auth.currentUser;
    if (!user) {
      console.error('User not logged in');
      return;
    }

    const userId = user.uid;
    const username = user.displayName || user.email || 'Anonymous';

    try {
      // Generate a unique message ID
      const messageId = `MS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const timestamp = Date.now();

      // Save message to Firestore
      const docRef = await addDoc(chatCollection, {
        messageId,        // ✅ unique messageId
        text: input,
        sender: 'user',
        userId,
        username,
        timestamp,
      });

      // Update local state immediately
      setMessages(prev => [
        ...prev,
        {
          id: docRef.id,
          messageId,      // ✅ store locally too
          text: input,
          sender: 'user',
          userId,
          username,
          timestamp,
        },
      ]);

      setStarted(true);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };


  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  const confirmDelete = async () => {
    setMessages([]);
    setStarted(false);
    setModalVisible(false);
    await AsyncStorage.setItem(CONVO_DELETED_KEY, 'true');
  };

  const closeModal = () => setModalVisible(false);
  const onStartConversation = async () => {
    setStarted(true);
    await AsyncStorage.removeItem(CONVO_DELETED_KEY);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff'}}>

     <KeyboardAvoidingView
     style={{flex: 1}}
       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
       keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
         >
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); closeModal(); }}>
          
          <View style={{flex: 1}}>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('LandingPage')}>
                <FontAwesome name="arrow-left" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{BOT_NAME}</Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Ionicons name="trash-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Confirmation Modal */}
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
                        <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={closeModal}>
                          <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={confirmDelete}>
                          <Text style={styles.confirmBtnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>

            {/* Start Conversation Button */}
            {!started && messages.length === 0 && (
              <View style={styles.startContainer}>
                <TouchableOpacity style={styles.startBtn} onPress={onStartConversation}>
                  <Text style={styles.startBtnText}>Start Conversation</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Chat Messages */}
            {started && (
              <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.chatContainer}
              />
            )}

            {/* Input Box */}
            {started && (
              <View style={styles.inputContainer}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Type a message..."
                  style={styles.textInput}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                  <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  chatContainer: { 
    padding: 16, 
    paddingBottom: 80 
  },
  startContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  startBtn: { 
    backgroundColor: '#007AFF', 
    paddingVertical: 12, 
    paddingHorizontal: 30, 
    borderRadius: 25 
  },
  startBtnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  messageContainer: { 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10, 
    maxWidth: '80%' 
  },
  userMessage: { 
    alignSelf: 'flex-end', 
    backgroundColor: '#DCF8C6' 
  },
  botMessage: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#EAEAEA' 
  },
  messageText: { 
    fontSize: 16 
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0, left: 0, 
    right: 0, 
    flexDirection: 'row', 
    padding: 10, 
    backgroundColor: '#f1f1f1',
    
  },
  textInput: { 
    flex: 1, 
    height: 40, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    backgroundColor: '#fff' 
  },
  sendBtn: { 
    marginLeft: 10, 
    backgroundColor: '#007AFF', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: { 
    flexDirection: 'row', 
    height: 70, alignItems: 'center', 
    paddingHorizontal: 16, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc', 
    justifyContent: 'space-between' 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  backBtn: { 
    marginRight: 10 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    marginHorizontal: 30, 
    padding: 20, 
    borderRadius: 8, 
    width: '80%' 
  },
  modalText: { 
    fontSize: 16, 
    marginBottom: 20, 
    textAlign: 'center', 
    color: '#333' 
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  modalBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 24, 
    borderRadius: 20, 
    minWidth: 100, 
    alignItems: 'center' 
  },
  cancelBtn: { 
    backgroundColor: '#ccc' 
  },
  confirmBtn: { 
    backgroundColor: '#d9534f' 
  },
  cancelBtnText: { 
    color: '#333', 
    fontWeight: 'bold' 
  },
  confirmBtnText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
});

export default ChatSupportScreen;
