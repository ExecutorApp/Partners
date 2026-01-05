import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ModalProvider } from './src/context/ModalContext';
import ModalRoot from './src/components/ModalRoot';
import {
  useFonts,
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, Platform.OS === 'web' ? ({ height: '100vh', minHeight: 0 } as any) : undefined]}> 
        <StatusBar style="dark" backgroundColor="#FCFCFC" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color="#1777CF" />
        </View>
      </View>
    );
  }
  return (
    <ModalProvider>
      <View style={[
        styles.container,
        Platform.OS === 'web' ? ({ height: '100vh', minHeight: 0 } as any) : undefined,
      ]}>
        <StatusBar style="dark" backgroundColor="#FCFCFC" />
        <AppNavigator />
        <ModalRoot />
      </View>
    </ModalProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
