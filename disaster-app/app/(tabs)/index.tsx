import AlertCard from '@/components/AlertCard';
import DisasterList from '@/components/DisasterList'; // ✅ import the new component
import PreparednessScore from '@/components/PreparednessScore';
import { RiskCard } from '@/components/Riskcard';
import WeatherCard from '@/components/WeatherCard';
import { getDisasterAlerts } from '@/utils/Data';
import { useSetupStore } from '@/utils/setup';
import { FontAwesome6 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  const { coords, location } = useSetupStore();
  const [data, setData] = useState<any>(null);
    const {Exit} = useSetupStore()

  const TEST_DISASTER = null;

  useEffect(() => {
    if (!coords) return;
    getDisasterAlerts(coords.lat, coords.lon)
      .then(setData)
      .catch(console.error);
  }, [coords]);

  if (!data) return null;

  let alertsForCard = data.alerts.map((alertTitle: string) => {
    let riskLevel = 0;
    switch (alertTitle) {
      case 'Flood Risk': riskLevel = data.risk.flood; break;
      case 'Storm Risk': riskLevel = data.risk.storm; break;
      case 'Heatwave Risk': riskLevel = data.risk.heat; break;
      case 'Earthquake Risk': riskLevel = data.risk.earthquake; break;
      default: riskLevel = 0;
    }
    return { title: alertTitle, riskLevel };
  });

  if (TEST_DISASTER) {
    let testRiskLevel = 0;
    switch (TEST_DISASTER) {
      case 'Flood Risk': testRiskLevel = 85; break;
      case 'Storm Risk': testRiskLevel = 78; break;
      case 'Heatwave Risk': testRiskLevel = 92; break;
      case 'Earthquake Risk': testRiskLevel = 67; break;
      default: testRiskLevel = 70;
    }
    alertsForCard = [{ title: TEST_DISASTER, riskLevel: testRiskLevel }];
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: 30 }}
      contentContainerStyle={{ padding: 12 }}
    >
      <StatusBar style="light" />

      {/* LOCATION */}
      <View style={{ marginBottom: 20, flexDirection: "row", alignItems: "center" }}>
        <FontAwesome6 name="location-dot" color="#3B82F6" size={20} />
        <View style={{ marginLeft: 16 }}>
          <Text style={{ fontSize: 10, color: "#A5A5A5" }}>Your Location</Text>
          <Text style={{ color: "black", fontSize: 12, fontWeight: "bold" }}>
            {location?.district}, {location?.city}
          </Text>
        </View>
      </View>

      {/* WEATHER */}
      <WeatherCard weather={data.weather} location={location} />

      {/* DISASTER ALERTS */}
      <RiskCard data={data} />
      <AlertCard alerts={alertsForCard} />

      {/* ✅ DISASTER ROWS (with icons and survival modal) */}
      <DisasterList />
       <Button title="Exit" onPress={Exit} />
      <PreparednessScore />
    </ScrollView>
  );
}