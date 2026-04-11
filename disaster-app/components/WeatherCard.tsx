import { Feather, Ionicons } from "@expo/vector-icons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Text, View } from "react-native";

// Map weather type strings to valid Ionicons names
const getWeatherIcon = (weatherType: string): keyof typeof Ionicons.glyphMap => {
  const type = weatherType.toLowerCase();

  if (type.includes("clear") || type === "sunny") return "sunny";
  if (type.includes("partly cloudy")) return "cloudy";
  if (type.includes("cloud")) return "cloud";
  if (type.includes("fog")) return "cloudy-night";
  if (type.includes("drizzle")) return "rainy";
  if (type.includes("rain")) return "rainy";
  if (type.includes("snow")) return "snow";
  if (type.includes("freezing")) return "ice-cream";        // distinct from snow
  if (type.includes("thunderstorm")) return "thunderstorm";
  if (type.includes("wind")) return "wind";        // valid icon
  if (type.includes("hot")) return "thermometer";          // instead of flame

  return "partly-sunny"; // default fallback
};

export default function WeatherCard({ weather, location }: any) {
  const iconName = getWeatherIcon(weather.weatherType || "Partly Cloudy");

  return (
    <View
      style={{
        backgroundColor: "#3B82F6",
        borderRadius: 24,
        padding: 24,
        paddingVertical: 40,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "column", alignItems: "center" }}>
        <Text style={{ color: "#fff", fontSize: 40, fontWeight: "bold", marginLeft: 20 }}>
          {weather.temp}°<Text style={{ color: "#FFFFFFCF", fontSize: 30 }}></Text>
        </Text>

        <Text style={{ color: "#E5E5E5", marginTop: 5, fontSize: 12,marginBottom:5}}>
         <Feather name="wind"/> {weather.wind}Km/h |  <Ionicons name="water" style={{color:"#E5E5E5"}}/> {weather.humidity}%
        </Text>

        <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold"}}>
          <FontAwesome6 name="location-dot" size={10} color="#FFFFFF"  />  {location?.district}
        </Text>
      </View>

      <View style={{
        alignItems:"center"
      }}>
        <Ionicons name={iconName} size={50} color="#FFFFFF" />
        <Text style={{ color: "#F8F8F8", marginTop: 5, fontSize: 14 }}>
          {weather.weatherType || "Partly Cloudy"}
        </Text>
      </View>
    </View>
  );
}