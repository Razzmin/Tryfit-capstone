import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/130x180.png?text=No+Image';
const KNOWN_LABELS = ['t-shirt', 'longsleeve', 'shorts', 'pants'];

export default function SearchResults({ route, navigation }) {
  const { query } = route.params;
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const allProducts = [];
        querySnapshot.forEach((doc) => {
          allProducts.push({ id: doc.id, ...doc.data() });
        });

        const lowerQuery = query.toLowerCase();
        const directMatches = allProducts.filter((p) =>
          p.name?.toLowerCase().includes(lowerQuery)
        );

        if (directMatches.length > 0) {
          setResults(directMatches);
          setMessage('');
        } else {
          const similarKeyword = getClosestMatch(lowerQuery, KNOWN_LABELS);
          const fuzzyMatches = allProducts.filter((p) =>
            p.name?.toLowerCase().includes(similarKeyword)
          );

          setResults(fuzzyMatches);
          setMessage(`No results for "${query}". Showing results for "${similarKeyword}".`);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [query]);

  const getClosestMatch = (input, options) => {
    let closest = options[0];
    let minDistance = levenshtein(input, closest);

    for (let i = 1; i < options.length; i++) {
      const dist = levenshtein(input, options[i]);
      if (dist < minDistance) {
        closest = options[i];
        minDistance = dist;
      }
    }
    return closest;
  };

  const levenshtein = (a, b) => {
    const matrix = Array.from({ length: a.length + 1 }, () =>
      Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        matrix[i][j] =
          a[i - 1] === b[j - 1]
            ? matrix[i - 1][j - 1]
            : Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
      }
    }

    return matrix[a.length][b.length];
  };

  return (
    <LinearGradient
      colors={['hsl(266, 100%, 78%)', 'hsl(0, 0%, 100%)']}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Search Results for "{query}"</Text>
        {message !== '' && <Text style={styles.message}>{message}</Text>}

        <ScrollView contentContainerStyle={styles.grid}>
          {results.length > 0 ? (
            results.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate('ProductDetail', {
                    product: {
                      ...product,
                      images: [product.imageUrl],
                      colors: ['#FF0000', '#00FF00', '#0000FF'],
                    },
                  })
                }
              >
                <Image
                  source={{ uri: product.imageUrl || PLACEHOLDER_IMAGE }}
                  style={styles.image}
                />
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.price}>{product.price}</Text>
                <Text style={styles.meta}>
                  ⭐ {product.rating} • {product.sold} Sold
                </Text>
                <Text style={styles.delivery}>🚚 {product.delivery}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResults}>No products found.</Text>
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  backButton: {
    marginLeft: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  message: {
    fontSize: 14,
    color: '#555',
    paddingHorizontal: 20,
    marginBottom: 10,
    fontStyle: 'italic',
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
  noResults: {
    fontSize: 16,
    color: '#666',
    marginTop: 50,
    textAlign: 'center',
    width: '100%',
  },
});
