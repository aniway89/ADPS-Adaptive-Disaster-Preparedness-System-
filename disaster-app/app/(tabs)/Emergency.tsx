import { useSetupStore } from "@/utils/setup";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const { setIsSetuped } = useSetupStore();

  // Shared state across steps
  const [name, setName] = useState("");

  // 🔥 Steps array (scalable system)
  const steps = [
    <WelcomeStep onNext={() => setStep(1)} key="welcome" />,
    <UserFormStep
      name={name}
      setName={setName}
      onNext={() => setStep(2)}
      key="form"
    />,
    <FinishStep onDone={setIsSetuped} key="finish" />,
  ];

  return <View style={styles.container}>{steps[step]} </View>;
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
  name,
  setName,
  onNext,
}: {
  name: string;
  setName: (val: string) => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.step}>
      <Text style={styles.title}>Your Name</Text>

      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Button
        title="Next"
        onPress={onNext}
        disabled={!name} // 🔥 validation
      />
    </View>
  );
}



function FinishStep({ onDone }: { onDone: () => void }) {
  return (
    <View style={styles.step}>
      <Text style={styles.title}>All Set 🎉</Text>
      <Text style={styles.subtitle}>You’re ready to go</Text>
      <Button title="Finish" onPress={onDone} />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    padding: 20,
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
    padding: 10,
    color: "#fff",
  },
});