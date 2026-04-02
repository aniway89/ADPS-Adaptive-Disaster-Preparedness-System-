import { useSetupStore } from '@/utils/setup';
import { Button, Text, View } from 'react-native';


export default function OnboardscreenScreen() {
    const { setIsSetuped } = useSetupStore();
  return (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Hello Onboard</Text>
      <Button title="ONboard" onPress={setIsSetuped} />
    </View>
  );
}

