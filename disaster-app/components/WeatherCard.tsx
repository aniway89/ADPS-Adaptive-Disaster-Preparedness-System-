import { Text, View } from "react-native";

export default function WeatherCard({ weather, location }: any) {
  return (
    <View
      style={{
        backgroundColor: "#3B82F6",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 40, fontWeight: "bold", borderColor: "#FFFFFFCF", borderWidth: 2}}>
        {weather.temp}° <Text style={{ color: "#FFFFFFCF", fontSize: 24  }}>C</Text>
      </Text>

      <Text style={{ color: "#e0e0e0", marginTop: 5 }}>
        {weather.condition || "Partly Cloudy"}
      </Text>

      <Text style={{ color: "#fff", marginTop: 10 }}>
         {location?.district}
      </Text>
    </View>
  );
}