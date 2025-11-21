import { useNavigation, useRoute } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SwiperFlatList } from "react-native-swiper-flatlist";

const { width } = Dimensions.get("window");

export default function BodyMeasurement() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, username, email } = route.params || {};
  const animationRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isNextProcessing, setIsNextProcessing] = useState(false);
  const [isProceedProcessing, setIsProceedProcessing] = useState(false);

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
    if (isNextProcessing) return;
    setIsNextProcessing(true);

    if (!userId) {
      Alert.alert("Error", "User ID is missing. Please go back and try again.");
      setIsNextProcessing(false);
      return;
    }

    setModalVisible(true);
    setTimeout(() => setIsNextProcessing(false), 300);
  };

  const confirmProceed = () => {
    if (isProceedProcessing) return;
    setIsProceedProcessing(true);

    setModalVisible(false);
    navigation.navigate("BodyTracking", { userId, username, email });

    setTimeout(() => setIsProceedProcessing(false), 500);
  };

  const cancelProceed = () => {
    setModalVisible(false);
  };

  const steps = [
    {
      title: "Step 1 - Input Your Measurements",
      text: "Enter your basic body measurements in Smart Setup. You can also try the optional calibration to get more accurate size results.",
      animation: require("../assets/animations/using mobile phone.json"),
    },
    {
      title: "Step 2 - Stand Inside the Frame",
      text: "On the next screen, make sure your whole body fits inside the box. Stay in a bright area so the camera can track you clearly.",
      animation: require("../assets/animations/humanbody01.json"),
    },
    {
      title: "Step 3 - View Your Results",
      text: "After scanning, your measurements and best-fit sizes will appear. You can always retake them later if needed.",
      animation: require("../assets/animations/tape measure.json"),
    },
  ];

  return (
    <ImageBackground
      source={require("../assets/bg.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Body Measurement</Text>
        </View>

        <SwiperFlatList
          showPagination
          paginationStyle={styles.paginationDot}
          paginationDefaultColor="#ebdfff"
          paginationActiveColor="#9747FF"
          index={0}
          autoplay={false}
          paginationStyleItem={{ width: 10, height: 10, marginHorizontal: 7 }}
          data={steps}
          renderItem={({ item, index }) => (
            <View style={styles.cardContainer}>
              <View style={styles.card}>
                <View style={styles.animationWrapper}>
                  <LottieView
                    source={item.animation}
                    autoPlay
                    loop
                    style={styles.animation}
                  />
                  {index === 1 && <View style={styles.scanFrame} />}
                </View>

                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.infoText}>{item.text}</Text>

                {index === steps.length - 1 && (
                  <TouchableOpacity
                    style={[
                      styles.button,
                      isNextProcessing && { opacity: 0.6 },
                    ]}
                    onPress={handleNext}
                    disabled={isNextProcessing}
                  >
                    <Text style={styles.buttonText}>
                      {isNextProcessing ? "Processing..." : "Next"}
                    </Text>
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
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Allow Camera Access</Text>
              <Text style={styles.modalText}>
                This feature needs access to your camera to measure your body
                proportions accurately.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.proceedButton,
                    isProceedProcessing && { opacity: 0.6 },
                  ]}
                  onPress={confirmProceed}
                  disabled={isProceedProcessing}
                >
                  <Text style={styles.proceedText}>
                    {isProceedProcessing ? "Processing..." : "Proceed"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={cancelProceed}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
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
  overlay: {
    flex: 1,
    paddingVertical: 80,
  },
  header: {
    alignItems: "center",
    marginBottom: -90,
  },
  title: {
    fontSize: 18,
    color: "#1f1926",
    fontFamily: "KronaOne",
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 2,
  },
  cardContainer: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  stepTitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
    color: "#1f1926",
    textAlign: "center",
    fontFamily: "KronaOne",
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
    backgroundColor: "#fff",
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
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  proceedButton: {
    backgroundColor: "#9747FF",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  proceedText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  cancelText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
  },
});
