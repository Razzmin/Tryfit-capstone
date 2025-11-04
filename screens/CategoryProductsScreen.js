import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import GradientBackground from '../components/gradientbackground';
import {
  StyledContainer,
  InnerContainer,
  Colors,
} from '../components/styles';

import {
  FilterScroll,
  FilterButton,
  FilterButtonText,
  ProductListWrapper,
} from '../components/popularstyles';

import {
  ProductCard,
  ProductImage,
  ProductName,
  ProductPrice,
  ProductMeta,
  ProductDelivery,
} from '../components/cardstyle';

import { db } from '../firebase/config';
import { collection, getDocs, query, where, doc, getDoc, Timestamp } from 'firebase/firestore';

const categories = [
  { label: 'Popular', key: 'popular', filter: null },
  { label: 'Latest', key: 'latest', filter: 'latest' },
  { label: 'T-shirts', key: 'tshirts', filter: { categoryMain: 'top', categorySub: 't-shirt' } },
  { label: 'Longsleeve', key: 'longsleeve', filter: { categoryMain: 'top', categorySub: 'longsleeves' } },
  { label: 'Shorts', key: 'shorts', filter: { categoryMain: 'bottom', categorySub: 'shorts' } },
  { label: 'Pants', key: 'pants', filter: { categoryMain: 'bottom', categorySub: 'pants' } },
];

const CategoryProductsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const categoryKey = route.params?.categoryKey || 'popular';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = categories.find(cat => cat.key === categoryKey) || categories[0];

  useEffect(() => {
  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (currentCategory.key === 'latest') {
        // Fetch recent products from recentActivityLogs from last month
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const logsRef = collection(db, 'recentActivityLogs');
        const logsQuery = query(logsRef, where('timestamp', '>=', Timestamp.fromDate(oneMonthAgo)));
        const logsSnapshot = await getDocs(logsQuery);

        const productIdsSet = new Set();
        logsSnapshot.forEach(logDoc => {
          const data = logDoc.data();
          if (data.productId) productIdsSet.add(data.productId);
        });

        const productIds = Array.from(productIdsSet);
        const fetchedProducts = [];
        for (const productId of productIds) {
          const productDocRef = doc(db, 'products', productId);
          const productDoc = await getDoc(productDocRef);
          if (productDoc.exists()) fetchedProducts.push({ id: productDoc.id, ...productDoc.data() });
        }
        setProducts(fetchedProducts);
      } else if (currentCategory.key === 'popular') {
        // Popular: fetch products with sold >= 1000
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetchedProducts = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(product => (product.sold ?? 0) >= 1000);
        setProducts(fetchedProducts);
      } else {
        // Filter products by categoryMain and categorySub
        const querySnapshot = await getDocs(collection(db, 'products'));
        const filteredProducts = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item =>
            item.categoryMain?.toLowerCase() === currentCategory.filter.categoryMain &&
            item.categorySub?.toLowerCase() === currentCategory.filter.categorySub
          );
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error(`Error fetching ${currentCategory.label} products:`, error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [currentCategory]);


 return (
   <ImageBackground
          source={require('../assets/bg.png')}
          resizeMode="cover"  
          style={{flex: 1}}
          >
    <StyledContainer style={{ flex: 1, justifyContent: "flex-start" }}>
      <StatusBar style="dark" />
      <InnerContainer style={{ flex: 1, justifyContent: "flex-start" }}>
        
        {/* Header */}
        <View
          style={{
            width: "124%",
            height: 50,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            marginTop: 12,
            paddingHorizontal: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ position: "absolute", left: 20, padding: 4 }}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 17,
              fontWeight: "bold",
              color: "black",
              fontFamily: "KronaOne",
              textTransform: "uppercase",
              alignSelf: 'center',
            }}
          >
            {currentCategory.label}
          </Text>
        </View>

        {/* Categories Filter */}
        <FilterScroll
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle= {{
          paddingHorizontal: 10,
          alignItems: 'center',
          }}
          style={{ marginVertical: 10, alignSelf: 'center', width: '120%' }}
        >
          {categories.map((cat) => {
            const isActive = cat.key === currentCategory.key;
            return (
            <FilterButton
              key={cat.key}
              onPress={() =>
                navigation.navigate("CategoryProducts", { categoryKey: cat.key })
              }
              style={{
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: isActive ? '#9747FF' : '#000',
                paddingVertical: 10,
                minWidth: 80,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FilterButtonText
                style={{
                 color: 'black', fontSize: 14
                }}
              >
                {cat.label}
              </FilterButtonText>
            </FilterButton>
          );
          })}
        </FilterScroll>

        {/* Product List */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.brand}
            style={{ marginTop: 40 }}
          />
        ) : products.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No {currentCategory.label} products found.
          </Text>
        ) : (
          <ProductListWrapper style={{ flex: 1 }}>
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 8,
                paddingBottom: 20, 
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ProductDetail", { product: item })
                  }
                  activeOpacity={0.85}
                  style={{
                    flex: 1,
                    margin: 8,
                    maxWidth: "47%",
                    flexShrink: 0,
                  }}
                >
                  <ProductCard style={{ backgroundColor: "#edebebff" }}>
                    {item.imageUrl ? (
                      <ProductImage
                        source={{ uri: item.imageUrl }}
                        resizeMode="cover"
                        style={{ height: 180 }}
                      />
                    ) : (
                      <View style={{ height: 180, backgroundColor: "#ccc" }} />
                    )}

                    <ProductName style={{ marginTop: 10 }}>
                      {item.productName || "Unnamed"}
                    </ProductName>
                    <ProductPrice>₱{item.price ?? "N/A"}</ProductPrice>
                    <ProductMeta>
                      ⭐ {item.rating ?? "-"} • {item.sold ?? "0"} Sold
                    </ProductMeta>
                    <ProductDelivery>
                      🚚 {item.delivery ?? "N/A"}
                    </ProductDelivery>
                  </ProductCard>
                </TouchableOpacity>
              )}
            />
          </ProductListWrapper>
        )}
      </InnerContainer>
    </StyledContainer>
  </ImageBackground>
);

};

export default CategoryProductsScreen;
