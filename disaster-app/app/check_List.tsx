import { SupplyItem, useSetupStore } from "@/utils/setup";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

import Disaster from "../DB/stateDisasterData.json";
import supplies from "../DB/supplies.json";

// ---------- Helper: compute top disaster ----------import AsyncStorage from '@react-native-async-storage/async-storage';


// Inside Inventory component

const getTopDisaster = (region: string) => {
  const entries = Object.entries(Disaster).map(([Type, data]) => ({
    Type,
    value: (data[region]?.freq || 0) * (data[region]?.sev || 0),
  }));
  return entries.sort((a, b) => b.value - a.value)[0];
};

// ---------- Expiration formatting with slash (MM/YY) ----------
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

  const top = getTopDisaster(location.region);

  const mustHave = supplies.filter((i) => (i.priority?.[top.Type] || 0) > 0.7);
  const others = supplies.filter(
    (i) =>
      (i.priority?.[top.Type] || 0) >= 0.5 &&
      (i.priority?.[top.Type] || 0) <= 0.7
  );

  // Initialize temporary items (no storage yet)
  useEffect(() => {
    setItems([
      ...mustHave.map((i, idx) => ({
        id: `temp-m-${idx}-${Date.now()}`, // slightly more unique, but will be replaced on save
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

  // ✅ FIX: Generate a truly unique ID for each saved item
  const saveItems = useCallback(() => {
    const toSave = items.filter((item) => item.stock || item.isMust);
    toSave.forEach((item) => {
      const uniqueId = `${item.name}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      const newItem = { ...item, id: uniqueId };
      console.log("Saving item with unique ID:", newItem.id);
      addItem(newItem);
    });
  }, [items, addItem]);

  const hasSelection = items.some((item) => item.stock);

  const renderItem = (item: SupplyItem & { hasExp?: boolean }) => (
    <View key={item.id} style={{ marginBottom: 12 }}>
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
    <ScrollView style={{ padding: 15,}}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Top disaster: {top.Type}</Text>

      <Text style={{ marginTop: 16, fontWeight: "600" }}>Must Have</Text>
      {items.filter((i) => i.isMust).map(renderItem)}

      <Text style={{ marginTop: 16, fontWeight: "600" }}>Others</Text>
      {items.filter((i) => !i.isMust).map(renderItem)}

      <TouchableOpacity
        disabled={!hasSelection}
        onPress={saveItems}
        style={{
          marginTop: 20,
          backgroundColor: hasSelection ? "black" : "gray",
          padding: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
          Save
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}