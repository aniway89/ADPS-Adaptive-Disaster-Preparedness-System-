import { useLanguageStore } from '@/utils/languageStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AlertItem {
  title: string;
  riskLevel: number;
}

interface AlertCardProps {
  alerts: AlertItem[];
}

const translations = {
  en: {
    noActiveAlerts: "No active disaster alerts",
    risk: "Risk",
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
  },
  ja: {
    noActiveAlerts: "アクティブな災害警報はありません",
    risk: "リスク",
    high: "高",
    medium: "中",
    low: "低",
  },
};

const getAlertIcon = (title: string): { name: keyof typeof Ionicons.glyphMap; color: string } => {
  switch (title) {
    case 'Flood Risk': return { name: 'water', color: '#1E88E5' };
    case 'Storm Risk': return { name: 'thunderstorm', color: '#5E35B1' };
    case 'Heatwave Risk': return { name: 'sunny', color: '#F39C12' };
    case 'Earthquake Risk': return { name: 'pulse', color: '#E53935' };
    default: return { name: 'alert-circle', color: '#757575' };
  }
};

const getRiskBackground = (riskLevel: number): string => {
  if (riskLevel >= 80) return '#FFEBEE';
  if (riskLevel >= 60) return '#FFF3E0';
  if (riskLevel >= 40) return '#FFFDE7';
  return '#E8F5E9';
};

export default function AlertCard({ alerts }: AlertCardProps) {
  const { language } = useLanguageStore();
  const t = (key: keyof typeof translations.en) => translations[language][key];

  if (!alerts || alerts.length === 0) {
    return (
      <View style={styles.noAlertContainer}>
        <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
        <Text style={styles.noAlertText}>{t('noActiveAlerts')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {alerts.map((alert, index) => {
        const { name, color } = getAlertIcon(alert.title);
        const riskLabel = alert.riskLevel >= 70 ? 'high' : alert.riskLevel >= 40 ? 'medium' : 'low';
        return (
          <View
            key={index}
            style={[styles.card, { backgroundColor: getRiskBackground(alert.riskLevel) }]}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={name} size={28} color={color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.riskText}>{t('risk')}: {alert.riskLevel}%</Text>
            </View>
            <View style={styles.riskBadge}>
              <Text style={styles.riskBadgeText}>{t(riskLabel)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 0, marginVertical: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: { marginRight: 16 },
  textContainer: { flex: 1 },
  alertTitle: { fontSize: 18, fontWeight: '600', color: '#222' },
  riskText: { fontSize: 14, color: '#555', marginTop: 4 },
  riskBadge: { backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  riskBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  noAlertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    marginHorizontal: 0,
    marginVertical: 8,
  },
  noAlertText: { fontSize: 16, color: '#2E7D32', marginLeft: 8 },
});