import { useSetupStore } from "@/utils/setup";
import * as Location from 'expo-location';
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function OnboardingScreen() {
  const { setIsSetuped } = useSetupStore();
  const [step, setStep] = useState(0);
  const { adults,  setAdults,  } = useSetupStore();
  const nextStep = () =>
    setStep((prev) => Math.min(prev + 1, 3));

  const prevStep = () =>
    setStep((prev) => Math.max(prev - 1, 0));
  
  const steps = [
    <WelcomeStep onNext={nextStep} key="welcome" />,

    <UserFormStep
      adults={adults} //getting error under line in this line
      setAdults={setAdults} //getting error under line in this line
      onNext={nextStep}
      onBack={prevStep}
      key="form"
    />,
    <LocationStep
      onNext={nextStep}
      onBack={prevStep}
      key="location"
    />,
    <FinishStep
      onDone={() => {setIsSetuped(); // ✅ keep your original function
        router.replace("/");
      }}
      onBack={prevStep}
      key="finish"
    />,
  ];

  return (
    <View style={styles.container}>
      {steps[step]}
    </View>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.step}>
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.subtitle}>Let’s set things up</Text>
      <Button title="Start" onPress={onNext} />
    </View>
  );
}

function UserFormStep({
adults, 
setAdults, 
onBack, 
onNext, 
}: {
  adults: string;
  setAdults: (val: string) => void;
  onBack: () => void;
  onNext: () => void; }){
  const value = Number(adults) || 1;

  const increase = () => {
    if (value < 60) setAdults(String(value + 1));
  };

  const decrease = () => {
    if (value > 1) setAdults(String(value - 1));
  };

  return (
    <View style={styles.step}>
      <Text style={styles.title}>People around you</Text>

      {/* Stepper */}
      <View style={styles.stepper}>
        <Button title="-" onPress={decrease} disabled={value <= 1} />
        
        <Text style={styles.count}>{value}</Text>
        
        <Button title="+" onPress={increase} disabled={value >= 60} />
      </View>

      <Button title="Next" onPress={onNext} />
      <Button title="Back" onPress={onBack} />
    </View>
  );
}
function FinishStep({
  onDone,
  onBack,
}: {
  onDone: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.step}>
      <Text style={styles.title}>All Set 🎉</Text>
      <Text style={styles.subtitle}>
        You’re ready to go. Your setup is complete.
      </Text>

      <Button title="Finish" onPress={onDone} />
      <Button title="Back" onPress={onBack} />
    </View>
  );
}


export const getState = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const { coords } = await Location.getCurrentPositionAsync({});
  const [addr] = await Location.reverseGeocodeAsync(coords);

  return addr?.region || null; // ✅ state
};


function LocationStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      const [addr] = await Location.reverseGeocodeAsync(coords);

      setState(addr?.region || null); //getting error under line in this line
      setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.step}>
      <Text style={styles.title}>Location Access 📍</Text>

      <Text style={styles.subtitle}>
        We need your location to provide accurate emergency support.
      </Text>

      {loading ? (
        <Text style={{ color: "#aaa" }}>Getting location...</Text>
      ) : (
        <Text style={{ color: "#7B68EE" }}>
          State: {state || "Not available"}
        </Text>
      )}

      <Button title="Next" onPress={onNext} disabled={!state} />
      <Button title="Back" onPress={onBack} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#0A0A0A",
  },
  step: {
    gap: 20,
  },
  title: {
    fontSize: 28,
    color: "#7B68EE",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
  },
  stepper: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 20,
},

count: {
  fontSize: 32,
  color: "#fff",
  fontWeight: "bold",
},
});