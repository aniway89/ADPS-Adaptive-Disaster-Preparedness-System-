import { useSetupStore } from '@/utils/setup';
import { Link } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function HomeScreen() {
  const { Exit } = useSetupStore();

  return (
    <View>
      <Text>Hello Home</Text>

      <Button
        title="Onboard Again"
        onPress={Exit} // Reset setup state to show onboarding again
      />

      <Link href="/Emergency" style={{ color: 'blue' }}>
        Go to Emergency
      </Link>

      <Link href="/Inventory" style={{ color: 'blue' }}>
        Go to Inventory
      </Link>
      <Link href="/checklist" style={{ color: 'blue' }}>
        Go to Checklist
      </Link>
    </View>
  );
}