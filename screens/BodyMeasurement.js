// BodyMeasurement.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function BodyMeasurement() {
  const navigation = useNavigation();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");

  const handleNext = () => {
    if (!height || !weight || !waist) {
      alert("Please fill in all fields.");
      return;
    }
    navigation.navigate("BodyTracking", {
      height,
      weight,
      waist,
    });
  };

  return (
    <LinearGradient
      colors={["hsl(266, 100%, 79%)", "hsl(0, 0%, 100%)"]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity
            style={styles.header}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="arrow-left" size={18} color="black" />
            <Text style={styles.title}>Input Basic Measurements</Text>
          </TouchableOpacity>

          <View style={styles.form}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
              placeholder="e.g. 170"
            />

            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g. 60"
            />

            <Text style={styles.label}>Waistline (cm)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={waist}
              onChangeText={setWaist}
              placeholder="e.g. 80"
            />

            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    flexGrow: 1,
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
  form: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 16,
    padding: 25,
  },
  label: {
    fontSize: 16,
    color: "#1f1926",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 20,
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
