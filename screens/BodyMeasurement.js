// BodyMeasurement.js
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function BodyMeasurement() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, username, email } = route.params || {};

  useEffect(() => {
    if (!userId || !username || !email) {
      console.warn("⚠️ Missing user data in BodyMeasurement");
      Alert.alert(
        "Missing Information",
        "Some user information is missing. Please go back and try signing up again.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } else {
      console.log("✅ BodyMeasurement received:", { userId, username, email });
    }
  }, [userId, username, email]);

  const handleNext = () => {
    if (!userId) {
      Alert.alert("Error", "User ID is missing. Please go back and try again.");
      return;
    }

    navigation.navigate("BodyTracking", {
      userId,
      username,
      email,
    });
  };

  return (
    <LinearGradient
      colors={["hsl(266, 100%, 79%)", "hsl(0, 0%, 100%)"]}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        {/* Header */}
        <TouchableOpacity style={styles.header} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={18} color="black" />
          <Text style={styles.title}>Body Measurements</Text>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.infoText}>
            In the next screen, we will use your camera to automatically capture your
            body measurements including Shoulder-width, Chest-width, Hips, and Bust.
          </Text>

          <Text style={styles.infoText}>
            These measurements will be used to recommend the best-fitting clothing sizes
            for your body, so you get accurate and comfortable fits every time.
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f1926",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 16,
    padding: 25,
  },
  infoText: {
    fontSize: 16,
    color: "#1f1926",
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#9747FF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
