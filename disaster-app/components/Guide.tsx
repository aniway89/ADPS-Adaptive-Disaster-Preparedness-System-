import { SupplyItem, useSetupStore } from "@/utils/setup";
import { FontAwesome6 } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Disaster from "../DB/stateDisasterData.json";
import supplies from "../DB/supplies.json";

// ---------- Survival Guide Data (from your JSON) ----------
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
  ],
};

// ---------- Compute disaster risk score (same as getTopDisaster) ----------
const getDisasterScore = (disasterType: string, region: string) => {
  const data = Disaster[disasterType as keyof typeof Disaster]?.[region];
  if (!data) return 0;
  return (data.freq || 0) * (data.sev || 0);
};

// ---------- Expiration formatting (unchanged) ----------
const formatExpWithSlash = (rawDigits: string): string => {
  const digits = rawDigits.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) return "";
  let month = digits.slice(0, 2);
  const year = digits.slice(2, 4);
  if (month.length === 2) {
    let monthNum = parseInt(month, 10);
    if (isNaN(monthNum)) month = "01";
    else if (monthNum > 12) month = "12";
    else if (monthNum < 1) month = "01";
    else month = monthNum.toString().padStart(2, "0");
  }
  return month + (year ? "/" + year : "");
};

// ---------- Main Component ----------
export default function CheckList() {
  const { location, addItem } = useSetupStore();
  const [items, setItems] = useState<SupplyItem[]>([]);
  const [selectedDisaster, setSelectedDisaster] = useState<null | {
    type: string;
    steps: string[];
  }>(null);

  // Get top disaster for header text
  const top = (() => {
    const entries = Object.entries(Disaster).map(([Type, data]) => ({
      Type,
      value: (data[location.region]?.freq || 0) * (data[location.region]?.sev || 0),
    }));
    return entries.sort((a, b) => b.value - a.value)[0];
  })();

  // Build sorted disaster rows (highest risk first)
  const sortedDisasters = SURVIVAL_GUIDE.disasters
    .map((disaster) => ({
      ...disaster,
      score: getDisasterScore(disaster.type, location.region),
    }))
    .sort((a, b) => b.score - a.score);

  // Map disaster type to icon name
  const getIconName = (type: string) => {
    switch (type.toLowerCase()) {
      case "flood": return "water";
      case "earthquake": return "earthquake";
      case "storm": return "cloud-rain";
      case "heat wave": return "sun";
      default: return "triangle-exclamation";
    }
  };

  // Existing checklist logic (mustHave/others based on top disaster)
  const mustHave = supplies.filter((i) => (i.priority?.[top.Type] || 0) > 0.7);
  const others = supplies.filter(
    (i) =>
      (i.priority?.[top.Type] || 0) >= 0.5 &&
      (i.priority?.[top.Type] || 0) <= 0.7
  );

  useEffect(() => {
    setItems([
      ...mustHave.map((i, idx) => ({
        id: `temp-m-${idx}-${Date.now()}`,
        name: i.item,
        category: i.category,
        isMust: true,
        stock: false,
        location: "",
        exp: "",
        hasExp: i.hasExp ?? true,
      })),
      ...others.map((i, idx) => ({
        id: `temp-o-${idx}-${Date.now()}`,
        name: i.item,
        category: i.category,
        isMust: false,
        stock: false,
        location: "",
        exp: "",
        hasExp: i.hasExp ?? true,
      })),
    ]);
  }, [mustHave, others]);

  const updateItem = useCallback((id: string, key: keyof SupplyItem, value: any) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  }, []);

  const handleExpChange = (id: string, inputText: string) => {
    const rawDigits = inputText.replace(/\D/g, "");
    const formatted = formatExpWithSlash(rawDigits);
    updateItem(id, "exp", formatted);
  };

  const handleExpBlur = (id: string, currentExp: string) => {
    const digits = currentExp.replace(/\D/g, "");
    if (digits.length === 0) return;
    let month = digits.slice(0, 2);
    if (month.length === 2) {
      let monthNum = parseInt(month, 10);
      if (isNaN(monthNum)) month = "01";
      else if (monthNum > 12) month = "12";
      else if (monthNum < 1) month = "01";
      else month = monthNum.toString().padStart(2, "0");
    } else if (month.length === 1) {
      month = "01";
    }
    const year = digits.slice(2, 4);
    const formatted = month + (year ? "/" + year : "");
    updateItem(id, "exp", formatted);
  };

  const saveItems = useCallback(() => {
    const toSave = items.filter((item) => item.stock || item.isMust);
    toSave.forEach((item) => {
      const uniqueId = `${item.name}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      const newItem = { ...item, id: uniqueId };
      addItem(newItem);
    });
  }, [items, addItem]);

  const hasSelection = items.some((item) => item.stock);

  const renderItem = (item: SupplyItem & { hasExp?: boolean }) => (
    <View key={item.id} style={{ marginBottom: 8 }}>
      <TouchableOpacity onPress={() => updateItem(item.id, "stock", !item.stock)}>
        <Text style={{ fontSize: 16 }}>{item.stock ? "✔" : "⬜"} {item.name}</Text>
      </TouchableOpacity>
      <TextInput
        placeholder="Location"
        value={item.location}
        onChangeText={(text) => updateItem(item.id, "location", text)}
        style={{ borderBottomWidth: 1, marginVertical: 4 }}
      />
      {item.hasExp && (
        <TextInput
          placeholder="MM/YY"
          keyboardType="number-pad"
          maxLength={5}
          value={item.exp}
          onChangeText={(text) => handleExpChange(item.id, text)}
          onBlur={() => handleExpBlur(item.id, item.exp)}
          style={{ borderBottomWidth: 1 }}
        />
      )}
    </View>
  );

  return (
    <>
      <ScrollView style={{ padding: 0 }}>
        {/* Disaster Rows Section */}
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
          Top disaster: {top.Type}
        </Text>
        <Text style={{ fontSize: 14, color: "#555", marginBottom: 8 }}>
          Tap any disaster to see survival steps:
        </Text>

        {sortedDisasters.map((disaster) => (
          <TouchableOpacity
            key={disaster.type}
            onPress={() => setSelectedDisaster(disaster)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 0,
              paddingHorizontal: 12,
              backgroundColor: "#f0f4f8",
              borderRadius: 10,
              marginBottom: 6,
            }}
          >
            <FontAwesome6
              name={getIconName(disaster.type)}
              size={24}
              color="#3B82F6"
              style={{ marginRight: 12 }}
            />
            <Text style={{ fontSize: 16, fontWeight: "500" }}>{disaster.type}</Text>
          </TouchableOpacity>
        ))}

        {/* Checklist Items */}


        <TouchableOpacity
          disabled={!hasSelection}
          onPress={saveItems}
          style={{
            marginTop: 16,
            backgroundColor: hasSelection ? "black" : "gray",
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
            Save
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Survival Modal with Close Button */}
      <Modal
        visible={selectedDisaster !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedDisaster(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "85%",
              maxHeight: "80%",
              backgroundColor: "white",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                {selectedDisaster?.type} Survival
              </Text>
              <TouchableOpacity onPress={() => setSelectedDisaster(null)}>
                <FontAwesome6 name="xmark" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedDisaster?.steps.map((step, idx) => (
                <View key={idx} style={{ flexDirection: "row", marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", marginRight: 8 }}>
                    {idx + 1}.
                  </Text>
                  <Text style={{ fontSize: 16, flex: 1 }}>{step}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setSelectedDisaster(null)}
              style={{
                marginTop: 20,
                backgroundColor: "#3B82F6",
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}