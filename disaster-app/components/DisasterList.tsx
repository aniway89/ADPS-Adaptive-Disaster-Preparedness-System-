import { useSetupStore } from "@/utils/setup";
import { FontAwesome6 } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Disaster from "../DB/stateDisasterData.json";

const SURVIVAL_GUIDE = {
  disasters: [
    {
      type: "Flood",
      steps: [
        "Move to the highest floor or ground possible immediately.",
        "Do not walk, swim, or drive through moving water.",
        "Turn off electricity and gas at the main switches if safe to do so.",
        "Stay away from power lines and electrical equipment.",
        "Drink only bottled or boiled water to avoid contamination.",
      ],
    },
    {
      type: "Earthquake",
      steps: [
        "Drop, Cover, and Hold On under a sturdy table or desk.",
        "Stay away from glass, windows, and heavy furniture that could fall.",
        "If outdoors, move to an open area away from buildings and trees.",
        "Do not use elevators; they may lose power or become stuck.",
        "Be prepared for aftershocks which often follow the main quake.",
      ],
    },
    {
      type: "Storm",
      steps: [
        "Seek shelter in a sturdy building or a basement.",
        "Stay away from windows and glass doors.",
        "Charge all communication devices before the storm hits.",
        "Secure outdoor furniture and loose objects that could become projectiles.",
        "Avoid using corded phones or touching electrical appliances.",
      ],
    },
    {
      type: "Heat Wave",
      steps: [
        "Drink plenty of water even if you do not feel thirsty.",
        "Stay in air-conditioned buildings or shaded areas.",
        "Wear lightweight, light-colored, and loose-fitting clothing.",
        "Never leave children or pets in a parked car.",
        "Limit outdoor activity to early morning or late evening.",
      ],
    },
    {
      type: "Landslide",
      steps: [
        "Move away from steep slopes and cliffs.",
        "Watch for signs like cracking ground or falling rocks.",
        "If indoors, go to an upper floor away from the hillside.",
        "Listen for unusual sounds like trees cracking or boulders knocking.",
        "After landslide, stay away from the area as secondary slides can occur."
      ]
    }
  ],
};

const getDisasterScore = (disasterType: string, region: string) => {
  const data = Disaster[disasterType as keyof typeof Disaster]?.[region];
  if (!data) return 0;
  return (data.freq || 0) * (data.sev || 0);
};

const getIconName = (type: string) => {
  switch (type.toLowerCase()) {
    case "flood": return "water";
    case "earthquake": return "earth-asia";
    case "storm": return "cloud-rain";
    case "heat wave": return "sun";
    case "landslide": return "mountain";
    default: return "triangle-exclamation";
  }
};

export default function DisasterList() {
  const { location } = useSetupStore();
  const [selectedDisaster, setSelectedDisaster] = useState<null | {
    type: string;
    steps: string[];
  }>(null);

  const sortedDisasters = SURVIVAL_GUIDE.disasters
    .map((disaster) => ({
      ...disaster,
      score: getDisasterScore(disaster.type, location.region),
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <>
      <View style={{ marginVertical: 35 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 0 }}>
          Survival Guides
        </Text>
        <Text style={{ fontSize: 12, color: "#9F9F9F", marginBottom: 12 }}>
          Tap any icon to see survival steps
        </Text>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          data={sortedDisasters}
          keyExtractor={(item) => item.type}
          contentContainerStyle={{ paddingHorizontal: 4 }}
          renderItem={({ item: disaster, index }) => (
            <TouchableOpacity
              onPress={() => setSelectedDisaster(disaster)}
              style={{
                width: 60,
                height: 60,
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                marginRight: index === sortedDisasters.length - 1 ? 0 : 16,
                marginBottom: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#F0F0F0",
              }}
            >
              <FontAwesome6
                name={getIconName(disaster.type)}
                size={22}
                color="#3B82F6"
              />
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Full‑screen modal with clean step layout */}
      <Modal
        visible={selectedDisaster !== null}
        animationType="slide"
        transparent={false}  // full screen, no background overlay
        onRequestClose={() => setSelectedDisaster(null)}
      >
      
          <View style={{ flex: 1, borderRadius:30 }}>
            {/* Header with icon, title, and close button */}
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#F0F0F0",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <FontAwesome6
                  name={getIconName(selectedDisaster?.type || "")}
                  size={28}
                  color="#3B82F6"
                />
                <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1F2937" }}>
                  {selectedDisaster?.type} Survival
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedDisaster(null)}
                style={{ padding: 8 }}
              >
                <FontAwesome6 name="xmark" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Scrollable steps with numbered badges */}
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {selectedDisaster?.steps.map((step, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    marginBottom: 24,
                    alignItems: "flex-start",
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#3B82F6",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                      marginTop: 2,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                      {idx + 1}
                    </Text>
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 16,
                      lineHeight: 24,
                      color: "#374151",
                    }}
                  >
                    {step}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Bottom close button */}
            <TouchableOpacity
              onPress={() => setSelectedDisaster(null)}
              style={{
                margin: 20,
                backgroundColor: "#3B82F6",
                paddingVertical: 14,
                borderRadius: 30,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
  
      </Modal>
    </>
  );
}