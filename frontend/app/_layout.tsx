import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen 
              name="delivery/[id]" 
              options={{ 
                presentation: 'card',
                animation: 'slide_from_bottom',
              }} 
            />
            <Stack.Screen 
              name="return/[id]" 
              options={{ 
                presentation: 'card',
                animation: 'slide_from_bottom',
              }} 
            />
            <Stack.Screen 
              name="reservation/[id]" 
              options={{ 
                presentation: 'card',
                animation: 'slide_from_bottom',
              }} 
            />
            <Stack.Screen 
              name="nfc-scan" 
              options={{ 
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }} 
            />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
