// BodyTracking.js
import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Platform, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';

const BodyTracking = () => {
  const webviewRef = useRef(null);
  const route = useRoute();
  const navigation = useNavigation();
  const auth = getAuth();

  const [authUid, setAuthUid] = useState(null);
  const { userId } = route.params || {}; // custom U000x id from signup

  useEffect(() => {
    const current = auth.currentUser;
    if (current && current.uid) {
      setAuthUid(current.uid);
    } else {
      Alert.alert('Auth required', 'No logged-in user found. Please sign in again.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, []);

  if (!authUid || !userId) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9747FF" />
      </View>
    );
  }

  const htmlUri =
    Platform.OS === 'ios'
      ? `file:///html/mediapipe.html?uid=${encodeURIComponent(authUid)}&userId=${encodeURIComponent(userId)}`
      : `file:///android_asset/html/mediapipe.html?uid=${encodeURIComponent(authUid)}&userId=${encodeURIComponent(userId)}`;

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // If mediapipe asks to proceed home
      if (data.action === 'proceedHome') {
        navigation.replace('LandingPage');
        return;
      }

      // Otherwise treat as measurement object (log only — no popup)
      console.log('📩 Measurements received from WebView:', data);
      // ✅ Removed redundant Alert to prevent double popups
    } catch (err) {
      console.warn('Invalid message from WebView', err);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ uri: htmlUri }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        startInLoadingState
        renderLoading={() => <ActivityIndicator size="large" style={{ marginTop: 50 }} />}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1 },
});

export default BodyTracking;
