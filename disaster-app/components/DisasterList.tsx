import { useLanguageStore } from "@/utils/languageStore";
import { useSetupStore } from "@/utils/setup";
import { FontAwesome6 } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Disaster from "../DB/stateDisasterData.json";

const translations = {
  en: {
    survivalGuides: "Survival Guides",
    tapIconForSteps: "Tap any icon to see survival steps",
    survival: "Survival",
    close: "Close",
    flood: "Flood",
    earthquake: "Earthquake",
    storm: "Storm",
    heatWave: "Heat Wave",
    landslide: "Landslide",
  },
  ja: {
    survivalGuides: "サバイバルガイド",
    tapIconForSteps: "アイコンをタップして手順を表示",
    survival: "サバイバル",
    close: "閉じる",
    flood: "洪水",
    earthquake: "地震",
    storm: "嵐",
    heatWave: "熱波",
    landslide: "地滑り",
  },
};

const SURVIVAL_GUIDE = {
  disasters: [
    { type: "Flood", stepsKey: "flood" },
    { type: "Earthquake", stepsKey: "earthquake" },
    { type: "Storm", stepsKey: "storm" },
    { type: "Heat Wave", stepsKey: "heatWave" },
    { type: "Landslide", stepsKey: "landslide" },
  ],
};

// Actual steps (English) – Japanese steps are separate
const stepsData = {
  en: {
    flood: [
      "Move to the highest floor or ground possible immediately.",
      "Do not walk, swim, or drive through moving water.",
      "Turn off electricity and gas at the main switches if safe to do so.",
      "Stay away from power lines and electrical equipment.",
      "Drink only bottled or boiled water to avoid contamination.",
    ],
    earthquake: [
      "Drop, Cover, and Hold On under a sturdy table or desk.",
      "Stay away from glass, windows, and heavy furniture that could fall.",
      "If outdoors, move to an open area away from buildings and trees.",
      "Do not use elevators; they may lose power or become stuck.",
      "Be prepared for aftershocks which often follow the main quake.",
    ],
    storm: [
      "Seek shelter in a sturdy building or a basement.",
      "Stay away from windows and glass doors.",
      "Charge all communication devices before the storm hits.",
      "Secure outdoor furniture and loose objects that could become projectiles.",
      "Avoid using corded phones or touching electrical appliances.",
    ],
    heatWave: [
      "Drink plenty of water even if you do not feel thirsty.",
      "Stay in air-conditioned buildings or shaded areas.",
      "Wear lightweight, light-colored, and loose-fitting clothing.",
      "Never leave children or pets in a parked car.",
      "Limit outdoor activity to early morning or late evening.",
    ],
    landslide: [
      "Move away from steep slopes and cliffs.",
      "Watch for signs like cracking ground or falling rocks.",
      "If indoors, go to an upper floor away from the hillside.",
      "Listen for unusual sounds like trees cracking or boulders knocking.",
      "After landslide, stay away from the area as secondary slides can occur.",
    ],
  },
  ja: {
    flood: [
      "すぐに可能な限り高い階または地面に移動してください。",
      "動いている水の中を歩いたり、泳いだり、運転したりしないでください。",
      "安全であれば、メインスイッチで電気とガスを切ってください。",
      "電線や電気機器から離れてください。",
      "汚染を避けるために、ボトル入りまたは沸騰させた水だけを飲んでください。",
    ],
    earthquake: [
      "丈夫なテーブルや机の下で「しゃがむ・隠れる・じっとする」を行ってください。",
      "ガラス、窓、倒れる可能性のある重い家具から離れてください。",
      "屋外の場合は、建物や木から離れた開けた場所に移動してください。",
      "エレベーターは使用しないでください。停電や閉じ込められる恐れがあります。",
      "本震の後にしばしば起こる余震に備えてください。",
    ],
    storm: [
      "頑丈な建物や地下室に避難してください。",
      "窓やガラス戸から離れてください。",
      "嵐が来る前にすべての通信機器を充電してください。",
      "飛び散る可能性のある屋外の家具や物を固定してください。",
      "コード付き電話の使用や家電製品に触れることは避けてください。",
    ],
    heatWave: [
      "のどが渇いていなくてもたくさん水を飲んでください。",
      "エアコンの効いた建物や日陰にいてください。",
      "軽量で明るい色のゆったりした服装を着用してください。",
      "駐車した車の中に子供やペットを絶対に残さないでください。",
      "屋外での活動は早朝か夜遅くに制限してください。",
    ],
    landslide: [
      "急な斜面や崖から離れてください。",
      "地面のひび割れや岩の落下などの兆候に注意してください。",
      "屋内の場合は、山側から離れた上の階に行ってください。",
      "木のひび割れや岩のぶつかる音などの異常な音に耳を傾けてください。",
      "地滑りの後は、二次的な滑りが発生する可能性があるため、その地域から離れてください。",
    ],
  },
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
  const { language } = useLanguageStore();
  const t = (key: keyof typeof translations.en) => translations[language][key];
  const { location } = useSetupStore();
  const [selectedDisaster, setSelectedDisaster] = useState<null | { type: string; stepsKey: string }>(null);

  const sortedDisasters = SURVIVAL_GUIDE.disasters
    .map((disaster) => ({
      ...disaster,
      score: getDisasterScore(disaster.type, location.region),
    }))
    .sort((a, b) => b.score - a.score);

  const selectedSteps = selectedDisaster ? stepsData[language][selectedDisaster.stepsKey as keyof typeof stepsData.en] : [];

  return (
    <>
      <View style={{ marginVertical: 35 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 0 }}>
          {t('survivalGuides')}
        </Text>
        <Text style={{ fontSize: 12, color: "#9F9F9F", marginBottom: 12 }}>
          {t('tapIconForSteps')}
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
              <FontAwesome6 name={getIconName(disaster.type)} size={22} color="#3B82F6" />
            </TouchableOpacity>
          )}
        />
      </View>

      <Modal
        visible={selectedDisaster !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedDisaster(null)}
      >
        <View style={{ flex: 1 }}>
          <View style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#F0F0F0",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <FontAwesome6 name={getIconName(selectedDisaster?.type || "")} size={28} color="#3B82F6" />
              <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1F2937" }}>
                {t(selectedDisaster?.type.toLowerCase().replace(' ', '') as keyof typeof translations.en)} {t('survival')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedDisaster(null)} style={{ padding: 8 }}>
              <FontAwesome6 name="xmark" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {selectedSteps.map((step, idx) => (
              <View key={idx} style={{ flexDirection: "row", marginBottom: 24, alignItems: "flex-start" }}>
                <View style={{
                  width: 32, height: 32, borderRadius: 16, backgroundColor: "#3B82F6",
                  justifyContent: "center", alignItems: "center", marginRight: 12, marginTop: 2,
                }}>
                  <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>{idx + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 16, lineHeight: 24, color: "#374151" }}>{step}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={() => setSelectedDisaster(null)}
            style={{ margin: 20, backgroundColor: "#3B82F6", paddingVertical: 14, borderRadius: 30, alignItems: "center" }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>{t('close')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
} 