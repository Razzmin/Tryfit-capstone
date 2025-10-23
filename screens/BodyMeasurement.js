// BodyMeasurement.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function BodyMeasurement() {
  const navigation = useNavigation();

  const handleNext = () => {
    // Navigate to BodyTracking.js
    navigation.navigate("BodyTracking");
  };

  return (
    <LinearGradient
      colors={["hsl(266, 100%, 79%)", "hsl(0, 0%, 100%)"]}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.header} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={18} color="black" />
          <Text style={styles.title}>Body Measurements</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.infoText}>
            In the next screen, we will use your camera to automatically capture your
            body measurements including Shoulder-width, Chest-width, Hips, and Bust.
          </Text>

          <Text style={styles.infoText}>
            These measurements will be used to recommend the best-fitting clothing sizes
            for your body, so you get accurate and comfortable fits every time.
          </Text>

          {/* Next Button */}
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
