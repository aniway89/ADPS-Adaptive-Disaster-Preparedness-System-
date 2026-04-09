import { Tabs } from "expo-router";
import { View } from "react-native";
//app
export default function TabLayout() {
  return (
    <View style={{ flex: 1}}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            borderTopWidth: 0,      // removes the thin line
            elevation: 0,           // removes Android shadow
          },
        }}
      />
    </View>
  );
}