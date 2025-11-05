import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Ionicons } from '@expo/vector-icons';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/130x180.png?text=No+Image';
const KNOWN_LABELS = ['t-shirt', 'longsleeve', 'shorts', 'pants'];

export default function SearchResults({ route, navigation }) {
  const { query } = route.params;
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');
  const [displayTerm, setDisplayTerm] = useState(query);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const allProducts = [];
      querySnapshot.forEach((doc) => {
        allProducts.push({ id: doc.id, ...doc.data() });
      });

      const lowerQuery = query.toLowerCase().trim();

      // ⚠️ If query is 3 characters or less
      if (lowerQuery.length > 0 && lowerQuery.length <= 3) {
        // Show random products
        const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
        const randomProducts = shuffled.slice(0, 10);
        setResults(randomProducts);
        setMessage(`No exact results for "${query}". Search results.`);
        setDisplayTerm(query);
        return;
      }

      // Normal logic for 4+ characters
      const directMatches = allProducts.filter((p) =>
        p.productName
          ?.toLowerCase()
          .replace(/[-\s]/g, '')
          .includes(lowerQuery.replace(/[-\s]/g, ''))
      );

      const categoryMatches = allProducts.filter((p) =>
        p.categorySub
          ?.toLowerCase()
          .replace(/[-\s]/g, '')
          .includes(lowerQuery.replace(/[-\s]/g, ''))
      );

      const combinedResults = [
        ...new Map(
          [...directMatches, ...categoryMatches].map((item) => [item.id, item])
        ).values(),
      ];

      if (combinedResults.length > 0) {
        setResults(combinedResults);
        setMessage('');
        setDisplayTerm(query);
      } else {
        const similarKeyword = getClosestMatch(lowerQuery, KNOWN_LABELS);
        const fuzzyMatches = allProducts.filter(
          (p) =>
            p.productName?.toLowerCase().includes(similarKeyword) ||
            p.categorySub?.toLowerCase().includes(similarKeyword)
        );

        if (fuzzyMatches.length > 0) {
          setResults(fuzzyMatches);
          setMessage(
            `No exact results for "${query}". Showing similar results for "${similarKeyword}".`
          );
        } else {
          setResults([]);
          setMessage(`No results found for "${query}".`);
          setDisplayTerm(query);
        }
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
    <ImageBackground
      source={require('../assets/bg.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View
          style={{
            width: '124%',
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            marginTop: 12,
            paddingHorizontal: 20,
            marginBottom: 30,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ position: 'absolute', left: 20, padding: 4 }}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 17,
              color: 'black',
              fontFamily: 'KronaOne',
              textTransform: 'uppercase',
              alignSelf: 'center',
              marginRight: 70,
            }}
          >
            {query}
          </Text>
        </View>

       
        <ScrollView contentContainerStyle={styles.grid}> 
        
        <Text style={styles.title}>Search Results for "{displayTerm}"</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}

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
                {/* ✅ FIXED: display productName instead of name */}
                <Text style={styles.name}>{product.productName}</Text>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  message: {
  fontSize: 13,
  color: '#555',
  paddingHorizontal: 20,
  marginBottom: 10,
  fontStyle: 'italic',
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
  noResults: {
    fontSize: 16,
    color: '#666',
    marginTop: 50,
    textAlign: 'center',
    width: '100%',
  },
});
