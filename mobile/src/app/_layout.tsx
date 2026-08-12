import { Stack } from 'expo-router';
import { FontProvider } from './FontContext';

export default function Layout() {
  return (
    <FontProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0F766E' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerShown: false,
        }}
      />
    </FontProvider>
  );
}