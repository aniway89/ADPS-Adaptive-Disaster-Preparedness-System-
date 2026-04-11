import { useLanguageStore } from "@/utils/languageStore";
import { useSetupStore } from "@/utils/setup";
import { FontAwesome6 } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ---------- Localized text (English & Japanese) ----------
const translations = {
  en: {
    languageSelect: {
      title: "Select Language",
      subtitle: "Choose your preferred language",
      english: "English",
      japanese: "日本語",
    },
    welcome: {
      title: "Disaster Ready",
      subtitle: "Be prepared, stay safe. Let’s set up your emergency profile.",
      button: "Get Started →",
    },
    userForm: {
      title: "How many people are with you?",
      subtitle: "This helps estimate emergency supplies.",
      back: "Back",
      next: "Next",
    },
    sos: {
      title: "Emergency Contact",
      subtitle: "Add a trusted phone number to receive SOS alerts.",
      placeholder: "+91 98765 43210",
      helper: "We’ll use this number when you press SOS.",
      back: "Back",
      next: "Next",
    },
    location: {
      title: "Enable Location",
      subtitle: "We need your location to show local risks and emergency services.",
      back: "Back",
      next: "Next",
    },
    finish: {
      title: "You’re Ready! 🎉",
      subtitle: "Your emergency profile is set. You can now use the app to prepare and stay safe.",
      button: "Go to Home",
    },
  },
  ja: {
    languageSelect: {
      title: "言語を選択",
      subtitle: "希望する言語を選んでください",
      english: "English",
      japanese: "日本語",
    },
    welcome: {
      title: "防災準備",
      subtitle: "備えて、安全に。緊急プロフィールを設定しましょう。",
      button: "始める →",
    },
    userForm: {
      title: "一緒にいる人は何人ですか？",
      subtitle: "緊急物資の見積もりに役立ちます。",
      back: "戻る",
      next: "次へ",
    },
    sos: {
      title: "緊急連絡先",
      subtitle: "SOSアラートを受信する信頼できる電話番号を追加してください。",
      placeholder: "090-1234-5678",
      helper: "SOSを押すとこの番号に送信されます。",
      back: "戻る",
      next: "次へ",
    },
    location: {
      title: "位置情報を有効にする",
      subtitle: "地域のリスクと緊急サービスを表示するために位置情報が必要です。",
      back: "戻る",
      next: "次へ",
    },
    finish: {
      title: "準備完了！🎉",
      subtitle: "緊急プロフィールが設定されました。アプリで備えを整えて安全に過ごしましょう。",
      button: "ホームへ",
    },
  },
};

export default function OnboardingScreen() {
  const { setIsSetuped } = useSetupStore();
  const { language, setLanguage } = useLanguageStore();
  const [step, setStep] = useState(0);
  const { adults, setAdults, emergencyContact, setEmergencyContact } = useSetupStore();

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  // Steps array (language selection is step 0)
  const steps = [
    <LanguageStep
      key="lang"
      onSelect={(lang) => {
        setLanguage(lang);
        nextStep();
      }}
    />,
    <WelcomeStep onNext={nextStep} key="welcome" />,
    <UserFormStep
      adults={adults}
      setAdults={setAdults}
      onNext={nextStep}
      onBack={prevStep}
      key="form"
    />,
    <SOSStep
      emergencyContact={emergencyContact}
      setEmergencyContact={setEmergencyContact}
      onNext={nextStep}
      onBack={prevStep}
      key="sos"
    />,
    <LocationStep onNext={nextStep} onBack={prevStep} key="location" />,
    <FinishStep
      onDone={() => {
        setIsSetuped();
        router.replace("/check_List");
      }}
      key="finish"
    />,
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {steps[step]}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---------- Language Selection Step (always first) ----------
function LanguageStep({ onSelect }: { onSelect: (lang: 'en' | 'ja') => void }) {
  return (
    <View style={styles.stepCard}>
      <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}>
        <FontAwesome6 name="language" size={48} color="#3B82F6" />
      </View>
      <Text style={styles.title}>{translations.en.languageSelect.title}</Text>
      <Text style={styles.subtitle}>{translations.en.languageSelect.subtitle}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.primaryButton, { flex: 1 }]}
          onPress={() => onSelect('en')}
        >
          <Text style={styles.buttonText}>{translations.en.languageSelect.english}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, { flex: 1, backgroundColor: "#6B7280" }]}
          onPress={() => onSelect('ja')}
        >
          <Text style={styles.buttonText}>{translations.en.languageSelect.japanese}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------- Welcome Step (localized) ----------
