import { Ionicons } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const RiskCard = ({ data }: any) => {
  if (!data) return null;

  const { weather } = data;

  // Format precipitation (assumed in mm, not km/h)
  const rainValue = weather.rain !== undefined ? `${weather.rain} mm` : "—";

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Humidity */}
        <View style={styles.item}>
          <Ionicons name="water" size={22} color="#3B82F6" />
          <Text style={styles.value}>{weather.humidity}%</Text>
        </View>

        <View style={styles.divider} />

        {/* Wind */}
        <View style={styles.item}>
          <Feather name="wind" size={22} color="#3B82F6" />
          <Text style={styles.value}>{weather.wind} km/h</Text>
        </View>

        <View style={styles.divider} />

        {/* Rain */}
        <View style={styles.item}>
          <Ionicons name="rainy" size={22} color="#3B82F6" />
          <Text style={styles.value}>{rainValue}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 4,
  },
});