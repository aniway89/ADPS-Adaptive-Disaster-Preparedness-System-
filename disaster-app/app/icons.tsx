import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import {
  AlertIcon,
  calanderIcon,
  CheckIcon,
  cloudIcon,
  coldthermometerIcon,
  crossIcon,
  deleteIcon,
  HomeIcon,
  humidityIcon,
  hurricaneIcon,
  locationIcon,
  rainIcon,
  snowIcon,
  snowflakeIcon,
  sunIcon,
  thermometerIcon,
  thunderIcon,
  userIcon,
  windIcon,
  hotthermometerIcon,
} from '@/assets/svg';

const icons = [
  { name: 'Home', Icon: HomeIcon },
  { name: 'Check', Icon: CheckIcon },
  { name: 'Alert', Icon: AlertIcon },
  { name: 'Delete', Icon: deleteIcon },
  { name: 'Cross', Icon: crossIcon },
  { name: 'Calendar', Icon: calanderIcon },
  { name: 'Location', Icon: locationIcon },
  { name: 'User', Icon: userIcon },
  { name: 'Wind', Icon: windIcon },
  { name: 'Cloud', Icon: cloudIcon },
  { name: 'Rain', Icon: rainIcon },
  { name: 'Sun', Icon: sunIcon },
  { name: 'Snow', Icon: snowIcon },
  { name: 'Thunder', Icon: thunderIcon },
  { name: 'Humidity', Icon: humidityIcon },
  { name: 'Hurricane', Icon: hurricaneIcon },
  { name: 'Snowflake', Icon: snowflakeIcon },
  { name: 'Thermometer', Icon: thermometerIcon },
  { name: 'Cold Thermometer', Icon: coldthermometerIcon },
  { name: 'Hot Thermometer', Icon: hotthermometerIcon },
];

export default function IconsPage() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Icon Library</Text>
      <View style={styles.grid}>
        {icons.map(({ name, Icon }, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.iconBox}>
              <Icon size={32} color="#111" />
            </View>
            <Text style={styles.label}>{name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  },
});
