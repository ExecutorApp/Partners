import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ScreenNames } from '../../types/navigation';
import { getPersonalInfo, clearPersonalInfo } from '../../utils/storage';

type SuccessScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Success'>;

const SuccessScreen: React.FC = () => {
  const navigation = useNavigation<SuccessScreenNavigationProp>();
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const personalInfo = await getPersonalInfo();
        if (personalInfo?.fullName) {
          // Extract first name from full name
          const firstNameOnly = personalInfo.fullName.split(' ')[0];
          setFirstName(firstNameOnly);
        } else {
          setFirstName('Usuário'); // Fallback name
        }
      } catch (error) {
        console.error('Error loading user name:', error);
        setFirstName('Usuário'); // Fallback name
      }
    };

    loadUserName();
  }, []);

  const handleFinalize = async () => {
    try {
      // Clear all stored data
      await clearPersonalInfo();
      
      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: ScreenNames.Login }],
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      // Still navigate to login even if clearing fails
      navigation.reset({
        index: 0,
        routes: [{ name: ScreenNames.Login }],
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Main illustration */}
      <Image 
        source={require('../../../.figma/image/mh8c048h-ftz53nz.svg')} 
        style={styles.mainImage}
        resizeMode="contain"
      />

      {/* Text content */}
      <View style={styles.textContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.congratsTitle}>Parabéns, {firstName}</Text>
        </View>
        
        <View style={styles.subtitleContainer}>
          <Text style={styles.successSubtitle}>
            Sua conta foi criada com sucesso!
          </Text>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            <Text style={styles.descriptionNormal}>Clique em "</Text>
            <Text style={styles.descriptionHighlight}>Finalizar</Text>
            <Text style={styles.descriptionNormal}>
              " para acessar sua conta {'\n'}e aproveitar tudo o que preparamos pra você!
            </Text>
          </Text>
        </View>
      </View>

      {/* Bottom section with button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.finalizeButton} onPress={handleFinalize}>
          <Text style={styles.finalizeButtonText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 0,
    paddingTop: 80,
  },
  mainImage: {
    width: 324,
    height: 270,
    marginBottom: 18,
  },
  textContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: 4,
    marginBottom: 18,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  congratsTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#3A3F51',
    letterSpacing: 0,
  },
  subtitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  successSubtitle: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#3A3F51',
    letterSpacing: 0,
  },
  descriptionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0,
    lineHeight: 20,
  },
  descriptionNormal: {
    color: '#7D8592',
  },
  descriptionHighlight: {
    color: '#1777CF',
  },
  bottomContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 335,
  },
  finalizeButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1777CF',
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 143,
    paddingVertical: 11,
    marginBottom: 20,
  },
  finalizeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#FCFCFC',
    lineHeight: 19,
    letterSpacing: 0,
  },
});

export default SuccessScreen;