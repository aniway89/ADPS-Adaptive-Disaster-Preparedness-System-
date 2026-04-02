import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function OnboardingLayout() {
    return(
        <>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
            
        </>
    )
}