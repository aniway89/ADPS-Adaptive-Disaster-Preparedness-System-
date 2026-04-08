import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { useSetupStore } from '@/utils/setup';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { isSetuped } = useSetupStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a', textcolor: '#fff' }}>
      
      {/* ✅ Force dark status bar */}
      <StatusBar style="light" />

      {/* ✅ Main container for consistent background */}
      <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f172a' }, // ✅ applies to all screens
          }}
        >
          <Stack.Protected guard={!isSetuped}>
            <Stack.Screen 
              name="onboarding" 
              options={{ 
                headerShown: true,
                headerStyle: { backgroundColor: '#020617' },
                headerTintColor: '#ffffff',
              }} 
            />
          </Stack.Protected>

          <Stack.Protected guard={isSetuped}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>
        </Stack>
      </View>

    </SafeAreaView>
  );
}