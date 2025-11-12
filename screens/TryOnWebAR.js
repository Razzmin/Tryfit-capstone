import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity,Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function TryOnWebAR({ route }) {
  const { arUrl } = route.params;
  const webRef = useRef(null);
  const navigation = useNavigation();

  const [showNotif, setShowNotif] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { 
  const delayTimer = setTimeout(() => {
    setShowNotif(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const hideTimer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowNotif(false));
    }, 3000);

    return () => clearTimeout(hideTimer);
  }, 500);

  return () => clearTimeout(delayTimer);
}, []);

  if (!arUrl) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ color: "#fff" }}>No AR link found for this product.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Notification Popup */}
      {showNotif && (
        <Animated.View style={[styles.notifPopup, { opacity: fadeAnim }]}>
          <Text style={styles.notifText}>
            This AR experience may take a few moments to load. Please be patient.
          </Text>
        </Animated.View>
      )}

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#fff" />
          <Text style={styles.headerText}>Back to Product</Text>
        </TouchableOpacity>
      </View>

      {/* WebView section */}
      <View style={styles.webContainer}>
        <WebView
          ref={webRef}
          source={{ uri: arUrl }}
          originWhitelist={["*"]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#9747FF" />
            </View>
          )}
          style={styles.webview}
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  notifPopup: {
    position: "absolute",
    top: "40%",
    left: 20,
    right: 20,
    backgroundColor: "#9747FF",
    padding: 16,
    borderRadius: 12,
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  notifText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  header: {
    backgroundColor: "#9747FF",
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  webContainer: {
    flex: 1,
    backgroundColor: "#000",
    paddingBottom: 60,
  },
  webview: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});