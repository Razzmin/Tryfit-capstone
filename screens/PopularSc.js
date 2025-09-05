import React from 'react';
import { FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { View } from 'react-native';
import { Text } from 'react-native';
import {
  BackArrowWrapper,
  BackArrowtIcon,
  BackText,
} from '../components/styles';

import GradientBackground from '../components/gradientbackground';
import {
  StyledContainer,
  InnerContainer,
  PageTitle,
  Colors,
} from '../components/styles';

import {
  ProductCard,
  ProductImage,
  ProductName,
  ProductPrice,
  ProductMeta,
  ProductDelivery,
  FilterScroll,
  FilterButton,
  FilterButtonText,
  ProductListWrapper,
} from '../components/popularstyles'; // we'll define this next

const categories = [
  { label: 'Shorts', screen: 'ShortsScreen' },
  { label: 'Blouse', screen: 'BlouseScreen' },
  { label: 'Off shoulders', screen: 'OffShouldersScreen' },
  { label: 'Cargo Pants', screen: 'CargoPantsScreen' },
  { label: 'T-shirts', screen: 'TShirtsScreen' },
];

const products = [
  {
    id: '1',
    name: 'Trim Long Sleeve Body-con Dress',
    image: require('../assets/dress.jpg'),
    price: 600,
    rating: 3.8,
    sold: '2.6K',
    delivery: '3-5 Days'
  },
  {
    id: '2',
    name: 'Tailored High Waist Wide Leg Pants',
    image: require('../assets/jumpsuit.jpg'),
    price: 450,
    rating: 3.9,
    sold: '4K',
    delivery: '3-5 Days'
  },
  {
    id: '3',
    name: 'Men’s Oversized Maroon Shirt',
    image: require('../assets/Shirt.jpg'),
    price: 250,
    rating: 4.8,
    sold: '3.7K',
    delivery: '3-5 Days'
  },
  {
    id: '4',
    name: 'Double Lining Off Shoulder Top',
    image: require('../assets/offshoulder.jpg'),
    price: 170,
    rating: 4.9,
    sold: '10.7K',
    delivery: '3-5 Days'
  },
];

const PopularProducts = () => {
  const navigation = useNavigation();

  return (
    <GradientBackground>
      <StyledContainer>
        <StatusBar style="dark" />
        <InnerContainer>
            <View style={{ 
                width: '100%', 
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                }}>
                {/* Back Arrow on the left */}
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

                {/* Centered Title */}
                <Text style={{ 
                    fontSize: 18, 
                    fontWeight: 'bold', 
                    color: 'black', 
                    textTransform: 'uppercase',
                }}>
                    CARGO PANTS
                </Text>
            </View>


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


          <ProductListWrapper>
            <FlatList
              data={products}
              keyExtractor={item => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <ProductCard>
                  <ProductImage source={item.image} resizeMode="cover" />
                  <ProductName>{item.name}</ProductName>
                  <ProductPrice>₱{item.price}</ProductPrice>
                  <ProductMeta>⭐ {item.rating} • {item.sold} Sold</ProductMeta>
                  <ProductDelivery>🚚 {item.delivery}</ProductDelivery>
                </ProductCard>
              )}
            />
          </ProductListWrapper>
        </InnerContainer>
      </StyledContainer>
    </GradientBackground>
  );
};

export default PopularProducts;
