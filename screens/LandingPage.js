import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import {FontAwesome, EvilIcons, Ionicons, Feather }  from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { collection, getDocs, getDoc, doc, query, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  TouchableWithoutFeedback,
  BackHandler, 
  Alert,
} from 'react-native'; 

import { CartContext } from '../content/shoppingcartcontent';

import Fuse from 'fuse.js';  // <-- Import Fuse for fuzzy search

const colors = {
  bg: "#382a47",
  purple: "#9747FF",
  main: "#1f1926",
  text: "#bba1d4",
  white: "#EDEDED",
};

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/130x180.png?text=No+Image';

const SEARCH_SUGGESTIONS = ['T-shirt', 'Longsleeves', 'Pants', 'Shorts'];

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [activeTab, setActiveTab] = useState(global.activeTab || 'Home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation = useNavigation();
  const { cartItems } = useContext(CartContext);
  const isFocused = useIsFocused();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      global.activeTab = 'Home';
      setActiveTab('Home');
    }
  }, [isFocused]);
  const [searchSuggestions, setSearchSuggestions] = useState(SEARCH_SUGGESTIONS);
  const [popularProducts, setPopularProducts] = useState([]);


  useEffect(() => {
    const interval = setInterval(() => {
      if (global.activeTab && global.activeTab !== activeTab) {
        setActiveTab(global.activeTab);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

    const scaleAnim = useMemo(() => ({
      Home: new Animated.Value(1),
      Cart: new Animated.Value(1),
      Orders: new Animated.Value(1),
      Profile: new Animated.Value(1),
    }), []);

      const handleTabPress = (tab, navigateTo) => {
        global.activeTab= tab;
        setActiveTab(tab);

        Animated.sequence([
          Animated.timing(scaleAnim[tab], {toValue: 1.2, duration: 150, useNativeDriver: true}),
          Animated.timing(scaleAnim[tab], {toValue: 1, duration: 150, useNativeDriver: true}),
        ]).start();

        if(navigateTo) navigation.navigate(navigateTo);
      };

  // Memoize Fuse instance to avoid recreation on each render
  const fuse = useMemo(() => new Fuse(SEARCH_SUGGESTIONS, {
    includeScore: true,
    threshold: 0.4,
  }), []);

useEffect(() => {
  // 🔹 Our Picks (price <= 250)
  const unsubscribeProducts = onSnapshot(
    collection(db, 'products'),
    (querySnapshot) => {
      const allProducts = [];

      querySnapshot.forEach((doc) => {
        const product = doc.data();

        let numericPrice = null;
        if (product.price) {
          numericPrice =
            typeof product.price === 'string'
              ? parseInt(product.price.replace(/[^\d]/g, ''))
              : product.price;
        }

        let numericSold = null;
        if (product.sold) {
          numericSold =
            typeof product.sold === 'string'
              ? parseInt(product.sold.replace(/[^\d]/g, ''))
              : product.sold;
        }

        if (numericPrice !== null && numericPrice <= 250) {
          allProducts.push({ id: doc.id, ...product, price: numericPrice, sold: numericSold });
        }
      });

      setProducts(allProducts);
    },
    (error) => console.error('Error fetching products:', error)
  );

  // 🔹 New Arrivals (createdAt within last 31 days)
  const unsubscribeNewArrivals = onSnapshot(
    collection(db, 'products'),
    (querySnapshot) => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 31);

      const newProducts = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.createdAt) return;

        const createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        if (createdAt >= oneMonthAgo) {
          newProducts.push({
            id: docSnap.id,
            productID: data.productID,
            productName: data.productName,
            price: data.price,
            rating: data.rating,
            sold: data.sold,
            delivery: data.delivery,
            categoryMain: data.categoryMain,
            categorySub: data.categorySub,
            sizes: data.sizes,
            stock: data.stock,
            colors: data.colors,
            imageUrl: data.imageUrl,
            description: data.description,
            createdAt: data.createdAt,
            arUrl: data.arUrl || null,
          });
        }
      });

      setNewArrivals(newProducts);
    },
    (error) => console.error('Error fetching new arrivals:', error)
  );

  // 🔹 Popular Products (sold >= 1000)
  const unsubscribePopular = onSnapshot(
    collection(db, 'products'),
    (querySnapshot) => {
      const popularProductsList = [];

      querySnapshot.forEach((doc) => {
        const product = doc.data();

        let numericSold = null;
        if (product.sold) {
          numericSold =
            typeof product.sold === 'string'
              ? parseInt(product.sold.replace(/[^\d]/g, ''))
              : product.sold;
        }

        if (numericSold !== null && numericSold >= 1000) {
          popularProductsList.push({ id: doc.id, ...product, sold: numericSold });
        }
      });

      setPopularProducts(popularProductsList);
    },
    (error) => console.error('Error fetching popular products:', error)
  );

  // 🔹 Product Names for Search Suggestions
  const unsubscribeNames = onSnapshot(
    collection(db, 'products'),
    (querySnapshot) => {
      const names = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.productName) names.push(data.productName);
      });

      const mergedSuggestions = Array.from(
        new Set([...SEARCH_SUGGESTIONS, ...names])
      );
      setSearchSuggestions(mergedSuggestions);
    },
    (error) => console.error('Error fetching product names:', error)
  );

  // Cleanup listeners on unmount
  return () => {
    unsubscribeProducts();
    unsubscribeNewArrivals();
    unsubscribePopular();
    unsubscribeNames();
  };
}, []);

    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          Alert.alert(
            'Exit App',
            'Do you want to exit?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', onPress: () => BackHandler.exitApp() },
            ],
            { cancelable: true }
          );
          return true; // prevent default behavior
        };

        // Add event listener and get subscription
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        // Cleanup using subscription.remove()
        return () => subscription.remove();
      }, [])
    );

  const handleSearchSubmit = () => {
    if (searchText.trim().length > 0) {
      navigation.navigate('SearchResults', { query: searchText.trim() });
      setFilteredSuggestions([]);
      setSearchText('');
    }
  };

  const handleSearchChange = (text) => {
    setSearchText(text);

    if (text.length === 0) {
      setFilteredSuggestions([]);
      return;
    }

  const results = fuse.search(text);
    const matches = results.map(result => result.item);
    setFilteredSuggestions(matches);
    };

  const handleSuggestionPress = (suggestion) => {
    setSearchText(suggestion);
    setFilteredSuggestions([]);
    navigation.navigate('SearchResults', { query: suggestion });
    setSearchText('');
  };

  const handleCategoryPress = (categoryKey) => {
    setIsMenuOpen(false);
    navigation.navigate('CategoryProducts', { categoryKey });
  };

  return (
    <LinearGradient colors={['hsl(266, 100%, 79%)', 'hsl(0, 0%, 100%)']} style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.header}>
            <Text style={styles.title}>TRYFIT</Text>
            <View style={styles.topRow}>
             
              <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
              <FontAwesome name="bars" size={25} color="#000" />
              </TouchableOpacity>

              <View style={{ flex: 1, position: 'relative'}}>
               <EvilIcons
               name="search"
                size={29} 
                color="black" 
                  style= {{
                    position: 'absolute',
                    left: 5,
                    top: '40%',
                    transform: [{ translateY: -10}],
                    zIndex: 5,
                  }}
                />
                <TextInput
                  placeholder="Search..."
                  style={[styles.searchBar, {paddingLeft: 40, fontSize: 14}]}
                  placeholderTextColor="#888"
                  value={searchText}
                  onChangeText={handleSearchChange}
                  onSubmitEditing={handleSearchSubmit}
                />
                {filteredSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {filteredSuggestions.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleSuggestionPress(item)}
                        style={styles.suggestionItem}
                      >
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              
              <TouchableOpacity onPress={() => navigation.navigate('ChatSupport')}>
                <Ionicons name="chatbubbles-outline" size={28} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          {isMenuOpen && (
            <>
              {/* overlay that closes the menu when tapping outside */}
              <Pressable style={styles.overlay} onPress={() => setIsMenuOpen(false)} />

              {/* the actual side menu, separate from the overlay */}
              <View style={styles.sideMenu}>
                <Text style={styles.menuBrand}>CATEGORIES</Text>

                <View style={styles.menuGroup}>
                  <Text style={styles.menuItem}>Tops</Text>
                  <TouchableOpacity onPress={() => handleCategoryPress('tshirts')}>
                    <Text style={styles.subMenuItem}>T-Shirts</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleCategoryPress('longsleeve')}>
                    <Text style={styles.subMenuItem}>Longsleeves</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.menuGroup}>
                  <Text style={styles.menuItem}>Bottoms</Text>
                  <TouchableOpacity onPress={() => handleCategoryPress('pants')}>
                    <Text style={styles.subMenuItem}>Pants</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleCategoryPress('shorts')}>
                    <Text style={styles.subMenuItem}>Shorts</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}


          {/* New Arrivals */}
          <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { categoryKey: 'latest' })}>
            <Text style={styles.sectionTitle}>New Arrivals</Text>
          </TouchableOpacity>
          <ScrollView horizontal style={styles.newArrivalsRow} showsHorizontalScrollIndicator={false}>
            {newArrivals.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.newArrivalCard}
                onPress={() => navigation.navigate('ProductDetail', { product })}
              >
                <Image source={{ uri: product.imageUrl || PLACEHOLDER_IMAGE }} style={styles.newImage} />
               <View style={styles.newLabel}>
                <Text style={styles.newLabelText}>NEW</Text>
              </View>

              </TouchableOpacity>
            ))}
          </ScrollView>

         {/* Popular */}
          <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { categoryKey: 'popular' })}>
            <Text style={styles.sectionTitle}>Popular</Text>
          </TouchableOpacity>
          <ScrollView horizontal style={styles.popularRow} showsHorizontalScrollIndicator={false}>
            {popularProducts.map(product => (
              <TouchableOpacity
                key={product.id}
                style={styles.popularCard}
                onPress={() => navigation.navigate('ProductDetail', { product })}
              >
                <Image
                  source={{ uri: product.imageUrl || PLACEHOLDER_IMAGE }}
                  style={styles.popularImage}
                />
                <Text style={styles.popularNameText}>
                  {product.productName?.length > 16 ? product.productName.slice(0, 14) + '…' : product.productName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>



          {/* Our Picks - show ALL products always */}
          <Text style={styles.sectionTitle}>Our Picks for You</Text>
          <View style={styles.grid}>
            {products.map(product => (
              <TouchableOpacity
                key={product.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate('ProductDetail', {
                    product: {
                      ...product,
                      images: [product.imageUrl],
                      colors: product.colors || [] 
                    },
                  })
                }
              >
                <Image
                  source={{ uri: product.imageUrl || PLACEHOLDER_IMAGE }}
                  style={styles.image}
                />
                <Text style={styles.name}>{product.productName}</Text>
                <Text style={styles.price}>{product.price}</Text>
                <Text style={styles.meta}>⭐ {product.rating} • {product.sold} Sold</Text>
                <Text style={styles.delivery}>🚚 {product.delivery}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footerNav}>
            {['Home', 'Cart', 'Orders', 'Profile'].map((tab) => {
              const icons = {Home: 'home', Cart: 'shopping-cart', Orders: 'dropbox', Profile: 'user'};
              const navigateTo = { Home: null, Cart: 'ShoppingCart', Orders: 'Orders', Profile: 'Profile'}[tab];
           

          return (
            <TouchableWithoutFeedback key={tab} onPress={() => handleTabPress(tab, navigateTo)}>
            <Animated.View style ={{ transform: [{scale: scaleAnim[tab]}], alignItems: 'center'}}>
            <FontAwesome 
            name= {icons[tab]}
            size={26} 
            color={activeTab === tab ? '#9747FF' : '#999'} 
            />
            {tab === 'Cart' && cartItems.length > 0 && (
              <Text style = {{ fontSize: 12, color:'#9747FF', fontWeight: 'bold'}}>
                {cartItems.length}
              </Text>
            )}
            </Animated.View>
            </TouchableWithoutFeedback>
          );
           })}
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
    fontSize: 27,
    textAlign: 'center',
    marginTop: 30,
    fontFamily: "KronaOne",
    marginBottom: 10,
    textTransform: 'uppercase',
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
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    color: '#000',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingBottom: 15,
    fontFamily: "KronaOne",
  },
  newArrivalsRow: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  newArrivalCard: {
    position: 'relative',
    marginRight: 10,
  },
  newImage: {
    width: 130,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  newLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3D00',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
    elevation: 3,
  },
  newLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  popularRow: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  popularCard: {
    width: 120,
    alignItems: 'center',
    marginRight: 12,
  },
  popularImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DEDEDE',
    marginBottom: 6,
  },
  popularNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
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
    fontWeight: 'bold',
  },
  price: {
    color: '#9747FF',
    fontWeight: '600',
    marginVertical: 4,
  },
  meta: {
    fontSize: 12,
    color: '#555',
  },
  delivery: {
    fontSize: 12,
    color: 'green',
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
  backgroundColor: 'rgba(0,0,0,0.2)',
  zIndex: 99,
  elevation: 99, // Android
},

sideMenu: {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  width: '70%',
  backgroundColor: 'rgba(162, 89, 251, 0.91)',
  paddingTop: 50,
  paddingHorizontal: 20,
  zIndex: 100,     // must be above overlay
  elevation: 100,  // Android
},

  menuBrand: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 30,
  },
  menuGroup: {
    marginBottom: 30,
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

  searchBar: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.main,
    backgroundColor: '#DEDEDE',
    color: '#000',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 45,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopWidth: 0,
    zIndex: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
});
