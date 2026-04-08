import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EmergencyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency</Text>
      <Text style={styles.text}>This page is a placeholder route so the app can render the Emergency screen correctly.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
  },
});
