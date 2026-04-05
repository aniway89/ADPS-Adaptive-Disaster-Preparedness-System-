import { SupplyItem, useSetupStore } from "@/utils/setup";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

import Disaster from "../../DB/stateDisasterData.json";
import supplies from "../../DB/supplies.json";
const {location} = useSetupStore.getState();
// ---------- Helper: compute top disaster ----------
const getTopDisaster = (location: string) => {
  const entries = Object.entries(Disaster).map(([Type, data]) => ({
    Type,
    value: (data[location]?.freq || 0) * (data[location]?.sev || 0),
  }));
  return entries.sort((a, b) => b.value - a.value)[0];
};
console.log("Disaster data loaded:", location);
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
  const formatted = month + (year ? "/" + year : "");
  return formatted;
};

// ---------- Main Component ----------
export default function CheckList() {
  const { location, addItem } = useSetupStore();

  const [items, setItems] = useState<SupplyItem[]>([]);

  const top = getTopDisaster(location);

  const mustHave = supplies.filter((i) => (i.priority?.[top.Type] || 0) > 0.7);
  const others = supplies.filter(
    (i) =>
      (i.priority?.[top.Type] || 0) >= 0.5 &&
      (i.priority?.[top.Type] || 0) <= 0.7
  );

  useEffect(() => {
    setItems([
      ...mustHave.map((i, idx) => ({
        id: `m-${idx}`,
        name: i.item,
        category: i.category,
        isMust: true,
        stock: false,
        location: "",
        exp: "",
        hasExp: i.hasExp ?? true,
      })),
      ...others.map((i, idx) => ({
        id: `o-${idx}`,
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

  // Handle expiration input: accept typed text, extract digits, reformat with slash
  const handleExpChange = (id: string, inputText: string) => {
    // Remove any existing slashes and non-digits to get raw digits
    const rawDigits = inputText.replace(/\D/g, "");
    const formatted = formatExpWithSlash(rawDigits);
    updateItem(id, "exp", formatted);
  };

  // Optional: validate on blur to ensure month is valid and pad
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
      // If only one digit, assume it's January (01)
      month = "01";
    }
    const year = digits.slice(2, 4);
    const formatted = month + (year ? "/" + year : "");
    updateItem(id, "exp", formatted);
  };

  const saveItems = useCallback(() => {
    const toSave = items.filter((item) => item.stock || item.isMust);
    toSave.forEach((item) => {
      console.log("Saving item:", item);
      addItem(item);
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
    <ScrollView style={{ padding: 15, backgroundColor: "white" }}>
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