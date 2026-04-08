import { RiskCard } from '@/components/Riskcard';
import { getDisasterAlerts } from '@/utils/Data';
import { useSetupStore } from '@/utils/setup';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

export default function HomeScreen() {
  const { Exit, coords, location } = useSetupStore();
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    if (coords) {
      getDisasterAlerts(coords.lat, coords.lon).then(setWeatherData);
    }
  }, [coords]);

  return (
    <View>
      <Text>Hello Home</Text>

      {location && (
        <Text>
          Location: 
          {location.district && `${location.district}, `}
          {location.city && `${location.city}, `}
          {location.region}
        </Text>
      )}

      {weatherData && (
        <View>
          <Text>
            Temperature: {Math.round(weatherData.weather.temp)}°C
          </Text>          
          <Text>Wind Speed: {weatherData.weather.wind} km/h</Text>
          <Text>Humidity: {weatherData.weather.humidity}%</Text>
          {weatherData.alerts.length > 0 && (
            <Text>Warnings: {weatherData.alerts.join(', ')}</Text>
          )}
        </View>
      )}
      
      {weatherData && <RiskCard data={weatherData} />}
      <Button
        title="Onboard Again"
        onPress={Exit} // Reset setup state to show onboarding again
      />

      <Link href="/icons" style={{ color: 'blue' }}>
        Go to icons
      </Link>

      <Link href="/Inventory" style={{ color: 'blue' }}>
        Go to Inventory
      </Link>
      <Link href="/check_List" style={{ color: 'blue' }}>
        Go to Checklist
      </Link>
    </View>
  );
}