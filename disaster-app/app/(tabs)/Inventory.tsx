import { SupplyItem, useSetupStore } from "@/utils/setup";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import Disaster from "../../DB/stateDisasterData.json";
import supplies from "../../DB/supplies.json";

const { width, height } = Dimensions.get("window");

export default function Inventory() {
  const { items, adults, location, removeItem, addItem } = useSetupStore();
  const insets = useSafeAreaInsets();

  // Modal state
  const [selectedItem, setSelectedItem] = useState<SupplyItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editLocation, setEditLocation] = useState("");
  const [editExp, setEditExp] = useState("");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [customExp, setCustomExp] = useState("");
  const [customHasExp, setCustomHasExp] = useState(true);

  // Animation for modal
  const modalSlide = useRef(new Animated.Value(height)).current;

  // Top disaster for recommendations
  const topDisaster = useMemo(() => {
    const entries = Object.entries(Disaster).map(([Type, data]) => ({
      Type,
      value: (data[location.region]?.freq || 0) * (data[location.region]?.sev || 0),
    }));
    return entries.sort((a, b) => b.value - a.value)[0];
  }, [location.region]);

  const recommendedItems = useMemo(() => {
    return supplies.filter((i) => (i.priority?.[topDisaster.Type] || 0) > 0.5);
  }, [topDisaster.Type]);

  const inventoryNames = useMemo(() => new Set(items.map((i) => i.name)), [items]);
  const missingRecommended = useMemo(() => {
    return recommendedItems.filter((i) => !inventoryNames.has(i.item));
  }, [recommendedItems, inventoryNames]);

  // Deduplication
  useEffect(() => {
    const seen = new Set<string>();
    items.forEach((item) => {
      if (seen.has(item.id)) removeItem(item.id);
      else seen.add(item.id);
    });
  }, []);

  const formatExpInput = (text: string): string => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    if (!digits.length) return "";
    let month = digits.slice(0, 2);
    if (month.length === 2) {
      let m = parseInt(month, 10);
      if (isNaN(m)) month = "01";
      else if (m > 12) month = "12";
      else if (m < 1) month = "01";
      else month = m.toString().padStart(2, "0");
    }
    const year = digits.slice(2, 4);
    return month + (year ? "/" + year : "");
  };

  const isExpiringSoon = (exp: string): boolean => {
    if (!exp || !exp.includes("/")) return false;
    const [monthStr, yearStr] = exp.split("/");
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10) + 2000;
    const expiry = new Date(Date.UTC(year, month - 1, 1));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const thirtyDays = new Date(today);
    thirtyDays.setUTCDate(today.getUTCDate() + 30);
    return expiry <= thirtyDays && expiry >= today;
  };

  const openModal = (item: SupplyItem) => {
    setSelectedItem(item);
    setEditLocation(item.location);
    setEditExp(item.exp);
    setModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(modalSlide, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      mass: 0.8,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalSlide, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const updateItem = () => {
    if (!selectedItem) return;
    const updated = { ...selectedItem, location: editLocation, exp: editExp };
    removeItem(selectedItem.id);
    addItem(updated);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeModal();
  };

  const moveToNotStored = () => {
    if (!selectedItem) return;
    const moved = { ...selectedItem, stock: false, location: editLocation, exp: editExp };
    removeItem(selectedItem.id);
    addItem(moved);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeModal();
  };

  const addToStored = () => {
    if (!selectedItem) return;
    const updated = { ...selectedItem, stock: true, location: editLocation, exp: editExp };
    removeItem(selectedItem.id);
    addItem(updated);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeModal();
  };

  const addNewItem = (name: string, category: string, hasExp: boolean, location: string, exp: string, isCustom = false) => {
    const id = `${name}-${Date.now()}-${Math.random()}`;
    addItem({
      id,
      name,
      category,
      isMust: false,
      stock: true,
      location,
      exp,
      hasExp,
      isCustom,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAddModalVisible(false);
    setCustomName("");
    setCustomCategory("");
    setCustomLocation("");
    setCustomExp("");
    setCustomHasExp(true);
  };

  const addRecommended = (rec: typeof recommendedItems[0]) => {
    addNewItem(rec.item, rec.category, rec.hasExp ?? true, "", "", false);
  };

  const haveStored = items.filter((i) => i.stock);
  const notStored = items.filter((i) => !i.stock);

  // Simple card render – only name + expiring warning dot
  const renderItem = (item: SupplyItem, showWarning: boolean) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => openModal(item)}
      activeOpacity={0.7}
      style={styles.card}
    >
      <View style={styles.cardRow}>
        <Text style={styles.itemName}>{item.name}</Text>
        {showWarning && <View style={styles.warningDot} />}
      </View>
      <Text style={styles.itemMeta}>{item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 12 }]}>
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>{haveStored.length} items stored</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Stored section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Have Stored</Text>
            {haveStored.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="checkmark-circle" size={40} color="#34C759" />
                <Text style={styles.emptyText}>All set</Text>
              </View>
            ) : (
              haveStored.map((item) => renderItem(item, isExpiringSoon(item.exp)))
            )}
          </View>

          {/* Not stored section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Not Stored</Text>
            {notStored.length === 0 && missingRecommended.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="happy-outline" size={40} color="#8E8E93" />
                <Text style={styles.emptyText}>Fully stocked</Text>
              </View>
            ) : (
              <>
                {notStored.map((item) => renderItem(item, false))}
                {missingRecommended.map((rec) => (
                  <View key={rec.item} style={styles.recommendedCard}>
                    <View style={styles.cardRow}>
                      <Text style={styles.itemName}>{rec.item}</Text>
                      <TouchableOpacity style={styles.addSmall} onPress={() => addRecommended(rec)}>
                        <Ionicons name="add" size={18} color="white" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.itemMeta}>{rec.category}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>

        {/* ===== LIQUID GLASS MODAL ===== */}
        <Modal visible={modalVisible} transparent onRequestClose={closeModal}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal}>
              <Animated.View
                style={[
                  styles.modalCard,
                  { transform: [{ translateY: modalSlide }] },
                ]}
              >
                <TouchableOpacity activeOpacity={1}>
                  <View style={styles.modalHandle} />
                  <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
                  <Text style={styles.modalCategory}>{selectedItem?.category}</Text>

                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    style={styles.input}
                    value={editLocation}
                    onChangeText={setEditLocation}
                    placeholder="e.g., Pantry"
                    placeholderTextColor="#8E8E93"
                  />

                  {selectedItem?.hasExp !== false && (
                    <>
                      <Text style={styles.inputLabel}>Expiration (MM/YY)</Text>
                      <TextInput
                        style={styles.input}
                        value={editExp}
                        onChangeText={(t) => setEditExp(formatExpInput(t))}
                        keyboardType="number-pad"
                        maxLength={5}
                        placeholder="MM/YY"
                        placeholderTextColor="#8E8E93"
                      />
                    </>
                  )}

                  <View style={styles.modalButtons}>
                    {selectedItem?.stock ? (
                      <>
                        <TouchableOpacity style={[styles.modalBtn, styles.updateBtn]} onPress={updateItem}>
                          <Text style={styles.btnText}>Update</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalBtn, styles.moveBtn]} onPress={moveToNotStored}>
                          <Text style={styles.btnText}>Move out</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity style={[styles.modalBtn, styles.addBtn]} onPress={addToStored}>
                        <Text style={styles.btnText}>Add to Stored</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          </BlurView>
        </Modal>

        {/* Add custom modal (simplified, no extra fluff) */}
        <Modal visible={addModalVisible} animationType="slide" transparent>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setAddModalVisible(false)}>
              <View style={styles.addModalCard}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Add Item</Text>

                <Text style={styles.inputLabel}>Name</Text>
                <TextInput style={styles.input} value={customName} onChangeText={setCustomName} placeholder="Flashlight" />

                <Text style={styles.inputLabel}>Category</Text>
                <TextInput style={styles.input} value={customCategory} onChangeText={setCustomCategory} placeholder="Tools" />

                <Text style={styles.inputLabel}>Location</Text>
                <TextInput style={styles.input} value={customLocation} onChangeText={setCustomLocation} placeholder="Garage" />

                <TouchableOpacity style={styles.checkboxRow} onPress={() => setCustomHasExp(!customHasExp)}>
                  <View style={[styles.checkbox, customHasExp && styles.checked]}>
                    {customHasExp && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Has expiration date</Text>
                </TouchableOpacity>

                {customHasExp && (
                  <>
                    <Text style={styles.inputLabel}>Expiration (MM/YY)</Text>
                    <TextInput style={styles.input} value={customExp} onChangeText={(t) => setCustomExp(formatExpInput(t))} placeholder="MM/YY" />
                  </>
                )}

                <TouchableOpacity style={[styles.modalBtn, styles.addBtn, { marginTop: 16 }]} onPress={() => {
                  if (!customName.trim()) return Alert.alert("Error", "Name required");
                  addNewItem(customName.trim(), customCategory.trim() || "Uncategorized", customHasExp, customLocation, customExp, true);
                }}>
                  <Text style={styles.btnText}>Add to Stored</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </BlurView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F2F7" },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20, backgroundColor: "#F2F2F7" },
  title: { fontSize: 34, fontWeight: "700", color: "#000", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: "#8E8E93", marginTop: 4 },
  scrollContent: { paddingBottom: 100 },
  section: { marginBottom: 32, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "600", color: "#000", marginBottom: 12 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recommendedCard: {
    backgroundColor: "#F0F7FF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemName: { fontSize: 17, fontWeight: "500", color: "#000" },
  itemMeta: { fontSize: 14, color: "#8E8E93", marginTop: 6 },
  warningDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF3B30", marginLeft: 8 },
  addSmall: { backgroundColor: "#007AFF", borderRadius: 20, padding: 6, paddingHorizontal: 12 },
  empty: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 16, color: "#8E8E93" },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Liquid glass modal
  modalBackdrop: { flex: 1, justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  addModalCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 24,
    margin: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalHandle: { width: 40, height: 5, backgroundColor: "#C6C6C8", borderRadius: 3, alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 24, fontWeight: "700", color: "#000", marginBottom: 4 },
  modalCategory: { fontSize: 15, color: "#8E8E93", marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "500", color: "#000", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#000",
  },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 16 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  updateBtn: { backgroundColor: "#007AFF" },
  moveBtn: { backgroundColor: "#FF9F0A" },
  addBtn: { backgroundColor: "#34C759" },
  btnText: { color: "white", fontSize: 16, fontWeight: "600" },
  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelText: { color: "#007AFF", fontSize: 16, fontWeight: "500" },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#C6C6C8", alignItems: "center", justifyContent: "center" },
  checked: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  checkboxLabel: { fontSize: 16, color: "#000" },
});