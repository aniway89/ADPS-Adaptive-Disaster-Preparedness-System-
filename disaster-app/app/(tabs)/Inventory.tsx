import { SupplyItem, useSetupStore } from "@/utils/setup";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import Disaster from "../../DB/stateDisasterData.json";
import supplies from "../../DB/supplies.json";

export default function Inventory() {
  const { items, adults, location, removeItem, addItem } = useSetupStore();
  const [selectedItem, setSelectedItem] = useState<SupplyItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editLocation, setEditLocation] = useState("");
  const [editExp, setEditExp] = useState("");

  // Add custom item modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [customExp, setCustomExp] = useState("");
  const [customHasExp, setCustomHasExp] = useState(true);

  // Top disaster for recommendations
  const topDisaster = useMemo(() => {
    const entries = Object.entries(Disaster).map(([Type, data]) => ({
      Type,
      value: (data[location.region]?.freq || 0) * (data[location.region]?.sev || 0),
    }));
    return entries.sort((a, b) => b.value - a.value)[0];
  }, [location.region]);

  const recommendedItems = useMemo(() => {
    return supplies.filter(
      (i) => (i.priority?.[topDisaster.Type] || 0) > 0.5
    );
  }, [topDisaster.Type]);

  const inventoryNames = useMemo(() => new Set(items.map(i => i.name)), [items]);
  const missingRecommended = useMemo(() => {
    return recommendedItems.filter(i => !inventoryNames.has(i.item));
  }, [recommendedItems, inventoryNames]);

  // Deduplication safety
  useEffect(() => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    items.forEach(item => {
      if (seen.has(item.id)) {
        duplicates.push(item.id);
      } else {
        seen.add(item.id);
      }
    });
    duplicates.forEach(id => {
      console.warn(`Removing duplicate item with id: ${id}`);
      removeItem(id);
    });
  }, []);

  const formatExpInput = (text: string): string => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    if (digits.length === 0) return "";
    let month = digits.slice(0, 2);
    if (month.length === 2) {
      let monthNum = parseInt(month, 10);
      if (isNaN(monthNum)) month = "01";
      else if (monthNum > 12) month = "12";
      else if (monthNum < 1) month = "01";
      else month = monthNum.toString().padStart(2, "0");
    }
    const year = digits.slice(2, 4);
    return month + (year ? "/" + year : "");
  };

  const openModal = (item: SupplyItem) => {
    setSelectedItem(item);
    setEditLocation(item.location);
    setEditExp(item.exp);
    setModalVisible(true);
  };

  const updateItem = () => {
    if (!selectedItem) return;
    const updatedItem = { ...selectedItem, location: editLocation, exp: editExp };
    removeItem(selectedItem.id);
    addItem(updatedItem);
    setModalVisible(false);
    Alert.alert("Updated", `${selectedItem.name} updated.`);
  };

  const moveToNotStored = () => {
    if (!selectedItem) return;
    const movedItem = { ...selectedItem, stock: false, location: editLocation, exp: editExp };
    removeItem(selectedItem.id);
    addItem(movedItem);
    setModalVisible(false);
    Alert.alert("Moved", `${selectedItem.name} moved to Not Stored.`);
  };

  const addToStored = () => {
    if (!selectedItem) return;
    const updatedItem = { ...selectedItem, stock: true, location: editLocation, exp: editExp };
    removeItem(selectedItem.id);
    addItem(updatedItem);
    setModalVisible(false);
    Alert.alert("Added", `${selectedItem.name} added to Stored.`);
  };

  const permanentlyDelete = (item: SupplyItem) => {
    Alert.alert(
      "Delete Permanently",
      `Delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => removeItem(item.id) }
      ]
    );
  };

  const isExpiringSoon = (exp: string): boolean => {
    if (!exp || !exp.includes("/")) return false;
    const [monthStr, yearStr] = exp.split("/");
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10) + 2000;
    if (isNaN(month) || isNaN(year)) return false;
    const expiryDate = new Date(Date.UTC(year, month - 1, 1));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setUTCDate(today.getUTCDate() + 30);
    return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
  };

  const addNewItem = (name: string, category: string, hasExp: boolean, location: string, exp: string, isCustom = false) => {
    const uniqueId = `${name}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const newItem: SupplyItem = {
      id: uniqueId,
      name,
      category,
      isMust: false,
      stock: true,
      location,
      exp,
      hasExp,
      isCustom,
    };
    addItem(newItem);
    Alert.alert("Added", `${name} added to Stored.`);
    setAddModalVisible(false);
    setCustomName("");
    setCustomCategory("");
    setCustomLocation("");
    setCustomExp("");
    setCustomHasExp(true);
  };

  const addRecommendedToStored = (rec: typeof recommendedItems[0]) => {
    addNewItem(rec.item, rec.category, rec.hasExp ?? true, "", "", false);
  };

  const renderItemCard = (item: SupplyItem, showRedBorder: boolean, showExpiryWarning: boolean) => (
    <TouchableOpacity key={item.id} onPress={() => openModal(item)}>
      <View style={[styles.itemCard, showRedBorder && styles.redBorder]}>
        <View style={styles.itemRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          {showExpiryWarning && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningText}>⚠️ Near to EXP</Text>
            </View>
          )}
          {item.stock && (item as any).isCustom && (
            <TouchableOpacity onPress={() => permanentlyDelete(item)} style={{ marginLeft: 8 }}>
              <Ionicons name="trash-outline" size={20} color="#ff3b30" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.itemDetail}>Category: {item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const notStockedItems = items.filter(i => !i.stock);
  const haveStored = items.filter(i => i.stock);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.sectionTitle}>✅ Have Stored</Text>
        {haveStored.length === 0 ? (
          <Text style={styles.emptyText}>No items stored.</Text>
        ) : (
          haveStored.map((item) =>
            renderItemCard(item, isExpiringSoon(item.exp), isExpiringSoon(item.exp))
          )
        )}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>📦 Not Stored</Text>
        {notStockedItems.length === 0 && missingRecommended.length === 0 ? (
          <Text style={styles.emptyText}>All items are stored.</Text>
        ) : (
          <>
            {/* Actual not stored items (from store) */}
            {notStockedItems.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => openModal(item)}>
                <View style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                  <Text style={styles.itemDetail}>Category: {item.category}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {/* Missing recommended items (from checklist) */}
            {missingRecommended.map((supply) => (
              <View key={`rec-${supply.item}`} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemName}>{supply.item}</Text>
                  <TouchableOpacity
                    style={styles.addSmallBtn}
                    onPress={() => addRecommendedToStored(supply)}
                  >
                    <Text style={styles.addSmallText}>Add</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemDetail}>Category: {supply.category}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Edit Modal (same) */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
            <Text style={styles.modalSubtitle}>Category: {selectedItem?.category}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Adults:</Text>
              <Text style={styles.value}>{adults}</Text>
            </View>
            <Text style={styles.label}>Location:</Text>
            <TextInput
              style={styles.input}
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="e.g., Kitchen shelf"
            />
            {selectedItem?.hasExp !== false && (
              <>
                <Text style={styles.label}>Expiration (MM/YY):</Text>
                <TextInput
                  style={styles.input}
                  value={editExp}
                  onChangeText={(text) => setEditExp(formatExpInput(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                  placeholder="MM/YY"
                />
              </>
            )}
            {selectedItem?.stock === true ? (
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.updateButton} onPress={updateItem}>
                  <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeButton} onPress={moveToNotStored}>
                  <Text style={styles.buttonText}>Move to Not Stored</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={addToStored}>
                <Text style={styles.buttonText}>Add to Stored</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Custom Item Modal (no tabs, only custom form) */}
      <Modal animationType="slide" transparent visible={addModalVisible} onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitle}>Add Custom Item</Text>
            <ScrollView>
              <Text style={styles.label}>Item Name *</Text>
              <TextInput
                style={styles.input}
                value={customName}
                onChangeText={setCustomName}
                placeholder="e.g., Flashlight"
              />
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={customCategory}
                onChangeText={setCustomCategory}
                placeholder="e.g., Tools"
              />
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={customLocation}
                onChangeText={setCustomLocation}
                placeholder="e.g., Garage"
              />
              <View style={styles.row}>
                <Text style={styles.label}>Has Expiration?</Text>
                <TouchableOpacity
                  style={[styles.checkbox, customHasExp && styles.checkboxChecked]}
                  onPress={() => setCustomHasExp(!customHasExp)}
                >
                  {customHasExp && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              </View>
              {customHasExp && (
                <>
                  <Text style={styles.label}>Expiration (MM/YY)</Text>
                  <TextInput
                    style={styles.input}
                    value={customExp}
                    onChangeText={(text) => setCustomExp(formatExpInput(text))}
                    keyboardType="number-pad"
                    maxLength={5}
                    placeholder="MM/YY"
                  />
                </>
              )}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (!customName.trim()) {
                    Alert.alert("Error", "Item name is required");
                    return;
                  }
                  addNewItem(
                    customName.trim(),
                    customCategory.trim() || "Uncategorized",
                    customHasExp,
                    customLocation,
                    customExp,
                    true
                  );
                }}
              >
                <Text style={styles.buttonText}>Add to Stored</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setAddModalVisible(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 12, color: "#333" },
  itemCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  redBorder: { borderColor: "#ff6b6b", borderWidth: 2, backgroundColor: "#fff5f5" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemName: { fontSize: 18, fontWeight: "600", flex: 1 },
  itemDetail: { fontSize: 14, color: "#666", marginTop: 2 },
  warningBadge: { backgroundColor: "#ff6b6b", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  warningText: { color: "white", fontSize: 12, fontWeight: "bold" },
  emptyText: { fontSize: 16, color: "#999", textAlign: "center", marginTop: 20 },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  modalSubtitle: { fontSize: 16, color: "#666", marginBottom: 16 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  label: { fontSize: 16, fontWeight: "500", color: "#333", marginTop: 8 },
  value: { fontSize: 16, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, gap: 12 },
  updateButton: { flex: 1, backgroundColor: "#007AFF", padding: 12, borderRadius: 8, alignItems: "center" },
  removeButton: { flex: 1, backgroundColor: "#FFA500", padding: 12, borderRadius: 8, alignItems: "center" },
  addButton: { backgroundColor: "#28A745", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 16 },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  closeButton: { marginTop: 12, alignItems: "center", padding: 10 },
  closeText: { color: "#007AFF", fontSize: 16 },
  addSmallBtn: { backgroundColor: "#28A745", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  addSmallText: { color: "white", fontWeight: "bold", fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 12 },
  checkbox: { width: 24, height: 24, borderWidth: 1, borderColor: "#ccc", borderRadius: 4, justifyContent: "center", alignItems: "center" },
  checkboxChecked: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  checkmark: { color: "white", fontSize: 16, fontWeight: "bold" },
});