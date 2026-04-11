import DisasterList from '@/components/DisasterList';
import { useSetupStore } from '@/utils/setup';
import { FontAwesome6 } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Emergency contacts data (you can customize numbers)
const EMERGENCY_CONTACTS = [
  {
    id: 'police',
    name: 'Police',
    number: '100',
    icon: 'shield-haltered',
    color: '#3B82F6',
  },
  {
    id: 'ambulance',
    name: 'Ambulance',
    number: '102',
    icon: 'truck-medical',
    color: '#EF4444',
  },
  {
    id: 'fire',
    name: 'Fire Brigade',
    number: '101',
    icon: 'fire-extinguisher',
    color: '#F59E0B',
  },
  {
    id: 'disaster',
    name: 'Disaster Management',
    number: '108',
    icon: 'head-side-mask',
    color: '#8B5CF6',
  },
];

// Quick actions for different disasters

export default function EmergencyScreen() {
  const { location, coords } = useSetupStore();
  const [sending, setSending] = useState(false);

  const handleCall = (number: string, name: string) => {
    Alert.alert(
      `Call ${name}`,
      `Are you sure you want to call ${name} at ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            const url = `tel:${number}`;
            Linking.canOpenURL(url)
              .then((supported) => {
                if (supported) Linking.openURL(url);
                else Alert.alert('Error', 'Phone calls are not supported on this device');
              })
              .catch(() => Alert.alert('Error', 'Unable to make the call'));
          },
        },
      ]
    );
  };
const { emergencyContact } = useSetupStore();
const sendSOS = async () => {
  setSending(true);
  try {
    let locationString = coords ? `\n\nMy location: https://maps.google.com/?q=${coords.lat},${coords.lon}` : '';
    const message = `🚨 EMERGENCY SOS 🚨\n\nI need immediate help!${locationString}`;
    
    if (emergencyContact && emergencyContact.length >= 10) {
      // Send SMS to the stored emergency contact
      const url = `sms:${emergencyContact}?body=${encodeURIComponent(message)}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Share.share({ message });
      }
    } else {
      // Fallback: share via any app
      await Share.share({ message });
    }
  } catch (error) {
    Alert.alert('Error', 'Could not send SOS');
  } finally {
    setSending(false);
  }
};

  const shareLocation = async () => {
    if (!coords) {
      Alert.alert('Location not available', 'Your location is not yet determined.');
      return;
    }
    const locationUrl = `https://maps.google.com/?q=${coords.lat},${coords.lon}`;
    try {
      await Share.share({
        message: `I'm currently here: ${locationUrl}`,
        title: 'My Location',
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share location');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 60,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#EF4444' }}>
            Emergency
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            Quick access to help and safety information
          </Text>
        </View>

        {/* SOS Button */}
        <TouchableOpacity
          onPress={sendSOS}
          disabled={sending}
          style={{
            backgroundColor: '#EF4444',
            borderRadius: 60,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <FontAwesome6 name="triangle-exclamation" size={24} color="white" style={{ marginRight: 12 }} />
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
            {sending ? 'Sending...' : 'SEND SOS'}
          </Text>
        </TouchableOpacity>

        {/* Emergency Contacts */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2937' }}>
            Emergency Contacts
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {EMERGENCY_CONTACTS.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                onPress={() => handleCall(contact.number, contact.name)}
                style={{
                  width: '48%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 12,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: '#F0F0F0',
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: `${contact.color}15`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <FontAwesome6 name={contact.icon as any} size={22} color={contact.color} />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                    {contact.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>{contact.number}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions & Tips */}
        <View style={{ marginBottom: 24 }}>
            <DisasterList/>
        </View>

        {/* Share Location Button */}
        <TouchableOpacity
          onPress={shareLocation}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#3B82F6',
          }}
        >
          <FontAwesome6 name="location-dot" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
          <Text style={{ color: '#3B82F6', fontWeight: '600', fontSize: 16 }}>
            Share My Location
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}