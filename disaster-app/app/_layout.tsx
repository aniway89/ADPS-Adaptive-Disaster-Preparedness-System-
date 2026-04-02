import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSetupStore } from '@/utils/setup';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const {isSetuped} = useSetupStore(); // Replace with your actual setup check
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack.Protected guard={!isSetuped}>
          <Stack.Screen name="onboarding" options={{ headerShown: true }} />
        </Stack.Protected>
        <Stack.Protected guard={isSetuped}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
