import DisasterList from '@/components/DisasterList';
import { reverseGeocode } from '@/utils/geocoding';
import { useLanguageStore } from '@/utils/languageStore';
import { useSetupStore } from '@/utils/setup';
import { FontAwesome6 } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
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

// ---------- Translations (same as yours) ----------
const translations = {
  en: {
    emergency: "Emergency",
    emergencySubtitle: "Quick access to help and safety information",
    sendSOS: "SEND SOS",
    sending: "Sending...",
    emergencyContacts: "Emergency Contacts",
    police: "Police",
    ambulance: "Ambulance",
    fireBrigade: "Fire Brigade",
    disasterManagement: "Disaster Management",
    shareMyLocation: "Share My Location",
    callConfirmTitle: "Call {{name}}",
    callConfirmMessage: "Are you sure you want to call {{name}} at {{number}}?",
    call: "Call",
    cancel: "Cancel",
    error: "Error",
    phoneNotSupported: "Phone calls are not supported on this device",
    unableToCall: "Unable to make the call",
    locationNotAvailable: "Location not available",
    locationNotAvailableMsg: "Your location is not yet determined.",
    shareLocationMsg: "I'm currently here: {{url}}",
    myLocation: "My Location",
    sosErrorMessage: "Could not send SOS",
  },
  ja: {
    emergency: "緊急",
    emergencySubtitle: "ヘルプや安全情報へのクイックアクセス",
    sendSOS: "SOSを送信",
    sending: "送信中...",
    emergencyContacts: "緊急連絡先",
    police: "警察",
    ambulance: "救急車",
    fireBrigade: "消防署",
    disasterManagement: "災害管理",
    shareMyLocation: "現在地を共有",
    callConfirmTitle: "{{name}}に電話",
    callConfirmMessage: "{{name}}（{{number}}）に電話してもよろしいですか？",
    call: "電話",
    cancel: "キャンセル",
    error: "エラー",
    phoneNotSupported: "このデバイスでは電話はサポートされていません",
    unableToCall: "電話をかけることができませんでした",
    locationNotAvailable: "位置情報が利用できません",
    locationNotAvailableMsg: "現在地がまだ取得できていません。",
    shareLocationMsg: "現在ここにいます：{{url}}",
    myLocation: "現在地",
    sosErrorMessage: "SOSを送信できませんでした",
  },
};

// ---------- Country-specific emergency numbers ----------
type ContactKey = 'police' | 'ambulance' | 'fireBrigade' | 'disasterManagement';

const COUNTRY_EMERGENCY_MAP: Record<string, Record<ContactKey, string>> = {
  IN: { police: '100', ambulance: '102', fireBrigade: '101', disasterManagement: '108' },
  JP: { police: '110', ambulance: '119', fireBrigade: '119', disasterManagement: '118' },
  // Add more countries as needed
};

const DEFAULT_CONTACTS: Record<ContactKey, string> = {
  police: '112',
  ambulance: '112',
  fireBrigade: '112',
  disasterManagement: '112',
};

// Helper to build contact list from country code
const getContactsForCountry = (countryCode: string) => {
  const numbers = COUNTRY_EMERGENCY_MAP[countryCode] || DEFAULT_CONTACTS;
  return [
    { id: 'police', nameKey: 'police', number: numbers.police, icon: 'shield', color: '#3B82F6' },
    { id: 'ambulance', nameKey: 'ambulance', number: numbers.ambulance, icon: 'truck-medical', color: '#EF4444' },
    { id: 'fire', nameKey: 'fireBrigade', number: numbers.fireBrigade, icon: 'fire-extinguisher', color: '#F59E0B' },
    { id: 'disaster', nameKey: 'disasterManagement', number: numbers.disasterManagement, icon: 'head-side-mask', color: '#8B5CF6' },
  ];
};

export default function EmergencyScreen() {
  const { language } = useLanguageStore();
  const { coords, emergencyContact, country, setCountry } = useSetupStore();
  const [sending, setSending] = useState(false);
  const [detectingCountry, setDetectingCountry] = useState(false);

  // Translation function with parameter interpolation
  const t = (key: keyof typeof translations.en, params?: any) => {
    let str = translations[language][key];
    if (params) Object.keys(params).forEach(k => str = str.replace(`{{${k}}}`, params[k]));
    return str;
  };

  // Auto-detect country from coordinates if not already set
  useEffect(() => {
    const detectCountry = async () => {
      if (coords && !country && !detectingCountry) {
        setDetectingCountry(true);
        const code = await reverseGeocode(coords.lat, coords.lon);
        if (code) setCountry(code);
        setDetectingCountry(false);
      }
    };
    detectCountry();
  }, [coords, country, detectingCountry, setCountry]);

  // Build contacts dynamically based on current country
  const emergencyContacts = useMemo(() => getContactsForCountry(country), [country]);

  // ---------- Action Handlers (unchanged) ----------
  const handleCall = (number: string, nameKey: string) => {
    const name = t(nameKey as any);
    Alert.alert(
      t('callConfirmTitle', { name }),
      t('callConfirmMessage', { name, number }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('call'),
          onPress: () => {
            const url = `tel:${number}`;
            Linking.canOpenURL(url)
              .then((supported) => {
                if (supported) Linking.openURL(url);
                else Alert.alert(t('error'), t('phoneNotSupported'));
              })
              .catch(() => Alert.alert(t('error'), t('unableToCall')));
          },
        },
      ]
    );
  };

  const sendSOS = async () => {
    setSending(true);
    try {
      let locationString = coords ? `\n\nMy location: https://maps.google.com/?q=${coords.lat},${coords.lon}` : '';
      const message = `🚨 EMERGENCY SOS 🚨\n\nI need immediate help!${locationString}`;
      if (emergencyContact && emergencyContact.length >= 10) {
        const url = `sms:${emergencyContact}?body=${encodeURIComponent(message)}`;
        const supported = await Linking.canOpenURL(url);
        if (supported) await Linking.openURL(url);
        else await Share.share({ message });
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      Alert.alert(t('error'), t('sosErrorMessage'));
    } finally {
      setSending(false);
    }
  };

  const shareLocation = async () => {
    if (!coords) {
      Alert.alert(t('locationNotAvailable'), t('locationNotAvailableMsg'));
      return;
    }
    const locationUrl = `https://maps.google.com/?q=${coords.lat},${coords.lon}`;
    try {
      await Share.share({
        message: t('shareLocationMsg', { url: locationUrl }),
        title: t('myLocation'),
      });
    } catch (error) {
      Alert.alert(t('error'), 'Could not share location');
    }
  };

  // ---------- Render ----------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 60, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#EF4444' }}>{t('emergency')}</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>{t('emergencySubtitle')}</Text>
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
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{sending ? t('sending') : t('sendSOS')}</Text>
        </TouchableOpacity>

        {/* Emergency Contacts Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2937' }}>{t('emergencyContacts')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {emergencyContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                onPress={() => handleCall(contact.number, contact.nameKey)}
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
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${contact.color}15`, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <FontAwesome6 name={contact.icon as any} size={22} color={contact.color} />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{t(contact.nameKey as any)}</Text>
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>{contact.number}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Disaster List Component */}
        <View style={{ marginBottom: 24 }}>
          <DisasterList />
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
          <Text style={{ color: '#3B82F6', fontWeight: '600', fontSize: 16 }}>{t('shareMyLocation')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}