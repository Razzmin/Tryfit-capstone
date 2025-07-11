import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const mockData = [
      {
        id: '1',
        name: "Women's Y2K Long Sleeve Tops Shirt",
        price: 'P180',
        image: 'https://placehold.co/150x200?text=Y2K+Top',
        rating: 4.8,
        sold: '3.7K',
        delivery: '3-5 Days',
      },
      {
        id: '2',
        name: "Men's Black Cotton Top",
        price: 'P100',
        image: 'https://placehold.co/150x200?text=Men+Top',
        rating: 4.8,
        sold: '3.7K',
        delivery: '3-5 Days',
      },
      {
        id: '3',
        name: 'Women Black and White Gingham',
        price: 'P270',
        image: 'https://placehold.co/150x200?text=Gingham',
        rating: 4.1,
        sold: '7K',
        delivery: '3-5 Days',
      },
      {
        id: '4',
        name: 'Unisex Oversized Hoodie',
        price: 'P350',
        image: 'https://placehold.co/150x200?text=Oversized+Hoodie',
        rating: 4.9,
        sold: '5.2K',
        delivery: '3-5 Days',
      },
    ];
    setProducts(mockData);
  }, []);

  return (
    <LinearGradient colors={['hsl(266, 100%, 78%)', 'hsl(0, 0%, 100%)']} style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.header}>
            <Text style={styles.title}>TRYFIT</Text>
            <View style={styles.topRow}>
              <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
                <FontAwesome name="bars" size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity>
                <FontAwesome name="comments" size={24} color="#000" />
              </TouchableOpacity>
              <TextInput
                placeholder="Search..."
                style={styles.searchBar}
                placeholderTextColor="#888"
              />
            </View>
          </View>
          {isMenuOpen && (
            <Pressable style={styles.overlay} onPress={() => setIsMenuOpen(false)}>
              <View style={styles.sideMenu}>
                <Text style={styles.menuBrand}>CATEGORIES</Text>
                <View style={styles.menuGroup}>
                  <Text style={styles.menuItem}>Tops</Text>
                  <Text style={styles.subMenuItem}>T-Shirts</Text>
                  <Text style={styles.subMenuItem}>Longleeves</Text>
                </View>
                <View style={styles.menuGroup}>
                  <Text style={styles.menuItem}>Bottoms</Text>
                  <Text style={styles.subMenuItem}>Pants</Text>
                  <Text style={styles.subMenuItem}>Shorts</Text>
                </View>
              </View>
            </Pressable>
          )}
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <ScrollView horizontal style={styles.newArrivalsRow} showsHorizontalScrollIndicator={false}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.placeholderRect} />
            ))}
          </ScrollView>
          <Text style={styles.sectionTitle}>Popular</Text>
          <ScrollView horizontal style={styles.popularRow} showsHorizontalScrollIndicator={false}>
            {products.map(product => (
              <Image key={product.id} source={{ uri: product.image }} style={styles.largeCircle} />
            ))}
          </ScrollView>
          <Text style={styles.sectionTitle}>Our Picks for You</Text>
          <View style={styles.grid}>
            {products.map(product => (
              <View key={product.id} style={styles.card}>
                <Image source={{ uri: product.image }} style={styles.image} />
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.price}>{product.price}</Text>
                <Text style={styles.meta}>⭐ {product.rating} • {product.sold} Sold</Text>
                <Text style={styles.delivery}>🚚 {product.delivery}</Text>
              </View>
            ))}
          </View>
        </ScrollView>  
        <View style={styles.footerNav}>
        <TouchableOpacity onPress={() => setActiveTab('Home')}>
          <FontAwesome name="home" size={26} color={activeTab === 'Home' ? '#9747FF' : '#999'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Cart')}>
          <FontAwesome name="shopping-cart" size={26} color={activeTab === 'Cart' ? '#9747FF' : '#999'} />
        </TouchableOpacity>
        <TouchableOpacity 
        onPress={() => {
          setActiveTab('Orders');
          navigation.navigate('Orders');
        }}>
        <FontAwesome name="dropbox" size={26} color={activeTab === 'Orders' ? '#9747FF' : '#999'} />
        </TouchableOpacity>
        <TouchableOpacity
        onPress={() => {
          setActiveTab('Profile');
          navigation.navigate('Profile');
        }}
        >
        <FontAwesome name="user" size={26} color={activeTab === 'Profile' ? '#9747FF' : '#999'} />
        </TouchableOpacity>
      </View>
    </View>
    </LinearGradient>
  );
}
    const styles = StyleSheet.create({
    pageWrapper: { flex: 1 },
    scrollContent: { paddingBottom: 180 },
    header: { padding: 20 },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      textAlign: 'center',
      letterSpacing: 2,
      marginTop: 20,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      gap: 10,
    },
    searchBar: {
      flex: 1,
      padding: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#DEDEDE',
      color: '#000',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginHorizontal: 20,
      marginVertical: 10,
      paddingBottom: 15,
    },
    newArrivalsRow: { 
      paddingHorizontal: 20 
    },
    placeholderRect: {
      width: 130,
      height: 180,
      backgroundColor: '#ccc',
      borderRadius: 8,
      marginRight: 10,
    },
    popularRow: { 
      paddingHorizontal: 20 
    },
    largeCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginRight: 10,
      backgroundColor: '#DEDEDE',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    },
    card: {
      width: '48%',
      backgroundColor: '#f9f9f9',
      borderRadius: 10,
      padding: 10,
      marginBottom: 16,
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 10,
    },
    name: { 
      fontSize: 14, 
      fontWeight: 'bold' 
    },
    price: {
      color: '#9747FF',
      fontWeight: '600',
      marginVertical: 4,
    },
    meta: { 
      fontSize: 12, 
      color: '#555' 
    },
    delivery: { 
      fontSize: 12, 
      color: 'green' 
    },
    footerNav: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 110,
      backgroundColor: '#fff',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingTop: 10,
      paddingBottom: 50,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 10,
      zIndex: 999,
      },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      zIndex: 99,
    },
    sideMenu: {
      width: '70%',
      height: '100%',
      backgroundColor: 'rgba(162, 89, 251, 0.91)',
      paddingTop: 50,
      paddingHorizontal: 20,
      zIndex: 10,
    },
    menuBrand: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '500',
      marginBottom: 30,
    },
    menuGroup: { 
      marginBottom: 30 
    },
    menuItem: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
      paddingVertical: 18,
      paddingHorizontal: 10,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 8,
      marginBottom: 10,
    },
    subMenuItem: {
      fontSize: 16,
      color: '#eee',
      paddingLeft: 20,
      paddingVertical: 15,
      marginBottom: 6,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 6,
    },
  });
