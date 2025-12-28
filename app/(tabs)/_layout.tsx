import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';
import { Platform, useWindowDimensions } from 'react-native';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  
  // Calculate proper bottom padding for tab bar
  // Android navigation bar is typically ~48dp, iOS home indicator ~34pt
  const tabBarHeight = 56;
  const androidNavBarHeight = 48; // Standard Android navigation bar height
  
  // Use insets.bottom for iOS, add extra padding for Android to account for navigation bar
  const bottomPadding = Platform.select({
    ios: Math.max(insets.bottom, 8),
    android: Math.max(insets.bottom, androidNavBarHeight, 16),
    default: 8,
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: tabBarHeight + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          // Ensure tab bar is above system navigation
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        // Add padding to screen content so it doesn't go behind tab bar
        sceneContainerStyle: {
          paddingBottom: 0, // Screens should handle their own bottom padding
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Rezervasyonlar',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Araçlar',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "car-sport" : "car-sport-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Harita',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "map" : "map-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
