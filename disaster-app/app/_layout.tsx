import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { useSetupStore } from '@/utils/setup';
import { View } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};
// main
export default function RootLayout() {
  const { isSetuped } = useSetupStore();

  return (

       <View style={{ flex: 1, }}>
        <Stack
          screenOptions={{
            headerShown: false,

          }}
        >
          <Stack.Protected guard={!isSetuped}>
            <Stack.Screen 
              name="onboarding" 
              options={{ 
                headerShown: false,
              }} 
            />
          </Stack.Protected>

          <Stack.Protected guard={isSetuped}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>
        </Stack>
      </View>

  );
}