// BodyTracking.js
import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Platform, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const BodyTracking = () => {
  const webviewRef = useRef(null);
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      console.log("✅ Logged in user UID:", user.uid);
      setUid(user.uid);
      setLoading(false);
    } else {
      Alert.alert('⚠️ User not signed in', 'Please sign in before proceeding.');
    }
  }, []);

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // Handle proceed to home action
      if (data.action === 'proceedHome') {
        navigation.navigate('LandingPage'); // Make sure 'LandingPage' exists in your navigator
        return;
      }

      console.log('📩 Received measurements:', data);

      Alert.alert(
        '✅ Measurements Received',
        `Height: ${data.height} cm
Weight: ${data.weight} kg
Waist: ${data.waist} cm
Shoulder: ${data.shoulder} cm
Chest: ${data.chest} cm
Hips: ${data.hips} cm
Bust: ${data.bust} cm
Top Size: ${data.topSize}
Bottom Size: ${data.bottomSize}`
      );
    } catch (error) {
      console.warn('Invalid message from WebView:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  // Append UID to the HTML file URL
  const htmlUri =
    Platform.OS === 'ios'
      ? `file:///html/mediapipe.html?uid=${uid}`
      : `file:///android_asset/html/mediapipe.html?uid=${uid}`;

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ uri: htmlUri }}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        startInLoadingState={true}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
});

export default BodyTracking;
