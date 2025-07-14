// Checkout.js
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function Checkout({ route }) {
  const { selectedItems = [], total = 0 } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <FlatList
        data={selectedItems}
        keyExtractor={(item) => item.id + item.color}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>Color: {item.color}</Text>
            <Text style={styles.itemDetails}>₱{item.price} × {item.quantity}</Text>
          </View>
        )}
      />

      <Text style={styles.total}>Total: ₱{total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDetails: {
    fontSize: 14,
    color: '#555',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    textAlign: 'right',
  },
});
