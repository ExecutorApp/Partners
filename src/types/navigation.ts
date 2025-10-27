export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  CompanySelection: undefined;
  PersonalInfo: undefined;
  WhatsAppValidation: undefined;
  Email: undefined;
  EmailValidation: undefined;
  Location: undefined;
  Security: undefined;
  Success: undefined;
};

export const ScreenNames = {
  Splash: 'Splash' as const,
  Login: 'Login' as const,
  CompanySelection: 'CompanySelection' as const,
  PersonalInfo: 'PersonalInfo' as const,
  WhatsAppValidation: 'WhatsAppValidation' as const,
  Email: 'Email' as const,
  EmailValidation: 'EmailValidation' as const,
  Location: 'Location' as const,
  Security: 'Security' as const,
  Success: 'Success' as const,
} as const;

export type ScreenNamesType = keyof RootStackParamList;