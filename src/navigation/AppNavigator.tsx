import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SplashScreen } from '../screens/0.SplashScreen/SplashScreen';
import { LoginScreen } from '../screens/1.Login/1. LoginScreen';
import { EnterpriseScreen } from '../screens/1.Login/2. EnterpriseScreen';
import ProductListScreen from '../screens/4.Products/1.ProductListScreen';
import PresentationScreen from '../screens/4.Products/3.PresentationScreen';
import { PersonalInfoScreen } from '../screens/2.Register/1. PersonalInfoScreen';
import { WhatsAppValidationScreen } from '../screens/2.Register/2. WhatsAppValidationScreen';
import { EmailValidationScreen } from '../screens/2.Register/4. EmailValidationScreen';
import EmailScreen from '../screens/2.Register/3. EmailScreen';
import { RootStackParamList, ScreenNames } from '../types/navigation';
import { LocationScreen } from '../screens/2.Register/5. LocationScreen';
import { SecurityScreen } from '../screens/2.Register/6. SecurityScreen';
import SuccessScreen from '../screens/2.Register/7. SuccessScreen';
import { VerificationMethodScreen } from '../screens/3.Change Password/1. VerificationMethodScreens';
import { EmailValidationScreen as ChangePasswordEmailValidationScreen } from '../screens/3.Change Password/2. EmailValidationScreen';
import { WhatsAppValidationScreen as ChangePasswordWhatsAppValidationScreen } from '../screens/3.Change Password/3. WhatsAppValidationScreen';
import { SecurityScreen as ChangePasswordSecurityScreen } from '../screens/3.Change Password/4. SecurityScreen';

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
          name={ScreenNames.Enterprise}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <EnterpriseScreen />}
        </Stack.Screen>

        <Stack.Screen
          name={ScreenNames.ProductList}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <ProductListScreen />}
        </Stack.Screen>

        <Stack.Screen
          name={ScreenNames.PresentationScreen}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <PresentationScreen />}
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
        {/* Rota específica para validação de email no fluxo de troca de senha */}
        <Stack.Screen
          name={ScreenNames.ChangePasswordEmailValidation}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <ChangePasswordEmailValidationScreen />}
        </Stack.Screen>
        {/* Rota específica para validação de WhatsApp no fluxo de troca de senha */}
        <Stack.Screen
          name={ScreenNames.ChangePasswordWhatsAppValidation}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <ChangePasswordWhatsAppValidationScreen />}
        </Stack.Screen>
        {/* Rota específica para Segurança no fluxo de troca de senha */}
        <Stack.Screen
          name={ScreenNames.ChangePasswordSecurity}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <ChangePasswordSecurityScreen />}
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
        {/* Rota de Verificação de Método para Troca de Senha */}
        <Stack.Screen
          name={ScreenNames.VerificationMethod}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <VerificationMethodScreen />}
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