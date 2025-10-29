export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Enterprise: undefined;
  ProductList: undefined;
  CompanySelection: undefined;
  PersonalInfo: undefined;
  WhatsAppValidation: undefined;
  Email: undefined;
  EmailValidation: undefined;
  ChangePasswordEmailValidation: undefined;
  ChangePasswordWhatsAppValidation: undefined;
  ChangePasswordSecurity: undefined;
  Location: undefined;
  Security: undefined;
  Success: undefined;
  VerificationMethod: undefined;
};

export const ScreenNames = {
  Splash: 'Splash' as const,
  Login: 'Login' as const,
  Enterprise: 'Enterprise' as const,
  ProductList: 'ProductList' as const,
  CompanySelection: 'CompanySelection' as const,
  PersonalInfo: 'PersonalInfo' as const,
  WhatsAppValidation: 'WhatsAppValidation' as const,
  Email: 'Email' as const,
  EmailValidation: 'EmailValidation' as const,
  ChangePasswordEmailValidation: 'ChangePasswordEmailValidation' as const,
  ChangePasswordWhatsAppValidation: 'ChangePasswordWhatsAppValidation' as const,
  ChangePasswordSecurity: 'ChangePasswordSecurity' as const,
  Location: 'Location' as const,
  Security: 'Security' as const,
  Success: 'Success' as const,
  VerificationMethod: 'VerificationMethod' as const,
} as const;

export type ScreenNamesType = keyof RootStackParamList;