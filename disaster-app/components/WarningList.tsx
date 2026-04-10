import { ScrollView, Text, View } from "react-native";

export default function WarningList({ risk }: any) {
  const warnings = [
    { title: "Flood", value: risk.flood },
    { title: "Storm", value: risk.storm },
    { title: "Heat", value: risk.heat },
    { title: "Earthquake", value: risk.earthquake },
  ];

  return (
    <View>
      <Text style={{ color: "#fff", marginBottom: 10 }}>
        Early Warning
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {warnings.map((w, i) => (
          <View
            key={i}
            style={{
              backgroundColor: "#1A1F2E",
              padding: 16,
              borderRadius: 16,
              marginRight: 12,
              width: 160,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {w.title}
            </Text>

            <Text style={{ color: "#3B82F6", marginTop: 8 }}>
              {w.value}%
            </Text>

            <Text style={{ color: "#aaa", marginTop: 6 }}>
              {w.value > 60 ? "High Risk" : "Low"}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}