import { useSetupStore } from "@/utils/setup";
import { router } from "expo-router";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";


export default function OnboardingScreen() {
  const { setIsSetuped } = useSetupStore();
  const [step, setStep] = useState(0);
  const { adults,  setAdults,  } = useSetupStore();
  const nextStep = () =>
    setStep((prev) => Math.min(prev + 1, 2));

  const prevStep = () =>
    setStep((prev) => Math.max(prev - 1, 0));

  const steps = [
    <WelcomeStep onNext={nextStep} key="welcome" />,

    <UserFormStep
      adults={adults}
      setAdults={setAdults}
      onNext={nextStep}
      onBack={prevStep}
      key="form"
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
  children: string;
  setAdults: (val: string) => void;
  setChildren: (val: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.step}>
      <Text style={styles.title}>People around you</Text>

      <TextInput
        placeholder="How many adults?"
        value={adults}
        onChangeText={(val) => {
        // remove non-numbers
        let num = val.replace(/[^0-9]/g, "");

        // limit length (optional, prevents big numbers like 9999)
        if (num.length > 2) return;

        // convert to number
        const n = Number(num);

        // allow empty (so user can delete)
        if (num === "") {
          setAdults("");
          return;
        }

        // restrict range 1–20
        if (n >= 1 && n <= 20) {
          setAdults(num);
        }
      }}
        style={styles.input}
        keyboardType="numeric"
      />

      <Button
        title="Next"
        onPress={onNext}
        disabled={!adults || Number(adults) === 0}
      />

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
  input: {
    borderWidth: 1,
    borderColor: "#7B68EE",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    backgroundColor: "#1A1A1A",
  },
});