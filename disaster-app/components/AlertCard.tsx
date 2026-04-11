import Ionicons from '@expo/vector-icons/Ionicons'; // or react-native-vector-icons/Ionicons
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Type for a single alert
interface AlertItem {
  title: string;
  riskLevel: number; // 0-100
}

// Props for the card component
interface AlertCardProps {
  alerts: AlertItem[]; // Array of alerts with risk levels
}
// Map alert title to icon name and color
const getAlertIcon = (title: string): { name: keyof typeof Ionicons.glyphMap; color: string } => {
  switch (title) {
    case 'Flood Risk':
      return { name: 'water', color: '#1E88E5' };
    case 'Storm Risk':
      return { name: 'thunderstorm', color: '#5E35B1' };
    case 'Heatwave Risk':
      return { name: 'sunny', color: '#F39C12' };
    case 'Earthquake Risk':
      return { name: 'pulse', color: '#E53935' };
    default:
      return { name: 'alert-circle', color: '#757575' };
  }
};

// Helper to get background color based on risk level
const getRiskBackground = (riskLevel: number): string => {
  if (riskLevel >= 80) return '#FFEBEE'; // high risk
  if (riskLevel >= 60) return '#FFF3E0'; // medium-high
  if (riskLevel >= 40) return '#FFFDE7'; // medium
  return '#E8F5E9'; // low
};

const AlertCard: React.FC<AlertCardProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <View style={styles.noAlertContainer}>
        <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
        <Text style={styles.noAlertText}>No active disaster alerts</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {alerts.map((alert, index) => {
        const { name, color } = getAlertIcon(alert.title);
        return (
          <View
            key={index}
            style={[
              styles.card,
              { backgroundColor: getRiskBackground(alert.riskLevel) },
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={name} size={28} color={color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.riskText}>Risk: {alert.riskLevel}%</Text>
            </View>
            <View style={styles.riskBadge}>
              <Text style={styles.riskBadgeText}>
                {alert.riskLevel >= 70 ? 'HIGH' : alert.riskLevel >= 40 ? 'MEDIUM' : 'LOW'}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
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
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  riskText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  riskBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
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
  noAlertText: {
    fontSize: 16,
    color: '#2E7D32',
    marginLeft: 8,
  },
});

export default AlertCard;