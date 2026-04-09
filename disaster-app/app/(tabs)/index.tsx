import RecentEventCard from '@/components/RecentEventCard';
import WarningList from '@/components/WarningList';
import WeatherCard from '@/components/WeatherCard';
import { getDisasterAlerts } from '@/utils/Data';
import { useSetupStore } from '@/utils/setup';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';

export default function HomeScreen() {
  const { coords, location } = useSetupStore();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!coords) return;

    getDisasterAlerts(coords.lat, coords.lon)
      .then(setData)
      .catch(console.error);
  }, [coords]);

  if (!data) return null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0B0F1A", paddingTop: 50 }}
      contentContainerStyle={{ padding: 16 }}
    >
      <StatusBar style="light" />

      {/* LOCATION */}
      <Text style={{ color: "#aaa", marginBottom: 10 }}>
        📍 {location?.city}, {location?.district}
      </Text>

      {/* WEATHER */}
      <WeatherCard weather={data.weather} location={location} />

      {/* RECENT EVENT */}
      <RecentEventCard alerts={data.alerts} />

      {/* WARNINGS */}
      <WarningList risk={data.risk} />

    </ScrollView>
  );
}