import { SupplyItem, useSetupStore } from "@/utils/setup";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Disaster from "../DB/stateDisasterData.json";
import supplies from "../DB/supplies.json";

// Map disaster names to priority codes (used in supplies.json)
const DISASTER_CODE_MAP: Record<string, string> = {
  "Earthquake": "EQ",
  "Flood": "FL",
  "Storm": "CY",
  "Heat Wave": "HW",
};

const getTopDisaster = (region: string) => {
  const entries = Object.entries(Disaster).map(([type, data]) => ({
    Type: type,
    value: (data[region]?.freq || 0) * (data[region]?.sev || 0),
  }));
  const sorted = entries.sort((a, b) => b.value - a.value);
  return sorted[0] || { Type: "Flood" };
};

// Helper to extract quantity string
const getQuantityDisplay = (item: any) => {
  return item.quantity_per_person_day || "1 unit";
};

export default function CheckList() {
  const { location, addItem, adults } = useSetupStore();
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const top = useMemo(() => getTopDisaster(location.region || "unknown"), [location.region]);

  // Try to map disaster name to code; fallback to "FL" (Flood)
  const disasterCode = useMemo(() => {
    const code = DISASTER_CODE_MAP[top.Type];
    if (!code) {
      console.warn(`Unknown disaster type: ${top.Type}, falling back to FL`);
      return "FL";
    }
    return code;
  }, [top.Type]);

  // Filter supplies based on priority
  const mustHave = useMemo(() => {
    return supplies.filter((item) => (item.priority?.[disasterCode] || 0) > 0.7);
  }, [disasterCode]);

  const others = useMemo(() => {
    return supplies.filter(
      (item) =>
        (item.priority?.[disasterCode] || 0) >= 0.5 &&
        (item.priority?.[disasterCode] || 0) <= 0.7
    );
  }, [disasterCode]);

  // Initialize temporary items
  useEffect(() => {
    const createTempItems = (list: any[], isMust: boolean) =>
      list.map((item, idx) => ({
        id: `temp-${isMust ? "m" : "o"}-${idx}-${Date.now()}`,
        name: item.item,
        category: item.category,
        isMust,
        stock: false,
        location: "",
        exp: "",
        hasExp: item.EXP && item.EXP !== "NA",
        quantityDisplay: getQuantityDisplay(item),
        note: item.note || "",
      }));
    setItems([...createTempItems(mustHave, true), ...createTempItems(others, false)]);
  }, [mustHave, others]);

  const updateItem = useCallback((id: string, key: string, value: any) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  }, []);

  const saveItems = useCallback(async () => {
    const toSave = items.filter((item) => item.stock || item.isMust);
    if (toSave.length === 0) {
      Alert.alert("No items", "Please select at least one item.");
      return;
    }
    setSaving(true);
    try {
      for (const item of toSave) {
        const uniqueId = `${item.name}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        const newItem: SupplyItem = {
          id: uniqueId,
          name: item.name,
          location: item.location,
          exp: item.exp,
          stock: item.stock,
          category: item.category,
          isMust: item.isMust,
        };
        addItem(newItem);
      }
      Alert.alert("Saved!", "Your supplies are ready.", [
        { text: "Go Home", onPress: () => router.replace("/") },
      ]);
    } catch (error) {
      Alert.alert("Error", "Could not save.");
    } finally {
      setSaving(false);
    }
  }, [items, addItem]);

  const hasSelection = items.some((item) => item.stock);

  const renderItem = (item: any) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <TouchableOpacity onPress={() => updateItem(item.id, "stock", !item.stock)}>
          <FontAwesome6
            name={item.stock ? "check-circle" : "circle"}
            size={24}
            color={item.stock ? "#3B82F6" : "#D1D5DB"}
          />
        </TouchableOpacity>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemQuantity}>Need: {item.quantityDisplay}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailInput}>
          <FontAwesome6 name="location-dot" size={14} color="#6B7280" />
          <TextInput
            placeholder="Storage"
            placeholderTextColor="#9CA3AF"
            value={item.location}
            onChangeText={(text) => updateItem(item.id, "location", text)}
            style={styles.smallInput}
          />
        </View>
        {item.hasExp && (
          <View style={styles.detailInput}>
            <FontAwesome6 name="calendar" size={14} color="#6B7280" />
            <TextInput
              placeholder="MM/YY"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={5}
              value={item.exp}
              onChangeText={(text) => updateItem(item.id, "exp", text)}
              style={styles.smallInput}
            />
          </View>
        )}
      </View>
    </View>
  );

  const hasAnyItems = items.filter(i => i.isMust).length > 0 || items.filter(i => !i.isMust).length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <FontAwesome6 name="shield" size={32} color="#3B82F6" />
        <Text style={styles.headerTitle}>Emergency Checklist</Text>
        <Text style={styles.headerSubtitle}>
          For {top.Type} risk · {adults} person{adults !== 1 ? "s" : ""}
        </Text>
      </View>

      {!hasAnyItems ? (
        <View style={{ padding: 20, alignItems: "center" }}>
          <FontAwesome6 name="exclamation-triangle" size={48} color="#F59E0B" />
          <Text style={{ marginTop: 12, fontSize: 16, color: "#6B7280", textAlign: "center" }}>
            No items found for {top.Type}.
            {"\n"}Please check your region settings or contact support.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Essential Items</Text>
          {items.filter((i) => i.isMust).map(renderItem)}

          <Text style={styles.sectionTitle}>Recommended</Text>
          {items.filter((i) => !i.isMust).map(renderItem)}
        </>
      )}

      {hasAnyItems && (
        <TouchableOpacity
          disabled={!hasSelection || saving}
          onPress={saveItems}
          style={[styles.saveButton, (!hasSelection || saving) && styles.saveButtonDisabled]}
        >
          {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Save</Text>}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = {
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingTop:30 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#1F2937", marginTop: 8 },
  headerSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 4, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#1F2937", marginTop: 16, marginBottom: 12 },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  itemHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  itemInfo: { marginLeft: 12, flex: 1 },
  itemName: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  itemQuantity: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  detailsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  detailInput: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, flex: 0.48 },
  smallInput: { marginLeft: 6, fontSize: 14, flex: 1, paddingVertical: 6 },
  saveButton: { backgroundColor: "#3B82F6", borderRadius: 40, paddingVertical: 14, alignItems: "center", marginTop: 24 },
  saveButtonDisabled: { backgroundColor: "#9CA3AF" },
  saveButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
} as const;