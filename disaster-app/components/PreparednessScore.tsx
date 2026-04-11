import { useSetupStore } from "@/utils/setup";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Disaster from "../DB/stateDisasterData.json";
import supplies from "../DB/supplies.json";

const getTopDisaster = (region: string) => {
  const entries = Object.entries(Disaster).map(([type, data]) => ({
    type,
    value: (data[region]?.freq || 0) * (data[region]?.sev || 0),
  }));
  const sorted = entries.sort((a, b) => b.value - a.value);
  return sorted[0]?.type || "Flood";
};

const getEssentialItemsForDisaster = (disasterType: string) => {
  return supplies.filter(
    (item: any) => (item.priority?.[disasterType] || 0) > 0.7
  );
};

export default function PreparednessScore() {
  const { location, items } = useSetupStore(); // ✅ always called
  const region = location.region || "unknown";

  const topDisaster = useMemo(() => getTopDisaster(region), [region]);
  const essentialItems = useMemo(
    () => getEssentialItemsForDisaster(topDisaster),
    [topDisaster]
  );

  const stockedEssentialCount = useMemo(() => {
    const stockedItemNames = new Set(
      items.filter((i) => i.stock).map((i) => i.name)
    );
    return essentialItems.filter((item) => stockedItemNames.has(item.item)).length;
  }, [items, essentialItems]);

  const totalEssential = essentialItems.length;
  const score = totalEssential === 0 ? 0 : (stockedEssentialCount / totalEssential) * 100;

  const getColor = () => {
    if (score < 50) return "#EF4444";
    if (score < 75) return "#F59E0B";
    return "#10B981";
  };

  const size = 80; // smaller circle for horizontal layout
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <View style={styles.card}>
      {/* Left: Circular Progress */}
      <View style={styles.circleContainer}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90, ${size / 2}, ${size / 2})`}
          />
        </Svg>
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentage, { color: getColor() }]}>
            {Math.round(score)}%
          </Text>
        </View>
      </View>

      {/* Right: Text Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>Preparedness Score</Text>
        <Text style={styles.subtitle}>
          for {topDisaster} in {region}
        </Text>
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {stockedEssentialCount} / {totalEssential} essentials stocked
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",          // horizontal row
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    marginBottom:10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  circleContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  percentageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  percentage: {
    fontSize: 18,
    fontWeight: "bold",
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 6,
  },
  stats: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  statsText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
});