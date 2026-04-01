import { Stack } from 'expo-router';
import React from 'react';
export default function OnboardingLayout(){

    return(
        <React.Fragment>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
        </React.Fragment>

    );
}