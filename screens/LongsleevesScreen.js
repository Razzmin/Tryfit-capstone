import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
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
import { collection, getDocs } from 'firebase/firestore';

const categories = [
  { label: 'Popular', screen: 'PopularProducts' },
  { label: 'Latest', screen: 'LatestProducts' },
  { label: 'T-shirts', screen: 'TShirtsScreen' },
  { label: 'Longsleeve', screen: 'LongsleevesScreen' },
  { label: 'Shorts', screen: 'ShortsScreen' }, 
  { label: 'Pants', screen: 'PantsScreen' },
  
];

const LongsleevesScreen = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetchedProducts = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            item =>
              item.categoryMain?.toLowerCase() === 'top' &&
              item.categorySub?.toLowerCase() === 'longsleeves'
          );

        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching longsleeve products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <GradientBackground>
      <StyledContainer>
        <StatusBar style="dark" />
        <InnerContainer>
          {/* Header */}
          <View style={{
            width: '100%',
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                position: 'absolute',
                left: 10,
                padding: 8
              }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: 'black',
              textTransform: 'uppercase',
            }}>
              Longsleeves
            </Text>
          </View>

          {/* Categories */}
          <FilterScroll horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat, idx) => (
              <FilterButton
                key={idx}
                onPress={() => navigation.navigate(cat.screen)}
              >
                <FilterButtonText>{cat.label}</FilterButtonText>
              </FilterButton>
            ))}
          </FilterScroll>

          {/* Product List */}
          {loading ? (
            <ActivityIndicator size="large" color={Colors.brand} />
          ) : products.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>No Longsleeve products found.</Text>
          ) : (
            <ProductListWrapper>
              <FlatList
                data={products}
                keyExtractor={item => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <ProductCard style={{ backgroundColor: '#edebebff' }}>
                    {item.imageUrl ? (
                      <ProductImage source={{ uri: item.imageUrl }} resizeMode="cover" />
                    ) : (
                      <View style={{ height: 150, backgroundColor: '#ccc' }} />
                    )}
                    <ProductName>{item.name || 'Unnamed'}</ProductName>
                    <ProductPrice>₱{item.price ?? 'N/A'}</ProductPrice>
                    <ProductMeta>
                      ⭐ {item.rating ?? '-'} • {item.sold ?? '0'} Sold
                    </ProductMeta>
                    <ProductDelivery>🚚 {item.delivery ?? 'N/A'}</ProductDelivery>
                  </ProductCard>
                )}
              />
            </ProductListWrapper>
          )}
        </InnerContainer>
      </StyledContainer>
    </GradientBackground>
  );
};

export default LongsleevesScreen;
