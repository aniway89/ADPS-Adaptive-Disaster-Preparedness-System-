import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,

          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
          },

          tabBarActiveTintColor: "#000",
          tabBarInactiveTintColor: "#888",

          tabBarIcon: ({ color, size, focused }) => {
            let iconName: any = "ellipse-outline"; // fallback (never blank)

            switch (route.name) {
              case "index":
                iconName = focused ? "home" : "home-outline";
                break;

              case "Emergency":
                iconName = focused ? "alert-circle" : "alert-circle-outline";
                break;

              case "Inventory":
                iconName = focused ? "file-tray-stacked" : "file-tray-stacked-outline";
                break;
            }

            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen
          name="Emergency"
          options={{ title: "Emergency" }}
        />
        <Tabs.Screen name="Inventory" options={{ title: "Inventory" }} />
      </Tabs>
    </View>
  );
}