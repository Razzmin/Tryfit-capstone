// BodyTracking.js
import React, { useRef } from 'react';
import { StyleSheet, View, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

const BodyTracking = () => {
  const webviewRef = useRef(null);

  // Listen for messages from the HTML file
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📩 Received measurements:', data);

      // Display the result in an alert (you can replace this with navigation or storage)
      Alert.alert(
        '✅ Measurements Received',
        `
Height: ${data.height} cm
Weight: ${data.weight} kg
Waist: ${data.waist} cm

Shoulder: ${data.shoulder} cm
Chest: ${data.chest} cm
Hips: ${data.hips} cm
Bust: ${data.bust} cm

Top Size: ${data.topSize}
Bottom Size: ${data.bottomSize}
        `
      );
    } catch (error) {
      console.warn('Invalid message from WebView:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={
          Platform.OS === 'ios'
            ? require('../assets/mediapipe.html')
            : { uri: 'file:///android_asset/mediapipe.html' }
        }
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
    backgroundColor: '#000', // fullscreen black background
  },
  webview: {
    flex: 1,
  },
});

export default BodyTracking;