function WelcomeStep({ onNext }: { onNext: () => void }) {
  const { language } = useLanguageStore();
  const t = translations[language];
  return (
    <View style={styles.stepCard}>
      <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}>
        <FontAwesome6 name="hands-helping" size={48} color="#3B82F6" />
      </View>
      <Text style={styles.title}>{t.welcome.title}</Text>
      <Text style={styles.subtitle}>{t.welcome.subtitle}</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.buttonText}>{t.welcome.button}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------- People around you (localized) ----------
function UserFormStep({
  adults,
  setAdults,
  onBack,
  onNext,
}: {
  adults: number;
  setAdults: (val: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { language } = useLanguageStore();
  const t = translations[language];
  const increase = () => adults < 60 && setAdults(adults + 1);
  const decrease = () => adults > 1 && setAdults(adults - 1);

  return (
    <View style={styles.stepCard}>
      <FontAwesome6 name="users" size={40} color="#3B82F6" style={styles.stepIcon} />
      <Text style={styles.title}>{t.userForm.title}</Text>
      <Text style={styles.subtitle}>{t.userForm.subtitle}</Text>

      <View style={styles.stepper}>
        <TouchableOpacity onPress={decrease} style={styles.stepperBtn}>
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.count}>{adults}</Text>
        <TouchableOpacity onPress={increase} style={styles.stepperBtn}>
          <Text style={styles.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{t.userForm.back}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext} style={styles.primaryButton}>
          <Text style={styles.buttonText}>{t.userForm.next}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------- SOS Emergency Contact Step (localized) ----------
function SOSStep({
  emergencyContact,
  setEmergencyContact,
  onBack,
  onNext,
}: {
  emergencyContact: string;
  setEmergencyContact: (val: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [phone, setPhone] = useState(emergencyContact);
  const isValid = phone.replace(/\D/g, "").length >= 10;

  const handleSave = () => {
    setEmergencyContact(phone);
    onNext();
  };

  return (
    <View style={styles.stepCard}>
      <FontAwesome6 name="phone-alt" size={40} color="#EF4444" style={styles.stepIcon} />
      <Text style={styles.title}>{t.sos.title}</Text>
      <Text style={styles.subtitle}>{t.sos.subtitle}</Text>

      <TextInput
        style={styles.input}
        placeholder={t.sos.placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Text style={styles.helperText}>{t.sos.helper}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{t.sos.back}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.primaryButton, !isValid && styles.disabledButton]}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>{t.sos.next}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------- Location Step (localized) ----------
function LocationStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [state, setState] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { setLocation, setCoords } = useSetupStore();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        Alert.alert("Permission needed", "Please enable location to continue.");
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      setCoords(coords.latitude, coords.longitude);
      const [addr] = await Location.reverseGeocodeAsync(coords);
      const locationInfo = {
        street: addr?.street || "",
        district: addr?.district || "",
        city: addr?.city || "",
        region: addr?.region || "",
      };
      const displayLocation = `${locationInfo.district ? locationInfo.district + ", " : ""}${locationInfo.city ? locationInfo.city + ", " : ""}${locationInfo.region}`;
      setState(displayLocation);
      setLocation(locationInfo);
      setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.stepCard}>
      <FontAwesome6 name="location-dot" size={40} color="#3B82F6" style={styles.stepIcon} />
      <Text style={styles.title}>{t.location.title}</Text>
      <Text style={styles.subtitle}>{t.location.subtitle}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <View style={styles.locationBox}>
          <Text style={styles.locationText}>{state || "Location not available"}</Text>
        </View>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{t.location.back}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext} style={styles.primaryButton} disabled={!state}>
          <Text style={styles.buttonText}>{t.location.next}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------- Finish Step (NO BACK BUTTON) ----------
function FinishStep({ onDone }: { onDone: () => void }) {
  const { language } = useLanguageStore();
  const t = translations[language];
  return (
    <View style={styles.stepCard}>
      <View style={[styles.iconCircle, { backgroundColor: "#ECFDF5" }]}>
        <FontAwesome6 name="circle-check" size={48} color="#10B981" />
      </View>
      <Text style={styles.title}>{t.finish.title}</Text>
      <Text style={styles.subtitle}>{t.finish.subtitle}</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={onDone}>
        <Text style={styles.buttonText}>{t.finish.button}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F9FAFB",
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  stepIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginVertical: 20,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  stepperBtnText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#4B5563",
  },
  count: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#1F2937",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 24,
  },
  locationBox: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
    width: "100%",
  },
  locationText: {
    fontSize: 16,
    color: "#1F2937",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 40,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 40,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
});