import stateDisasterData from "@/DB/stateDisasterData.json";
import supplies from "@/DB/supplies.json";
import { useSetupStore } from "@/utils/setup";
import { getItemAsync, setItemAsync } from "expo-secure-store";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const PRIORITY_THRESHOLD = 0.5;
const CATEGORY_ICONS = {
  "Water & Hydration": "💧",
  "Food & Nutrition": "🍲",
  "First Aid & Medicine": "⚕️",
  Equipment: "🔧",
};

// helpers
const parseQuantity = (qtyStr, adults = 1) => {
  const numeric = parseFloat(qtyStr);
  const suffix = qtyStr.replace(/[0-9.\s-]/g, "").trim();
  if (Number.isFinite(numeric)) return `${numeric * adults}${suffix ? ` ${suffix}` : ""}`;
  return qtyStr;
};

const formatExpiryInput = (text) => {
  const digits = text.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 6)}`.slice(0, 7);
};

const isFutureDate = (mmYyyy) => {
  if (!mmYyyy || mmYyyy.length !== 7 || mmYyyy[2] !== "/") return false;
  const [mm, yyyy] = mmYyyy.split("/");
  const month = parseInt(mm, 10);
  const year = parseInt(yyyy, 10);
  if (month < 1 || month > 12 || isNaN(year) || year < 2020) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month > currentMonth);
};

export default function SuppliesChecklist() {
  const  location = "Goa" 
  const { adults = 1} = useSetupStore();
  const state = location?.trim() || "";

  // --- disaster ranking & filtered items ---
  const topDisasterInfo = useMemo(() => {
    if (!state) return null;
    const indiaData = stateDisasterData?.India || {};
    const rankings = Object.entries(indiaData)
      .map(([disasterType, states]) => {
        const stateEntries = Object.entries(states || {});
        if (stateEntries.length === 0) return null;
        const meanSev = stateEntries.reduce((sum, [_, v]) => sum + (v.sev || 0), 0) / stateEntries.length;
        const userValue = states?.[state] || { freq: 0, sev: 0 };
        const risk = meanSev > 0 ? userValue.sev / meanSev : 0;
        return { disasterType, risk };
      })
      .filter(Boolean)
      .sort((a, b) => b.risk - a.risk);
    return rankings[0] || null;
  }, [state]);

  const topDisasterType = topDisasterInfo?.disasterType;

  const { recommendedItems, otherItems } = useMemo(() => {
    if (!topDisasterType) return { recommendedItems: [], otherItems: [] };
    const filtered = supplies.filter((item) => (item.priority?.[topDisasterType] ?? 0) >= PRIORITY_THRESHOLD);
    const sorted = [...filtered].sort((a, b) => (b.priority?.[topDisasterType] ?? 0) - (a.priority?.[topDisasterType] ?? 0));
    const highestPrio = sorted[0]?.priority?.[topDisasterType] ?? 0;
    const recommended = sorted.filter((item) => (item.priority?.[topDisasterType] ?? 0) === highestPrio);
    const other = sorted.filter((item) => (item.priority?.[topDisasterType] ?? 0) !== highestPrio);
    return { recommendedItems: recommended, otherItems: other };
  }, [topDisasterType]);

  const groupedOthers = useMemo(() => {
    const groups = {};
    otherItems.forEach((item) => {
      const cat = item.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [otherItems]);

  // --- state & storage ---
  const [checked, setChecked] = useState({});
  const [details, setDetails] = useState({});
  const [customSupplies, setCustomSupplies] = useState([]);
  const [customForm, setCustomForm] = useState({ name: "", qty: "", location: "", expiry: "" });

  useEffect(() => {
    const initialChecked = {};
    supplies.forEach((item) => {
      initialChecked[item.id] = (item.priority?.[topDisasterType] ?? 0) >= PRIORITY_THRESHOLD;
    });
    setChecked(initialChecked);
  }, [topDisasterType]);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const existing = await getItemAsync("userSupplies");
        if (existing) {
          const parsed = JSON.parse(existing);
          if (parsed.checked) setChecked(parsed.checked);
          if (parsed.details) setDetails(parsed.details);
          if (parsed.customSupplies) setCustomSupplies(parsed.customSupplies);
        }
      } catch (e) {}
    };
    loadSaved();
  }, []);

  const toggleItem = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const setItemField = (id, field, value) =>
    setDetails((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));

  const addCustomSupply = () => {
    if (!customForm.name.trim() || !customForm.qty.trim()) return;
    setCustomSupplies((prev) => [
      ...prev,
      { id: `custom_${Date.now()}`, name: customForm.name, quantity: customForm.qty, location: customForm.location, expiryDate: customForm.expiry },
    ]);
    setCustomForm({ name: "", qty: "", location: "", expiry: "" });
  };

  const removeCustomSupply = (id) => setCustomSupplies((prev) => prev.filter((i) => i.id !== id));

  const saveSupplies = async () => {
    const payload = {
      timestamp: new Date().toISOString(),
      adults,
      location: state,
      topDisaster: topDisasterType,
      checked,
      details,
      customSupplies,
      selected: Object.keys(checked).filter((k) => checked[k]),
      skipped: Object.keys(checked).filter((k) => !checked[k]),
      totalItems: Object.keys(checked).length,
    };
    try {
      await setItemAsync("userSupplies", JSON.stringify(payload));
    } catch (e) {}
  };

  const renderItem = (item) => {
    const isChecked = checked[item.id] || false;
    const storedLocation = details[item.id]?.location || "";
    const storedExp = details[item.id]?.expiryDate || "";
    const isValidExp = !storedExp || isFutureDate(storedExp);

    return (
      <View key={item.id} style={{ backgroundColor: isChecked ? "#1a1a4a" : "#111", borderRadius: 10, padding: 12, marginBottom: 10 }}>
        <Pressable onPress={() => toggleItem(item.id)} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: isChecked ? "#2874a6" : "#333", justifyContent: "center", alignItems: "center", marginRight: 10 }}>
            {isChecked && <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}>✓</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>{item.item}</Text>
            <Text style={{ color: "#7B68EE", fontSize: 12, marginTop: 2 }}>Qty: {parseQuantity(item.quantity_per_person_day, adults)}</Text>
          </View>
        </Pressable>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput value={storedLocation} onChangeText={(v) => setItemField(item.id, "location", v)} placeholder="Location" placeholderTextColor="#666" style={{ flex: 1, backgroundColor: "#222", color: "#fff", borderRadius: 6, padding: 8, fontSize: 12 }} />
          <TextInput value={storedExp} onChangeText={(v) => setItemField(item.id, "expiryDate", formatExpiryInput(v))} maxLength={7} placeholder="MM/YYYY" placeholderTextColor="#666" keyboardType="numeric" style={{ flex: 0.5, backgroundColor: storedExp && !isValidExp ? "#553333" : "#222", color: "#fff", borderRadius: 6, padding: 8, fontSize: 12 }} />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#222", backgroundColor: "#050505" }}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 4 }}>Survival Supplies Checklist</Text>
        {topDisasterInfo ? (
          <Text style={{ color: "#7B68EE", fontSize: 13 }}>🎯 Highest Risk: <Text style={{ fontWeight: "700" }}>{topDisasterInfo.disasterType}</Text> ({topDisasterInfo.risk.toFixed(2)})</Text>
        ) : (
          <Text style={{ color: "#aaa", fontSize: 13 }}>No location set</Text>
        )}
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {recommendedItems.length === 0 && Object.keys(groupedOthers).length === 0 ? (
          <Text style={{ color: "#aaa", marginTop: 20, textAlign: "center" }}>No supplies available for your location/disaster type.</Text>
        ) : (
          <>
            {recommendedItems.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontSize: 24, marginRight: 8 }}>🔴</Text>
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", textTransform: "uppercase" }}>Must Have / Recommended</Text>
                </View>
                {recommendedItems.map(renderItem)}
              </View>
            )}
            {Object.entries(groupedOthers).map(([category, items]) => (
              <View key={category} style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontSize: 24, marginRight: 8 }}>{CATEGORY_ICONS[category] || "📦"}</Text>
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", textTransform: "uppercase" }}>{category}</Text>
                </View>
                {items.map(renderItem)}
              </View>
            ))}
          </>
        )}

        {/* Custom supplies section */}
        <View style={{ marginBottom: 24, marginTop: 12 }}>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 12, textTransform: "uppercase" }}>➕ Add Custom Supply</Text>
          <View style={{ backgroundColor: "#111", borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <TextInput value={customForm.name} onChangeText={(v) => setCustomForm((p) => ({ ...p, name: v }))} placeholder="Supply name" placeholderTextColor="#666" style={{ backgroundColor: "#222", color: "#fff", borderRadius: 6, padding: 8, marginBottom: 8 }} />
            <TextInput value={customForm.qty} onChangeText={(v) => setCustomForm((p) => ({ ...p, qty: v }))} placeholder="Quantity (e.g., 5 kg)" placeholderTextColor="#666" style={{ backgroundColor: "#222", color: "#fff", borderRadius: 6, padding: 8, marginBottom: 8 }} />
            <TextInput value={customForm.location} onChangeText={(v) => setCustomForm((p) => ({ ...p, location: v }))} placeholder="Location" placeholderTextColor="#666" style={{ backgroundColor: "#222", color: "#fff", borderRadius: 6, padding: 8, marginBottom: 8 }} />
            <TextInput value={customForm.expiry} onChangeText={(v) => setCustomForm((p) => ({ ...p, expiry: formatExpiryInput(v) }))} maxLength={7} placeholder="Expiry (MM/YYYY)" placeholderTextColor="#666" keyboardType="numeric" style={{ backgroundColor: "#222", color: "#fff", borderRadius: 6, padding: 8, marginBottom: 10 }} />
            <Pressable onPress={addCustomSupply} style={{ backgroundColor: "#2874a6", borderRadius: 6, padding: 10, alignItems: "center" }}><Text style={{ color: "#fff", fontWeight: "600" }}>Add Supply</Text></Pressable>
          </View>
          {customSupplies.map((item) => (
            <View key={item.id} style={{ backgroundColor: "#1a1a4a", borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>{item.name}</Text>
                  <Text style={{ color: "#7B68EE", fontSize: 12, marginTop: 2 }}>Qty: {item.quantity}</Text>
                </View>
                <Pressable onPress={() => removeCustomSupply(item.id)}><Text style={{ color: "#ff6666", fontSize: 16, fontWeight: "bold" }}>✕</Text></Pressable>
              </View>
              <Text style={{ color: "#aaa", fontSize: 11 }}>📍 {item.location || "No location"}</Text>
              <Text style={{ color: "#aaa", fontSize: 11 }}>📅 {item.expiryDate || "No expiry"}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: "#222", backgroundColor: "#050505" }}>
        <Pressable onPress={saveSupplies} style={{ backgroundColor: "#2874a6", borderRadius: 8, padding: 14, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>SAVE SUPPLIES</Text>
        </Pressable>
      </View>
    </View>
  );
}