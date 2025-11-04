// BodyMeasurement.js
import React, { useEffect, useRef, useState } from "react";
import { View,
   Text,
    TouchableOpacity,
     StyleSheet, 
     Alert,
    ImageBackground,
  Dimensions,
   Modal, 
   Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");

export default function BodyMeasurement() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, username, email } = route.params || {};
  const animationRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);

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
    setModalVisible(true);
  };

  const confirmProceed = () => {
    setModalVisible(false);
    navigation.navigate("BodyTracking", {
      userId,
      username,
      email,
    });
  };

  const cancelProceed = () => {
    setModalVisible(false);
  };

  const steps = [
    {
      title: "Step 1 - Input Your Measurements",
      text: "Enter your basic body measurements in Smart Setup. You can also try the optional calibration to get more accurate size results.",
      animation: require("../assets/animations/using mobile phone.json")
    },
    {
      title: "Step 2 - Stand Inside the Frame",
      text: "On the next screen, make sure your whole body fits inside the box. Stay in a bright area so the camera can track you clearly.",
      animation: require("../assets/animations/humanbody01.json")
    },
    {
      title: "Step 3 - View Your Results",
      text: "After scanning, your measurements and best-fit sizes will appear. You can always retake them later if needed.",
      animation: require("../assets/animations/tape measure.json")
    },
  ]
  return (
     <ImageBackground
        source={require('../assets/bg.png')}
        style={{ flex: 1}}
        resizeMode="cover">
    
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Body Measurement</Text>
        </View>

        <SwiperFlatList
        showPagination paginationStyle={styles.paginationDot}
        paginationDefaultColor="#ebdfff"
        paginationActiveColor="#9747FF"
        index={0}
        autoplay = {false}
        paginationStyleItem={{width: 10, height: 10, marginHorizontal: 7}}
        data={steps}
        renderItem={({ item, index }) => (
          <View style={styles.cardContainer}>
           <View style = {styles.card}>
            <View style={styles.animationWrapper}>
          <LottieView
          source={item.animation}
          autoPlay loop style={styles.animation}/>

          {/**made rectangle border for animation 2 */}
          {index === 1 && <View style={styles.scanFrame} />}
          </View>

          <Text style={styles.stepTitle}>{item.title}</Text>
          <Text style={styles.infoText}>{item.text}</Text>

          {index === steps.length - 1 && (
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
        )}
          </View>
          </View>
        )}
        />

        <Modal 
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Allow Camera Access</Text>
              <Text style={styles.modalText}>
                This feature needs access to your camera to measure your body proportions accurately.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, {backgroundColor: "#9747FF" }]}
                onPress={confirmProceed}>
                  <Text style={styles.modalButtonText}>Proceed</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.modalButton, {backgroundColor: "#717171" }]}
                onPress={cancelProceed}>
                <Text style={[styles.modalButtonText, { color: "#000000" }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    paddingVertical: 80,
  },
  header: {
    alignItems: "center",
    marginBottom: -90
  },
  title: {
    fontSize: 18,
    color: "#1f1926",
    fontFamily: "KronaOne"
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    alignSelf: "center",
    width: width * 0.85,
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    elevation: 2,
  },
  cardContainer: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  animationWrapper: {
    position: "relative",
    justifyContent: "center",
    alignContent: "center"
  },
  stepTitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
    color: "#1f1926",
    textAlign: "center",
    fontFamily: "KronaOne"
  },
  infoText: {
    fontSize: 16,
    color: "#1f1926",
    marginBottom: 20,
    textAlign: "center",
  },
  animation: {
    width: 180,
    height: 180,
  },
  paginationDot: {
    marginHorizontal: 3,
    position: "absolute",
    bottom: 70,
  },
  button: {
    backgroundColor: "#9747FF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    width: "80%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  animationWrapper: {
    justifyContent: "center",
    alignItems: "center",
    height: 250,
    width: "100%",
    position: "relative",
  },
  scanFrame: {
    position: "absolute",
    width: 80,
    height: 135,
    borderWidth: 2,
    borderColor: "#1f1926",
    borderRadius: 10,
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#ffff",
    width: "80%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f1926",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 15,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#ffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
