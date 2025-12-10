export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Enterprise: undefined;
  Keymans: undefined;
  Schedule: undefined;
  SalesHome: undefined;
  ProductList: undefined;
  SchedulingDetailsMain: {
    appointment: {
      id: string;
      date: string;
      slots?: { start: string; end: string }[];
      client?: string | null;
      product?: string | null;
      activity?: string | null;
      agendaType?: 'personal' | 'shared' | null;
      flowType?: 'guided' | 'free' | null;
      professional?: string | null;
      clientPhotoKey?: string | null;
      clientPhotoUri?: string | null;
    };
  };
  SchedulingDetailsMain02: {
    appointment: {
      id: string;
      date: string;
      slots?: { start: string; end: string }[];
      client?: string | null;
      product?: string | null;
      activity?: string | null;
      agendaType?: 'personal' | 'shared' | null;
      flowType?: 'guided' | 'free' | null;
      professional?: string | null;
      clientPhotoKey?: string | null;
      clientPhotoUri?: string | null;
    };
  };
  PresentationScreen: {
    product: {
      id: string;
      title: string;
      commission: string;
      averageTicket: string;
      averageClosingTime: string;
      image?: any;
    };
  };
  TrainingScreen: {
    product: {
      id: string;
      title: string;
      commission: string;
      averageTicket: string;
      averageClosingTime: string;
      image?: any;
    };
  };
  VideoPlayerScreen: {
    videoTitle?: string;
    videoDescription?: string;
  };
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
  Keymans: 'Keymans' as const,
  Schedule: 'Schedule' as const,
  SalesHome: 'SalesHome' as const,
  ProductList: 'ProductList' as const,
  SchedulingDetailsMain: 'SchedulingDetailsMain' as const,
  SchedulingDetailsMain02: 'SchedulingDetailsMain02' as const,
  PresentationScreen: 'PresentationScreen' as const,
  TrainingScreen: 'TrainingScreen' as const,
  VideoPlayerScreen: 'VideoPlayerScreen' as const,
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
