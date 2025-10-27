import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { PersonalInfoScreen } from '../screens/PersonalInfoScreen';
import { WhatsAppValidationScreen } from '../screens/WhatsAppValidationScreen';
import { EmailValidationScreen } from '../screens/EmailValidationScreen';
import EmailScreen from '../screens/EmailScreen';
import { RootStackParamList, ScreenNames } from '../types/navigation';
import { LocationScreen } from '../screens/LocationScreen';
import { SecurityScreen } from '../screens/SecurityScreen';
import SuccessScreen from '../screens/SuccessScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ScreenNames.Splash}
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen
          name={ScreenNames.Splash}
          options={{}}
        >
          {() => <SplashScreen />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.Login}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <LoginScreen />}
        </Stack.Screen>

        <Stack.Screen
          name={ScreenNames.PersonalInfo}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <PersonalInfoScreen />}
        </Stack.Screen>

        <Stack.Screen
          name={ScreenNames.WhatsAppValidation}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <WhatsAppValidationScreen />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.Email}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <EmailScreen />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.EmailValidation}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <EmailValidationScreen />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.Location}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <LocationScreen />}
        </Stack.Screen>
        {/* Rota de Segurança adicionada */}
        <Stack.Screen
          name={ScreenNames.Security}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <SecurityScreen />}
        </Stack.Screen>
        {/* Rota de Sucesso adicionada */}
        <Stack.Screen
          name={ScreenNames.Success}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <SuccessScreen />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.CompanySelection}
          component={() => null} // Placeholder para próxima tela
          options={{}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};