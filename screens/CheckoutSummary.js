import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Image,
 } from "react-native";

 //icons
 import Entypo from '@expo/vector-icons/Entypo';

export default function CheckoutSummary() {
  const navigation = useNavigation();
  const route = useRoute();
  const { total = 0} = route.params || {};

  return (
    <View style = {styles.container}>
        <View style = {styles.header}>  
        </View>
        <View style = {styles.topSection}>
        <Image source={require('./../assets/confetti7.png')}
        style={styles.confettiImage}
        resizeMode="contain"
        />
        </View>
        <View style = {{alignItems: "center", justifyContent:"center"}}>
        <Text style = {styles.orderText}>Order Completed!</Text>
        <Text style = {styles.orderNumber}>Order number: #110V3U</Text>
       </View>

        <View style = { styles.summaryContainer}> 
            <View style = {styles.summaryRow}>
            <Text style = {styles.itemText}>Ordered Items</Text>
            <Entypo name="dots-two-horizontal" size={24} color="black"/>
             </View>
            <View style = {styles.summaryRow}>
            <Text style = {styles.itemTotal}>Order</Text>
            <Text style = {styles.itemTotal}> ₱{total}</Text>
            </View>
        
        <View style = {styles.summaryRow}>
         <Text style = {styles.itemTotal}>Delivery</Text>
            <Text style = {styles.itemTotal}> ₱58</Text>
           </View>
        
          <View style = {styles.summaryRow}>
          <Text style = {styles.itemText}>Summary</Text>
            <Text style = {styles.itemText}> ₱{total+ 58}</Text>
          </View>
        </View>

          <View style = {{alignItems:"center"}}>
        <TouchableOpacity style = {styles.continueButton} onPress={() => navigation.navigate('LandingPage')}>
        <Text style = {styles.continueText}>Continue Shopping</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style = {styles.orderButton}>
        <Text style = {styles.continueText}>ewan pa</Text>  
        </TouchableOpacity>
      </View>
    </View>

)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  topSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  confettiImage: {
    width: 130,
    height: 130,
    marginVertical: 50,
    marginBottom: 40,
  },
  orderText: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  orderNumber: {
    fontSize: 13,
    color: '#515151ff',
    marginTop:5,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#000000ff',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 11,
  },
  itemText: {
    color:  '#000000ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemTotal: {
    color:  '#000000ff',
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: '#9747FF',
    paddingVertical: 20,
    borderRadius: 10,
    width: '95%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  continueText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 17,
    color: '#ffffffff',
  },
  orderButton: {
    backgroundColor: '#A9A9A9',
    paddingVertical: 20,
    borderRadius: 10,
    width: '95%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffffffff',
  },
});