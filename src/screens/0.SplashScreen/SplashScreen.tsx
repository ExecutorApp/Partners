import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Image, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Comfortaa_400Regular } from '@expo-google-fonts/comfortaa';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ScreenNames } from '../../types/navigation';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface SplashScreenProps {}

export const SplashScreen: React.FC<SplashScreenProps> = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  
  const [fontsLoaded] = useFonts({
    DMSans_700Bold,
    Comfortaa_400Regular,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace(ScreenNames.Login);
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfcfc" />
      <View style={styles.container}>
        {/* Barra superior (equivalente ao a01 do Figma) */}
        <Image 
          source={require('../../../assets/mh3u9leq-8656ibk.svg')} 
          style={styles.topBar}
          resizeMode="stretch"
        />
        
        {/* Conteúdo principal centralizado (equivalente ao a013 do Figma) */}
        <View style={styles.content}>
          {/* Container do logo (equivalente ao a02 do Figma) */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/mh3u9leq-i4mph36.svg')} 
              style={styles.logoIcon}
              resizeMode="contain"
            />
          </View>
          
          {/* Container do texto (equivalente ao a012 do Figma) */}
          <View style={styles.textContainer}>
            <Text
              style={[
              styles.title,
              Platform.OS === 'web' ? ({ whiteSpace: 'nowrap' } as any) : null,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              Partners
            </Text>
            <Text
              style={[
              styles.subtitle,
              Platform.OS === 'web' ? ({ whiteSpace: 'nowrap' } as any) : null,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
               sua plataforma de parcerias inteligentes
             </Text>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: '#fcfcfc',
    paddingVertical: 4,
    paddingHorizontal: 10,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  topBar: {
    flexShrink: 0,
    alignSelf: 'stretch',
    width: '100%',
    height: 36,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingBottom: 135,
    gap: 25,
  },
  logoContainer: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  logoIcon: {
    flexShrink: 0,
    borderRadius: 99,
    width: 160,
    height: 160,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  title: {
    flexShrink: 1,
    alignSelf: 'stretch',
    textAlign: 'center',
    lineHeight: 83,
    letterSpacing: 0,
    color: '#111b31',
    fontFamily: 'DMSans_700Bold',
    fontSize: 64,
    fontWeight: '700',
    width: '100%',
  },
  subtitle: {
    flexShrink: 1,
    alignSelf: 'stretch',
    marginTop: -10,
    paddingTop: 10,
    textAlign: 'center',
    lineHeight: 13,
    letterSpacing: 0,
    color: '#4b4b4b',
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 12,
    width: '100%',
  },
});