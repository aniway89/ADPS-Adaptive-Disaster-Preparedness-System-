import { Text, View } from "react-native";

export default function RecentEventCard({ alerts }: any) {
  if (!alerts?.length) return null;

  return (
    <View
      style={{
        backgroundColor: "#1A1F2E",
        borderRadius: 16,
        padding: 15,
        marginBottom: 20,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "bold", marginBottom: 8 }}>
        Recent Alert
      </Text>

      <Text style={{ color: "#ccc" }}>
        ⚠ {alerts[0]}
      </Text>
    </View>
  );
}