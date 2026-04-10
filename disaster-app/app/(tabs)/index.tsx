import AlertCard from '@/components/AlertCard'; // make sure the path is correct
import { RiskCard } from '@/components/Riskcard';
import WeatherCard from '@/components/WeatherCard';
import { getDisasterAlerts } from '@/utils/Data';
import { useSetupStore } from '@/utils/setup';
import { FontAwesome6 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';

export default function HomeScreen() {
  const { coords, location } = useSetupStore();
  const [data, setData] = useState<any>(null);

  // ========== TEST MODE: override to see a specific disaster ==========
  // Set this to one of: 'Flood Risk', 'Storm Risk', 'Heatwave Risk', 'Earthquake Risk'
  // Set to null to use real data from the API
  // const TEST_DISASTER = 'Flood Risk';   // <-- CHANGE THIS TO TEST OTHER DISASTERS
  // const TEST_DISASTER = 'Storm Risk';
  // const TEST_DISASTER = 'Heatwave Risk';
  // const TEST_DISASTER = 'Earthquake Risk';
  const TEST_DISASTER = null;        // use real data
  // ====================================================================

  useEffect(() => {
    if (!coords) return;

    getDisasterAlerts(coords.lat, coords.lon)
      .then(setData)
      .catch(console.error);
  }, [coords]);

  if (!data) return null;

  // Transform real alerts from the risk engine
  let alertsForCard = data.alerts.map((alertTitle: string) => {
    let riskLevel = 0;
    switch (alertTitle) {
      case 'Flood Risk':
        riskLevel = data.risk.flood;
        break;
      case 'Storm Risk':
        riskLevel = data.risk.storm;
        break;
      case 'Heatwave Risk':
        riskLevel = data.risk.heat;
        break;
      case 'Earthquake Risk':
        riskLevel = data.risk.earthquake;
        break;
      default:
        riskLevel = 0;
    }
    return { title: alertTitle, riskLevel };
  });

  // 🧪 Override with test disaster if TEST_DISASTER is set
  if (TEST_DISASTER) {
    let testRiskLevel = 0;
    switch (TEST_DISASTER) {
      case 'Flood Risk':
        testRiskLevel = 85;
        break;
      case 'Storm Risk':
        testRiskLevel = 78;
        break;
      case 'Heatwave Risk':
        testRiskLevel = 92;
        break;
      case 'Earthquake Risk':
        testRiskLevel = 67;
        break;
      default:
        testRiskLevel = 70;
    }
    alertsForCard = [{ title: TEST_DISASTER, riskLevel: testRiskLevel }];
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: 50 }}
      contentContainerStyle={{ padding: 12 }}
    >
      <StatusBar style="light" />

      {/* LOCATION */}
      <Text style={{ color: "black", marginBottom: 20 }}>
          <FontAwesome6 name="location-dot" style={{color: "#3B82F6"}} /> {location?.district}, {location?.city}
      </Text>

      {/* WEATHER */}
      <WeatherCard weather={data.weather} location={location} />

      {/* DISASTER ALERTS (test override or real data) */}
      <AlertCard alerts={alertsForCard} />
      <RiskCard data={data}/>

    </ScrollView>
  );
}