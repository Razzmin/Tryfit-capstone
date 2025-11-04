import { View, Text, StyleSheet, 
  TouchableOpacity,
   Image,
    ScrollView } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import {
  Header,
} from '../components/styles';

export default function TrackOrder() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
        <Header style = {{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 16,
                        paddingBottom: 10,
                        backgroundColor: '#fff',
                      }}>
                      <TouchableOpacity onPress={() => navigation.goBack()}
                      style={{position: 'absolute', left: 10, top: -4}}>
                      <Feather name="arrow-left" size={27} color="black"  />
                      </TouchableOpacity>
                         <Text style= {{ fontSize: 15, color: '#000', fontFamily:"KronaOne", textTransform: 'uppercase', alignContent: 'center'}}>Track Order</Text>
                      </Header>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Product Card */}
        <View style={styles.card}>
        <View style = {{ paddingLeft: 10}}>
          <Image
            source={{ uri: 'https://placehold.co/80x80' }}
            style={styles.cardImage}
          />
           <Text style={styles.orderId}>Order ID: 154789361</Text>
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.productName}>Y2K Long Sleeve Top</Text>
            <Text style={styles.productSize}>Size: S</Text>
            <Text style={styles.productQty}>Qty: 1</Text>
            <Text style={styles.productPrice}>₱180</Text>
          </View>
          
        </View>

        {/* Tracking Steps */}
        <Text style={styles.trackTitle}>Track Your Order</Text>

        <View style={styles.timeline}>
          {/* Step 1 */}
          <View style={styles.step}>
            <View style={styles.stepDotFilled} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Order Placed</Text>
              <Text style={styles.stepDesc}>We have received your order.</Text>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.step}>
            <View style={styles.stepDotFilled} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Order Packed</Text>
              <Text style={styles.stepDesc}>Your product is packed and ready for shipment.</Text>
              <Text style={styles.stepEstimate}>Estimated delivery on July 10-14, 2025.</Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={styles.step}>
            <View style={styles.stepDot} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Out for delivery</Text>
              <Text style={styles.stepDesc}>Your order is on the way to you.</Text>
            </View>
          </View>

          {/* Step 4 */}
          <View style={styles.step}>
            <View style={styles.stepDot} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Order Delivered</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1ff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingVertical: 10,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#ccc',
    marginTop: 10,
    marginBottom: 30,
  },
  cardInfo: {
    marginLeft: -10,
    marginBottom: 40,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  productPrice: {
    color: '#9747FF',
    fontWeight: '700',
    marginTop: 7,
  },
  productSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3
  },
  productQty: {
    fontSize: 12,
    color: '#666',
  },
  orderId: {
    fontSize: 13,
    color: '#777',
    marginTop: -2,
    marginLeft: -10,

  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  timeline: {
    marginLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#D9D9D9',
    paddingLeft: 20,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  stepDot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#D9D9D9',
    marginRight: 15,
    marginTop: 4,
  },
  stepDotFilled: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#9747FF',
    marginRight: 15,
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: '600',
    fontSize: 17,
  },
  stepEstimate: {
    fontSize: 12,
    color: '#9747FF',
    marginTop: 8,
  },
  stepDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 7,
  },
});
