import React, { useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import LottieView from "lottie-react-native";

export default function SplashScreen({ navigation }) {
  const animationRef = useRef(null);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require("../assets/animations/splassh1.json")}
        autoPlay
        loop={false}
        resizeMode="cover"
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#382a47",
  },
  animation: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
