import { useSetupStore } from '@/utils/setup';
import { Link } from 'expo-router';
import { Button, Text, View } from 'react-native';


export default function HomeScreen() {
    const { Exit } = useSetupStore();
  return (
    <View>
      <Text>Hello Home</Text>
      <Button title="ONboard" onPress={Exit} />
      <Link href="/Emergency" style={{ color: 'blue' }}>
        Go to Emergency
      </Link>
    </View>
  );
}

