import { Stack } from "expo-router";
import React from "react";

export default function RootLayout(){
    const issetuped = true; // Replace with actual logic to determine if onboarding is completed
    return(
        <React.Fragment>
            <Stack>
                <Stack.Protected guard={!issetuped}>
                    <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                </Stack.Protected>
                <Stack.Protected guard={issetuped}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack.Protected>
            </Stack>
        </React.Fragment>
    )
}