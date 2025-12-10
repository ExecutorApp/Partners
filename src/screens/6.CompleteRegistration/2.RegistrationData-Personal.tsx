import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Image,
  useWindowDimensions,
  Platform,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import {
  UF_LIST,
  formatNameInput,
  maskCPF,
  isValidCPF,
  sanitizeEmail,
  isValidEmail,
  maskWhatsApp,
  validateWhatsApp,
  maskCEP,
  isValidCEP,
  sanitizeCityNeighborhood,
  sanitizeAddress,
  sanitizeNumberField,
  sanitizeComplement,
  capitalizeFirstLetter,
  capitalizeFirstLetterLive,
  onlyDigits,
} from '../../utils/validators';
import RegistrationDataEnterprise, { EnterpriseRef } from './3.RegistrationData-Enterprise';
import RegistrationDataBankAccount, { BankAccountRef } from './4.RegistrationData-BankAccount';
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
  Inter_900Black
} from '@expo-google-fonts/inter';
import { RegistrationStorage, RegistrationValidation, RegistrationData } from '../../utils/registrationStorage';

interface RegistrationDataPersonalProps {
  visible: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSave: () => void;
}

// Ícone de fechar "X" com fundo retangular conforme Figma
const CloseIcon = () => (
  <Svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <Rect width="38" height="38" rx="8" fill="#F4F4F4" />
    <Rect width="38" height="38" rx="8" stroke="#EDF2F6" />
    <Path d="M25.155 13.2479C24.7959 12.9179 24.2339 12.9173 23.874 13.2466L19 17.7065L14.126 13.2466C13.7661 12.9173 13.2041 12.9179 12.845 13.2479L12.7916 13.297C12.4022 13.6549 12.4029 14.257 12.7931 14.614L17.5863 19L12.7931 23.386C12.4029 23.743 12.4022 24.3451 12.7916 24.703L12.845 24.7521C13.2041 25.0821 13.7661 25.0827 14.126 24.7534L19 20.2935L23.874 24.7534C24.2339 25.0827 24.7959 25.0821 25.155 24.7521L25.2084 24.703C25.5978 24.3451 25.5971 23.743 25.2069 23.386L20.4137 19L25.2069 14.614C25.5971 14.257 25.5978 13.6549 25.2084 13.297L25.155 13.2479Z" fill="#3A3F51" />
  </Svg>
);

// Seta para esquerda com fundo/borda conforme Figma (cor parametrizada)
const LeftArrowIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width="20" height="50" viewBox="0 0 20 50" fill="none">
    <Rect width="20" height="50" rx="4" fill="#F4F4F4" />
    <Path fillRule="evenodd" clipRule="evenodd" d="M13.7208 19.2762C14.1036 19.6345 14.0912 20.2042 13.6931 20.5488L8.44277 25L13.6931 29.4513C14.0912 29.7958 14.1036 30.3655 13.7208 30.7238C13.338 31.0821 12.705 31.0933 12.3069 30.7487L6.30689 25.6487C6.11081 25.4791 6 25.2448 6 25C6 24.7552 6.11081 24.5209 6.30689 24.3513L12.3069 19.2513C12.705 18.9067 13.338 18.9179 13.7208 19.2762Z" fill={color} />
  </Svg>
);

// Seta para direita com fundo/borda conforme Figma (cor parametrizada)
const RightArrowIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width="20" height="50" viewBox="0 0 20 50" fill="none">
    <Rect width="20" height="50" rx="4" transform="matrix(-1 0 0 1 20 0)" fill="#F4F4F4" />
    <Path fillRule="evenodd" clipRule="evenodd" d="M6.27917 19.2762C5.89637 19.6345 5.90879 20.2042 6.30689 20.5488L11.5572 25L6.30689 29.4513C5.90879 29.7958 5.89637 30.3655 6.27917 30.7238C6.66196 31.0821 7.295 31.0933 7.69311 30.7487L13.6931 25.6487C13.8892 25.4791 14 25.2448 14 25C14 24.7552 13.8892 24.5209 13.6931 24.3513L7.69311 19.2513C7.295 18.9067 6.66196 18.9179 6.27917 19.2762Z" fill={color} />
  </Svg>
);

// Ícone Dados Pessoais (cor parametrizada)
const PersonalDataIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width="23" height="25" viewBox="0 0 23 25" fill="none">
    <Path d="M11.5 0C7.53046 0 4.3125 2.79822 4.3125 6.25C4.3125 9.70177 7.53046 12.5 11.5 12.5C15.4695 12.5 18.6875 9.70177 18.6875 6.25C18.6875 2.79822 15.4695 0 11.5 0Z" fill={color}/>
    <Path d="M7.1875 15C5.28126 15 3.45309 15.6585 2.10518 16.8306C0.757246 18.0026 0 19.5924 0 21.25V25H23V21.25C23 19.5924 22.2427 18.0026 20.8948 16.8306C19.547 15.6585 17.7188 15 15.8125 15H7.1875Z" fill={color}/>
  </Svg>
);

// Ícone Empresa (cor parametrizada)
const CompanyIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
    <Path d="M1.78571 7.14286C1.54891 7.14286 1.32181 7.23693 1.15437 7.40437C0.986926 7.57181 0.892857 7.79891 0.892857 8.03571V22.3214H5.35714V7.14286H1.78571ZM4.46429 19.6429H2.67857V17.8571H4.46429V19.6429ZM4.46429 16.0714H2.67857V14.2857H4.46429V16.0714ZM4.46429 12.5H2.67857V10.7143H4.46429V12.5ZM23.2143 7.14286H19.6429V22.3214H24.1071V8.03571C24.1071 7.79891 24.0131 7.57181 23.8456 7.40437C23.6782 7.23693 23.4511 7.14286 23.2143 7.14286ZM22.3214 19.6429H20.5357V17.8571H22.3214V19.6429ZM22.3214 16.0714H20.5357V14.2857H22.3214V16.0714ZM22.3214 12.5H20.5357V10.7143H22.3214V12.5ZM17.8571 0H7.14286C6.90606 0 6.67896 0.0940686 6.51151 0.261512C6.34407 0.428955 6.25 0.656057 6.25 0.892857V22.3214H18.75V0.892857C18.75 0.656057 18.6559 0.428955 18.4885 0.261512C18.321 0.0940686 18.0939 0 17.8571 0ZM11.6071 19.6429H9.82143V17.8571H11.6071V19.6429ZM11.6071 16.0714H9.82143V14.2857H11.6071V16.0714ZM11.6071 12.5H9.82143V10.7143H11.6071V12.5ZM11.6071 8.92857H9.82143V7.14286H11.6071V8.92857ZM11.6071 5.35714H9.82143V3.57143H11.6071V5.35714ZM15.1786 19.6429H13.3929V17.8571H15.1786V19.6429ZM15.1786 16.0714H13.3929V14.2857H15.1786V16.0714ZM15.1786 12.5H13.3929V10.7143H15.1786V12.5ZM15.1786 8.92857H13.3929V7.14286H15.1786V8.92857ZM15.1786 5.35714H13.3929V3.57143H15.1786V5.35714ZM25 25H0V23.2143H25V25Z" fill={color}/>
  </Svg>
);

// Ícone Conta Bancária (cor parametrizada)
const BankAccountIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
    <Path d="M21.4109 5.21439L14.28 0.808623C12.5301 -0.272638 10.3799 -0.26644 8.64102 0.808623L1.50963 5.21439C0.964223 5.55138 0.625104 6.1769 0.625104 6.84722C0.625104 7.88942 1.4242 8.73734 2.40613 8.73734H20.5144C21.4963 8.73734 22.2954 7.88942 22.2954 6.84722C22.2954 6.1769 21.9563 5.55138 21.4109 5.21439ZM11.4602 7.03108C10.1392 7.03108 9.06401 5.95607 9.06401 4.63522C9.06401 3.31438 10.1392 2.23937 11.4602 2.23937C12.7813 2.23937 13.8565 3.31438 13.8565 4.63522C13.8565 5.95607 12.7813 7.03108 11.4602 7.03108Z" fill={color}/>
    <Path d="M11.4602 3.07271C10.5986 3.07271 9.89748 3.77376 9.89748 4.63522C9.89748 5.49669 10.5986 6.19774 11.4602 6.19774C12.3218 6.19774 13.023 5.49669 13.023 4.63522C13.023 3.77376 12.3218 3.07271 11.4602 3.07271ZM11.7728 5.05189H11.1477C10.9174 5.05189 10.731 4.86543 10.731 4.63522C10.731 4.40501 10.9174 4.21855 11.1477 4.21855H11.7728C12.003 4.21855 12.1895 4.40501 12.1895 4.63522C12.1895 4.86543 12.003 5.05189 11.7728 5.05189ZM14.9416 25H1.25021C0.559729 25 0 24.4404 0 23.75V22.5C0 21.8125 0.562594 21.25 1.25021 21.25H12.5143C12.6785 21.25 12.8263 21.3469 12.8942 21.4963C13.3884 22.5826 14.1782 23.5381 15.1842 24.2447C15.5157 24.4775 15.3467 25 14.9416 25ZM13.4617 14.7461C13.4649 14.8335 13.4407 14.9196 13.3924 14.9925C12.8714 15.7869 12.5244 16.6827 12.3744 17.6208C12.3591 17.7177 12.3096 17.806 12.235 17.8698C12.1604 17.9336 12.0654 17.9686 11.9673 17.9687H9.75459C9.69897 17.9687 9.64392 17.9574 9.59275 17.9356C9.54158 17.9138 9.49536 17.8819 9.45685 17.8417C9.41835 17.8016 9.38836 17.7541 9.36869 17.702C9.34902 17.65 9.34007 17.5946 9.34239 17.539L9.65807 9.966C9.6625 9.85967 9.70787 9.75916 9.78469 9.68549C9.8615 9.61182 9.96383 9.57069 10.0703 9.57069H12.8502C12.9567 9.57069 13.059 9.61182 13.1358 9.68549C13.2126 9.75916 13.258 9.85967 13.2624 9.966L13.4617 14.7461ZM6.44602 17.9687H3.03472C2.9791 17.9687 2.92405 17.9574 2.87288 17.9356C2.82171 17.9138 2.77549 17.8819 2.73698 17.8417C2.69848 17.8016 2.66849 17.7541 2.64882 17.702C2.62915 17.65 2.6202 17.5946 2.62252 17.539L2.9382 9.966C2.94263 9.85967 2.988 9.75916 3.06482 9.68549C3.14164 9.61182 3.24396 9.57069 3.3504 9.57069H6.13034C6.23679 9.57069 6.33911 9.61182 6.41593 9.68549C6.49274 9.75916 6.53811 9.85967 6.54255 9.966L6.85822 17.539C6.86802 17.7733 6.68059 17.9687 6.44602 17.9687ZM19.5978 11.9419C18.6892 11.8711 17.7504 11.9797 16.8433 12.2947C16.5691 12.3899 16.2854 12.1775 16.2975 11.8875L16.3778 9.96595C16.3823 9.85963 16.4277 9.75913 16.5045 9.68547C16.5813 9.61181 16.6836 9.57069 16.79 9.57069H19.57C19.6765 9.57069 19.7788 9.61182 19.8556 9.68549C19.9324 9.75916 19.9778 9.85967 19.9822 9.966L20.0468 11.5138C20.0572 11.7628 19.8463 11.9612 19.5978 11.9419Z" fill={color}/>
    <Path d="M19.0615 12.7546C15.7901 12.7546 13.1261 15.4145 13.123 18.6864C13.1209 21.9585 15.7669 24.6297 19.062 24.6297C22.3334 24.6297 24.9974 21.9692 25 18.6973C25.0032 15.4161 22.3489 12.7546 19.0615 12.7546ZM19.4756 21.5026V22.0255C19.4756 22.2552 19.2891 22.4422 19.0589 22.4422C18.8292 22.4422 18.6422 22.2552 18.6422 22.0255V21.502C18.1254 21.4119 17.6738 21.1552 17.3883 20.7781C17.2492 20.5947 17.2852 20.3333 17.4691 20.1947C17.6524 20.0557 17.9139 20.0916 18.0525 20.275C18.4281 20.7702 19.369 20.8532 19.9028 20.4411C20.0127 20.3562 20.1961 20.176 20.1966 19.9208C20.1971 19.452 19.9075 19.3171 18.9776 19.126C18.1822 18.9624 17.0924 18.7385 17.0935 17.5145C17.094 16.7395 17.7608 16.0905 18.6474 15.9338V15.4108C18.6474 15.1806 18.8344 14.9942 19.0641 14.9942C19.2944 14.9942 19.4808 15.1806 19.4808 15.4108V15.9338C19.9976 16.0244 20.4492 16.2806 20.7352 16.6577C20.8743 16.8411 20.8378 17.1025 20.6545 17.2416C20.4711 17.3807 20.2096 17.3442 20.0705 17.1609C19.8478 16.8671 19.4349 16.7306 19.062 16.7306C18.4468 16.7306 17.9275 17.0895 17.9269 17.515C17.9264 17.9838 18.2161 18.1187 19.1459 18.3098C19.9413 18.4734 21.0311 18.6979 21.0301 19.9218C21.0292 20.6505 20.4252 21.3384 19.4756 21.5026ZM12.0033 20.4166H1.50077C1.39287 20.4166 1.28939 20.3738 1.21309 20.2975C1.1368 20.2212 1.09393 20.1177 1.09393 20.0098C1.09393 19.3428 1.63475 18.802 2.30195 18.802H11.9013C12.1156 18.802 12.2918 18.9683 12.3069 19.182C12.3256 19.4363 12.358 19.6895 12.404 19.9403C12.4498 20.1886 12.2558 20.4166 12.0033 20.4166Z" fill={color}/>
  </Svg>
);

// Ícone Dropdown (Chevron)
const ChevronDownIcon = () => (
  <Svg width="12" height="8" viewBox="0 0 12 8" fill="none">
    <Path d="M1.4 -5.72205e-06L0 1.39999L6 7.39999L12 1.39999L10.6 -5.72205e-06L6 4.59999L1.4 -5.72205e-06Z" fill="#7D8592"/>
  </Svg>
);

// Avatar do usuário
const UserAvatarIcon = () => (
  <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
    <Path d="M17.5601 39.2L10.1004 43.2688C9.67131 43.5081 9.26982 43.7938 8.90317 44.1207C13.4037 47.9246 19.1082 50.008 25.001 50C31.0899 50 36.6684 47.8207 41.0054 44.2038C40.6038 43.8585 40.1623 43.5627 39.6902 43.3226L31.7022 39.3292C31.1962 39.0762 30.7706 38.6874 30.4732 38.2061C30.1757 37.7249 30.0182 37.1704 30.0181 36.6047V33.4707C30.2427 33.2151 30.4993 32.8868 30.7738 32.499C31.8517 30.9674 32.689 29.28 33.2569 27.4953C34.2815 27.1792 35.0363 26.233 35.0363 25.1085V21.7632C35.0363 21.0273 34.7089 20.3698 34.2004 19.9094V15.0736C34.2004 15.0736 35.1938 7.54811 25.0019 7.54811C14.81 7.54811 15.8034 15.0736 15.8034 15.0736V19.9094C15.5417 20.1424 15.332 20.4279 15.188 20.7473C15.044 21.0667 14.9689 21.4128 14.9676 21.7632V25.1085C14.9676 25.9896 15.4308 26.7651 16.1242 27.2132C16.9601 30.8519 19.1489 33.4707 19.1489 33.4707V36.5273C19.1481 37.0744 19.0003 37.6111 18.7208 38.0814C18.4412 38.5516 18.0403 38.938 17.5601 39.2Z" fill="#F4F4F4"/>
    <Path d="M25.4283 0.00372279C11.623 -0.232126 0.239584 10.7679 0.0037254 24.5726C-0.130242 32.3999 3.35857 39.4348 8.9135 44.1131C9.27672 43.7894 9.6744 43.5066 10.0994 43.2697L17.5591 39.2009C18.0396 38.9387 18.4414 38.552 18.7208 38.0814C19.0001 37.6108 19.1468 37.0736 19.1469 36.5263V33.4697C19.1469 33.4697 16.9572 30.8509 16.1223 27.2122C15.7689 26.986 15.4779 26.6749 15.2758 26.3072C15.0737 25.9395 14.9671 25.527 14.9656 25.1075V21.7622C14.9656 21.0264 15.293 20.3688 15.8015 19.9084V15.0726C15.8015 15.0726 14.8081 7.54712 25 7.54712C35.1919 7.54712 34.1984 15.0726 34.1984 15.0726V19.9084C34.7079 20.3688 35.0343 21.0264 35.0343 21.7622V25.1075C35.0343 26.232 34.2796 27.1782 33.255 27.4943C32.6871 29.279 31.8497 30.9664 30.7719 32.4981C30.49" fill="#1777CF"/>
  </Svg>
);

// Ícone de câmera para foto
const CameraIcon = () => (
  <View style={{left: 0, top: 0, position: 'absolute'}}>
    <Svg width="35" height="34" viewBox="0 0 35 34" fill="none">
      <defs>
        <filter id="filter0_dd_142_1013" x="0" y="0" width="35" height="34" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="2"/>
          <feGaussianBlur stdDeviation="2.5"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.403922 0 0 0 0 0.431373 0 0 0 0 0.462745 0 0 0 0.08 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_142_1013"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="1"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"/>
          <feBlend mode="normal" in2="effect1_dropShadow_142_1013" result="effect2_dropShadow_142_1013"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_142_1013" result="shape"/>
        </filter>
      </defs>
      <g filter="url(#filter0_dd_142_1013)">
        <rect x="5" y="3" width="25" height="24" rx="12" fill="#FCFCFC"/>
        <rect x="5.1" y="3.1" width="24.8" height="23.8" rx="11.9" stroke="#D8E0F0" strokeWidth="0.2"/>
        <Path d="M24.0455 11.0571H21.5255C21.4057 11.0571 21.2878 11.0292 21.1823 10.9759C21.0767 10.9226 20.9868 10.8456 20.9204 10.7517L20.1135 9.61063C19.9806 9.42279 19.8007 9.26878 19.5896 9.16226C19.3784 9.05574 19.1427 9 18.9033 9H16.0967C15.8573 9 15.6216 9.05574 15.4104 9.16226C15.1993 9.26878 15.0194 9.42279 14.8865 9.61063L14.0796 10.7517C14.0132 10.8456 13.9233 10.9226 13.8177 10.9759C13.7122 11.0292 13.5943 11.0571 13.4745 11.0571H13.1364V10.7143C13.1364 10.6234 13.0981 10.5361 13.0299 10.4718C12.9617 10.4076 12.8692 10.3714 12.7727 10.3714H11.6818C11.5854 10.3714 11.4929 10.4076 11.4247 10.4718C11.3565 10.5361 11.3182 10.6234 11.3182 10.7143V11.0571H10.9545C10.5688 11.0571 10.1988 11.2016 9.92603 11.4588C9.65325 11.716 9.5 12.0648 9.5 12.4286V19.6286C9.5 19.9923 9.65325 20.3411 9.92603 20.5983C10.1988 20.8555 10.5688 21 10.9545 21H24.0455C24.4312 21 24.8012 20.8555 25.074 20.5983C25.3468 20.3411 25.5 19.9923 25.5 19.6286V12.4286C25.5 12.0648 25.3468 11.716 25.074 11.4588C24.8012 11.2016 24.4312 11.0571 24.0455 11.0571ZM17.5 19.6286C16.6729 19.6286 15.8644 19.3973 15.1767 18.9641C14.489 18.5308 13.953 17.915 13.6365 17.1946C13.32 16.4741 13.2372 15.6813 13.3985 14.9165C13.5599 14.1517 13.9582 13.4491 14.543 12.8977C15.1278 12.3463 15.873 11.9708 16.6842 11.8186C17.4954 11.6665 18.3362 11.7446 19.1003 12.043C19.8644 12.3414 20.5176 12.8468 20.9771 13.4952C21.4366 14.1436 21.6818 14.9059 21.6818 15.6857C21.6818 16.7314 21.2412 17.7343 20.457 18.4737C19.6727 19.2132 18.6091 19.6286 17.5 19.6286Z" fill="#3A3F51"/>
        <Path d="M17.5 13.1143C16.9606 13.1143 16.4333 13.2651 15.9848 13.5476C15.5363 13.8302 15.1867 14.2318 14.9803 14.7017C14.7739 15.1715 14.7199 15.6886 14.8251 16.1874C14.9304 16.6862 15.1901 17.1444 15.5715 17.504C15.9529 17.8636 16.4389 18.1085 16.9679 18.2077C17.497 18.307 18.0453 18.256 18.5437 18.0614C19.042 17.8668 19.468 17.5372 19.7676 17.1143C20.0673 16.6915 20.2273 16.1943 20.2273 15.6857C20.2273 15.0037 19.9399 14.3497 19.4285 13.8674C18.917 13.3852 18.2233 13.1143 17.5 13.1143ZM17.5 17.2286C17.0662 17.2281 16.6502 17.0654 16.3434 16.7762C16.0367 16.4869 15.8641 16.0948 15.8636 15.6857C15.8636 15.5948 15.9019 15.5076 15.9701 15.4433C16.0383 15.379 16.1308 15.3429 16.2273 15.3429C16.3237 15.3429 16.4162 15.379 16.4844 15.4433C16.5526 15.5076 16.5909 15.5948 16.5909 15.6857C16.5909 15.913 16.6867 16.1311 16.8572 16.2918C17.0277 16.4526 17.2589 16.5429 17.5 16.5429C17.5964 16.5429 17.6889 16.579 17.7571 16.6433C17.8253 16.7076 17.8636 16.7948 17.8636 16.8857C17.8636 16.9766 17.8253 17.0639 17.7571 17.1282C17.6889 17.1924 17.5964 17.2286 17.5 17.2286Z" fill="#3A3F51"/>
      </g>
    </Svg>
  </View>
);

export interface RegistrationDataPersonalRef {
  checkAllFieldsComplete: () => Promise<boolean>;
  getMissingFields: () => Promise<string[]>;
  save: () => boolean;
}

const RegistrationDataPersonal = React.forwardRef((
  props: RegistrationDataPersonalProps,
  ref: React.Ref<RegistrationDataPersonalRef>
) => {
  const { visible, onClose, onCancel, onSave } = props;
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  // Calcula dimensões do modal com margem fixa de 10px na viewport
  const modalMaxWidth = Math.max(0, viewportWidth - 20);
  const modalMaxHeight = Math.max(0, viewportHeight - 20);
  // Estado para imagem de avatar selecionada no web
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const avatarObjectUrlRef = useRef<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  // Lista de estados com rótulo "UF - Nome" para padronizar visual com LocationScreen
  const BRAZIL_STATES: string[] = [
    'AC - Acre',
    'AL - Alagoas',
    'AP - Amapá',
    'AM - Amazonas',
    'BA - Bahia',
    'CE - Ceará',
    'DF - Distrito Federal',
    'ES - Espírito Santo',
    'GO - Goiás',
    'MA - Maranhão',
    'MT - Mato Grosso',
    'MS - Mato Grosso do Sul',
    'MG - Minas Gerais',
    'PA - Pará',
    'PB - Paraíba',
    'PR - Paraná',
    'PE - Pernambuco',
    'PI - Piauí',
    'RJ - Rio de Janeiro',
    'RN - Rio Grande do Norte',
    'RS - Rio Grande do Sul',
    'RO - Rondônia',
    'RR - Roraima',
    'SC - Santa Catarina',
    'SP - São Paulo',
    'SE - Sergipe',
    'TO - Tocantins',
  ];

  // Mapa de UF -> "UF - Nome" para exibição do rótulo selecionado
  const UF_NAME_MAP: Record<string, string> = BRAZIL_STATES.reduce((acc, label) => {
    const [uf] = label.split(' - ');
    acc[uf] = label;
    return acc;
  }, {} as Record<string, string>);

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    whatsapp: '',
    state: '',
    cep: '',
    city: '',
    neighborhood: '',
    address: '',
    number: '',
    complement: '',
  });

  // Carregar dados do localStorage ao abrir o modal
  useEffect(() => {
    if (visible) {
      loadRegistrationData();
    }
  }, [visible]);

  // Salvar dados no localStorage sempre que houver mudança
  useEffect(() => {
    if (visible) {
      saveRegistrationData();
    }
  }, [formData, avatarUri, visible]);

  const loadRegistrationData = async () => {
    try {
      const savedData = await RegistrationStorage.getRegistrationData();
      if (savedData && savedData.personal) {
        setFormData(savedData.personal);
        if (savedData.personal.photoUri) {
          setAvatarUri(savedData.personal.photoUri);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
    }
  };

  const saveRegistrationData = async () => {
    try {
      const currentData = await RegistrationStorage.getRegistrationData();
      const updatedData: RegistrationData = {
        personal: { ...formData, photoUri: avatarUri || '' },
        enterprise: currentData?.enterprise || {
          companyName: '',
          cnpj: '',
          state: '',
          cep: '',
          city: '',
          neighborhood: '',
          address: '',
          number: '',
          complement: '',
          sameAddressAsPersonal: false,
        },
        bankAccount: currentData?.bankAccount || {
          bank: '',
          agency: '',
          account: '',
          pixKeyType: '',
          pixKey: '',
        },
      };
      await RegistrationStorage.saveRegistrationData(updatedData);
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
    }
  };

  const [errors, setErrors] = useState<{ [K in keyof typeof formData]?: string }>({});
  const [touched, setTouched] = useState<{ [K in keyof typeof formData]?: boolean }>({});
  const [submitted, setSubmitted] = useState(false);
  const [attemptedTabChange, setAttemptedTabChange] = useState(false);
  // Abas de navegação
  const [activeTab, setActiveTab] = useState(0); // 0: Pessoais, 1: Empresa, 2: Dados bancários
  const TAB_LABELS = ['Pessoais', 'Empresa', 'Bancários'];
  const enterpriseRef = useRef<EnterpriseRef>(null);
  const bankAccountRef = useRef<BankAccountRef>(null);
  // Dropdown de Estado com busca (padrão LocationScreen)
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const chevronAnim = useRef(new Animated.Value(0)).current;
  // 0 => fechado (apontando para direita), 1 => aberto (apontando para baixo)
  const chevronRotate = chevronAnim.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] });
  useEffect(() => {
    Animated.timing(chevronAnim, {
      toValue: stateDropdownOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [stateDropdownOpen]);

  // Ao fechar o modal, garantir que o dropdown seja fechado e a seta volte para a direita
  useEffect(() => {
    if (!visible) {
      setStateDropdownOpen(false);
      chevronAnim.stopAnimation(() => {
        Animated.timing(chevronAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
      // Reset da aba ativa ao fechar modal
      setActiveTab(0);
    }
  }, [visible]);

  const filteredStates = BRAZIL_STATES.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase().trim())
  );

  const collectErrors = (data: typeof formData) => {
    const newErrors: { [K in keyof typeof formData]?: string } = {};

    // Nome: mínimo duas palavras
    const nameWords = data.name.trim().split(/\s+/).filter(Boolean);
    if (nameWords.length < 2) {
      newErrors.name = 'Informe nome completo (mínimo duas palavras).';
    }

    // CPF
    if (!isValidCPF(data.cpf)) {
      newErrors.cpf = 'CPF inválido.';
    }

    // Email
    if (!isValidEmail(data.email)) {
      newErrors.email = 'Email inválido.';
    }

    // WhatsApp (opcional, valida se preenchido)
    const whatsappDigits = onlyDigits(data.whatsapp);
    if (whatsappDigits.length > 0) {
      const info = validateWhatsApp(data.whatsapp);
      if (!info.valid) {
        newErrors.whatsapp = 'WhatsApp inválido (DDD e comprimento).';
      }
    }

    // Estado
    if (!data.state || !UF_LIST.includes(data.state)) {
      newErrors.state = 'Selecione um estado válido.';
    }

    // CEP (opcional, valida se preenchido)
    const cepDigits = onlyDigits(data.cep);
    if (cepDigits.length > 0 && !isValidCEP(data.cep)) {
      newErrors.cep = 'CEP inválido.';
    }

    // Cidade
    if (!data.city.trim()) {
      newErrors.city = 'Cidade é obrigatória.';
    }

    // Bairro
    if (!data.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório.';
    }

    // Endereço
    if (!data.address.trim()) {
      newErrors.address = 'Endereço é obrigatório.';
    }

    // Número
    if (!data.number.trim()) {
      newErrors.number = 'Número é obrigatório.';
    }
    return newErrors;
  };

  const handleSave = () => {
    setSubmitted(true);
    if (activeTab === 1) {
      // Sempre tenta salvar a aba Empresa e abre o modal de campos obrigatórios
      enterpriseRef.current?.save();
      setStateDropdownOpen(false);
      onSave();
      return;
    }
    if (activeTab === 2) {
      // Sempre tenta salvar a aba Bancária e abre o modal de campos obrigatórios
      bankAccountRef.current?.save();
      setStateDropdownOpen(false);
      onSave();
      return;
    }
    const newErrors = collectErrors(formData);
    setErrors(newErrors);
    // Independente de erros, mantém o cadastro aberto e abre o modal de campos obrigatórios
    setStateDropdownOpen(false);
    onSave();
  };

  // Função para verificar se todos os campos obrigatórios estão preenchidos
  const checkAllFieldsComplete = async (): Promise<boolean> => {
    try {
      const currentData = await RegistrationStorage.getRegistrationData();
      if (!currentData) return false;
      
      return RegistrationValidation.isAllDataComplete(currentData);
    } catch (error) {
      console.error('Erro ao verificar campos obrigatórios:', error);
      return false;
    }
  };

  // Função para obter campos faltantes
  const getMissingFields = async (): Promise<string[]> => {
    try {
      const currentData = await RegistrationStorage.getRegistrationData();
      if (!currentData) {
        return ['Todos os campos são obrigatórios'];
      }
      
      return RegistrationValidation.getMissingFields(currentData);
    } catch (error) {
      console.error('Erro ao obter campos faltantes:', error);
      return ['Erro ao verificar campos obrigatórios'];
    }
  };

  const validateBeforeTabChange = () => {
    setAttemptedTabChange(true);
    const newErrors = collectErrors(formData);
    setErrors(newErrors);
  };

  const goPrevTab = () => {
    validateBeforeTabChange();
    setActiveTab((prev) => Math.max(0, prev - 1));
  };

  const goNextTab = () => {
    validateBeforeTabChange();
    setActiveTab((prev) => Math.min(2, prev + 1));
  };

  // Limpeza do URL de objeto quando o componente desmonta
  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        try {
          (globalThis as any).URL?.revokeObjectURL(avatarObjectUrlRef.current);
        } catch {}
      }
    };
  }, []);

  // Expor funções para o componente pai
  React.useImperativeHandle(ref, () => ({
    checkAllFieldsComplete,
    getMissingFields,
    save: () => {
      const newErrors = collectErrors(formData);
      setErrors(newErrors);
      const hasErrors = Object.values(newErrors).some(Boolean);
      return !hasErrors;
    },
  }));

  const handleCameraPress = () => {
    // No web, abre o explorador de arquivos para selecionar uma imagem
    if (Platform.OS === 'web') {
      const doc: any = (globalThis as any).document;
      if (!doc) return;
      const input = doc.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files && input.files[0];
        if (file) {
          // Ler como Data URL (base64) para persistência confiável
          const reader = new FileReader();
          reader.onload = async () => {
            const dataUrl = reader.result as string;
            setAvatarUri(dataUrl);
            // Persiste imediatamente com a foto
            try {
              const currentData = await RegistrationStorage.getRegistrationData();
              const updatedData: RegistrationData = {
                personal: { ...formData, photoUri: dataUrl },
                enterprise: currentData?.enterprise || {
                  companyName: '',
                  cnpj: '',
                  state: '',
                  cep: '',
                  city: '',
                  neighborhood: '',
                  address: '',
                  number: '',
                  complement: '',
                  sameAddressAsPersonal: false,
                },
                bankAccount: currentData?.bankAccount || {
                  bank: '',
                  agency: '',
                  account: '',
                  pixKeyType: '',
                  pixKey: '',
                },
              };
              await RegistrationStorage.saveRegistrationData(updatedData);
            } catch (error) {
              console.error('Erro ao salvar foto no localStorage:', error);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

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
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { width: modalMaxWidth, height: modalMaxHeight }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Dados cadastrais</Text>
                <Text style={styles.subtitle}>{TAB_LABELS[activeTab]}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <CloseIcon />
              </TouchableOpacity>
            </View>

            {/* Navigation */}
              <View style={styles.navigation}>
                <TouchableOpacity style={styles.navArrow} onPress={goPrevTab} disabled={activeTab === 0}>
                  <LeftArrowIcon color={activeTab === 0 ? '#7D8592' : '#1777CF'} />
                </TouchableOpacity>
                
              <View style={styles.navIcons}>
                <TouchableOpacity style={[styles.navIcon, activeTab === 0 ? styles.activeNavIcon : null]} onPress={() => { validateBeforeTabChange(); setActiveTab(0); }}>
                  <PersonalDataIcon color={activeTab === 0 ? '#1777CF' : '#7D8592'} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navIcon, activeTab === 1 ? styles.activeNavIcon : null]} onPress={() => { validateBeforeTabChange(); setActiveTab(1); }}>
                  <CompanyIcon color={activeTab === 1 ? '#1777CF' : '#7D8592'} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navIcon, activeTab === 2 ? styles.activeNavIcon : null]} onPress={() => { validateBeforeTabChange(); setActiveTab(2); }}>
                  <BankAccountIcon color={activeTab === 2 ? '#1777CF' : '#7D8592'} />
                </TouchableOpacity>
              </View>
               
              <TouchableOpacity style={styles.navArrow} onPress={goNextTab} disabled={activeTab === 2}>
                <RightArrowIcon color={activeTab === 2 ? '#7D8592' : '#1777CF'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Photo Section somente na aba Pessoais */}
            {activeTab === 0 && (
              <View style={styles.photoSection}>
                <View style={styles.photoContainer}>
                  <View style={styles.photoPlaceholder}>
                    <Image
            source={avatarUri ? { uri: avatarUri } : require('../../../assets/AvatarPlaceholder02.png')}
                      style={styles.avatarImage}
                      accessibilityRole="image"
                      accessibilityLabel="Avatar placeholder"
                      resizeMode="cover"
                    />
                  </View>
                  <TouchableOpacity 
                    style={styles.cameraButton}
                    accessibilityLabel="Adicionar foto do perfil"
                    accessibilityHint="Toque para selecionar uma foto do seu dispositivo"
                    onPress={handleCameraPress}
                  >
                    <CameraIcon />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.formSection}>
              {/* Aba Pessoais */}
              {activeTab === 0 && (
              <View style={styles.fieldGroup}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nome *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'name' ? styles.inputFocused : null]}
                    value={formData.name}
                    onChangeText={(text) => {
                      const formatted = formatNameInput(text);
                      setFormData({ ...formData, name: formatted });
                      // valida mínimo de duas palavras
                      const hasTwoWords = formatted.trim().split(/\s+/).length >= 2;
                      setErrors({ ...errors, name: hasTwoWords ? undefined : 'Informe nome completo (mínimo duas palavras).' });
                    }}
                    placeholder="Nome completo"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => {
                      setFocusedField(null);
                      setTouched({ ...touched, name: true });
                    }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Campo de nome"
                    accessibilityHint="Digite seu nome completo"
                  />
                  {(errors.name && (submitted || touched.name || attemptedTabChange)) ? (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  ) : null}
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>CPF *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'cpf' ? styles.inputFocused : null]}
                    value={formData.cpf}
                    onChangeText={(text) => {
                      const masked = maskCPF(text);
                      setFormData({ ...formData, cpf: masked });
                      const valid = isValidCPF(masked);
                      setErrors({ ...errors, cpf: valid || masked.length < 14 ? undefined : 'CPF inválido.' });
                    }}
                    placeholder="000.000.000-00"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('cpf')}
                    onBlur={() => {
                      setFocusedField(null);
                      setTouched({ ...touched, cpf: true });
                    }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    keyboardType="numeric"
                    maxLength={14}
                    accessibilityLabel="Campo de CPF"
                    accessibilityHint="Digite seu CPF no formato 000.000.000-00"
                  />
                  {(errors.cpf && (submitted || touched.cpf || attemptedTabChange)) ? (
                    <Text style={styles.errorText}>{errors.cpf}</Text>
                  ) : null}
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'email' ? styles.inputFocused : null]}
                    value={formData.email}
                    onChangeText={(text) => {
                      const cleaned = sanitizeEmail(text);
                      setFormData({ ...formData, email: cleaned });
                      setErrors({ ...errors, email: isValidEmail(cleaned) || cleaned.length === 0 ? undefined : 'Email inválido.' });
                    }}
                    placeholder="Email@teste.com"
                    keyboardType="email-address"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => {
                      setFocusedField(null);
                      setTouched({ ...touched, email: true });
                    }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Campo de email"
                    accessibilityHint="Digite seu endereço de email"
                  />
                  {(errors.email && (submitted || touched.email || attemptedTabChange)) ? (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  ) : null}
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>WhatsApp *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'whatsapp' ? styles.inputFocused : null]}
                    value={formData.whatsapp}
                    onChangeText={(text) => {
                      const masked = maskWhatsApp(text);
                      setFormData({ ...formData, whatsapp: masked });
                      const info = validateWhatsApp(masked);
                      setErrors({ ...errors, whatsapp: info.valid || onlyDigits(masked).length < 10 ? undefined : 'WhatsApp inválido (DDD e comprimento).' });
                    }}
                    placeholder="00 00000-0000"
                    keyboardType="phone-pad"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('whatsapp')}
                    onBlur={() => {
                      setFocusedField(null);
                      setTouched({ ...touched, whatsapp: true });
                    }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    maxLength={15}
                    accessibilityLabel="Campo de WhatsApp"
                    accessibilityHint="Digite seu número de WhatsApp"
                  />
                  {(errors.whatsapp && (submitted || touched.whatsapp || attemptedTabChange)) ? (
                    <Text style={styles.errorText}>{errors.whatsapp}</Text>
                  ) : null}
                </View>
              </View>
              )}

              {/* Aba Empresa */}
              {activeTab === 1 && (
                <RegistrationDataEnterprise styles={styles} ref={enterpriseRef} />
              )}

              {/* Aba Bancários */}
              {activeTab === 2 && (
                <RegistrationDataBankAccount styles={styles} ref={bankAccountRef} />
              )}

              {/* Location Section somente na aba Pessoais */}
              {activeTab === 0 && (
              <View style={styles.locationSection}>
                <Text style={styles.sectionTitle}>Localização:</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Estado *</Text>
                  <TouchableOpacity
                    style={[styles.dropdownInput, styles.stateSelectRow, focusedField === 'state' ? styles.inputFocused : null]}
                    accessibilityLabel="Seletor de estado"
                    accessibilityHint="Toque para selecionar seu estado"
                    accessibilityRole="button"
                    onPress={() => {
                      setFocusedField('state');
                      setStateDropdownOpen((open) => !open);
                    }}
                  >
                    <Text style={[styles.dropdownText, !formData.state ? styles.placeholderText : null]}>
                      {formData.state ? (UF_NAME_MAP[formData.state] || formData.state) : 'Selecione um estado'}
                    </Text>
                    <Animated.View style={[styles.dropdownChevron, { transform: [{ rotate: chevronRotate }] }]}>
                      <ChevronDownIcon />
                    </Animated.View>
                  </TouchableOpacity>

                    <Modal
                    visible={stateDropdownOpen}
                    transparent
                    animationType="fade"
                    onRequestClose={() => {
                      setStateDropdownOpen(false);
                      setTouched({ ...touched, state: true });
                      setErrors({ ...errors, state: formData.state ? undefined : 'Selecione um estado válido.' });
                    }}
                  >
                    <TouchableWithoutFeedback onPress={() => {
                      setStateDropdownOpen(false);
                      setTouched({ ...touched, state: true });
                      setErrors({ ...errors, state: formData.state ? undefined : 'Selecione um estado válido.' });
                    }}>
                      <View style={styles.modalBackdrop} />
                    </TouchableWithoutFeedback>
                    <View style={styles.dropdownModalContainer} pointerEvents="box-none">
                      <View style={styles.dropdownContainer}>
                        <TextInput
                          style={[
                            styles.input,
            Platform.OS === 'web' ? ({ outlineWidth: 0 } as any) : null,
                          ]}
                          placeholder="Buscar estado"
                          placeholderTextColor="#91929E"
                          value={stateSearch}
                          onChangeText={setStateSearch}
                          autoCapitalize="none"
                        />
                        <ScrollView style={styles.stateList}>
                          {filteredStates.map((label) => (
                            <View key={label}>
                              <TouchableOpacity
                                style={[styles.stateItem, (UF_NAME_MAP[formData.state] === label) && styles.stateItemSelected]}
                                onPress={() => {
                                  const uf = label.split(' - ')[0];
                                  setFormData({ ...formData, state: uf });
                                  setErrors({ ...errors, state: undefined });
                                  setStateSearch('');
                                  setStateDropdownOpen(false);
                                  setFocusedField(null);
                                  setTouched({ ...touched, state: true });
                                }}
                                accessibilityLabel={`Selecionar estado ${label}`}
                              >
                                <Text style={styles.stateItemText}>{label}</Text>
                              </TouchableOpacity>
                              <View style={styles.stateDivider} />
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </Modal>
                  {(errors.state && (submitted || touched.state || attemptedTabChange)) ? (
                    <Text style={styles.errorText}>{errors.state}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>CEP *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'cep' ? styles.inputFocused : null]}
                    value={formData.cep}
                    onChangeText={(text) => {
                      const masked = maskCEP(text);
                      setFormData({ ...formData, cep: masked });
                      const valid = isValidCEP(masked);
                      setErrors({ ...errors, cep: valid || masked.length < 9 ? undefined : 'CEP inválido.' });
                    }}
                    placeholder="00000-000"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('cep')}
                    onBlur={() => {
                      setFocusedField(null);
                      setTouched({ ...touched, cep: true });
                      setErrors({ ...errors, cep: isValidCEP(formData.cep) || formData.cep.length === 0 ? undefined : 'CEP inválido.' });
                    }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    keyboardType="numeric"
                    maxLength={9}
                    accessibilityLabel="Campo de CEP"
                    accessibilityHint="Digite seu CEP no formato 00000-000"
                  />
                  {(errors.cep && (submitted || touched.cep || attemptedTabChange)) ? (
                    <Text style={styles.errorText}>{errors.cep}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Cidade *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'city' ? styles.inputFocused : null]}
                    value={formData.city}
                    onChangeText={(text) => {
                      const sanitized = sanitizeCityNeighborhood(text);
                      const cleaned = capitalizeFirstLetterLive(sanitized);
                      setFormData({ ...formData, city: cleaned });
                      if (submitted || attemptedTabChange || touched.city) {
                        setErrors({ ...errors, city: cleaned.trim() ? undefined : 'Cidade é obrigatória.' });
                      } else if (errors.city) {
                        setErrors({ ...errors, city: undefined });
                      }
                    }}
                    placeholder="Digite o nome da sua cidade"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('city')}
                    onBlur={() => {
                      setFocusedField(null);
                      setTouched({ ...touched, city: true });
                      const finalized = capitalizeFirstLetter(sanitizeCityNeighborhood(formData.city));
                      setFormData({ ...formData, city: finalized });
                      setErrors({ ...errors, city: finalized.trim() ? undefined : 'Cidade é obrigatória.' });
                    }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Campo de cidade"
                    accessibilityHint="Digite o nome da sua cidade"
                  />
                  {(errors.city && (submitted || touched.city || attemptedTabChange)) ? (
                    <Text style={styles.errorText}>{errors.city}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Bairro *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'neighborhood' ? styles.inputFocused : null]}
                    value={formData.neighborhood}
                    onChangeText={(text) => {
                      const sanitized = sanitizeCityNeighborhood(text);
                      const cleaned = capitalizeFirstLetterLive(sanitized);
                      setFormData({ ...formData, neighborhood: cleaned });
                      if (submitted || attemptedTabChange || touched.neighborhood) {
                        setErrors({ ...errors, neighborhood: cleaned.trim() ? undefined : 'Bairro é obrigatório.' });
                      } else if (errors.neighborhood) {
                        setErrors({ ...errors, neighborhood: undefined });
                      }
                    }}
                    placeholder="Digite o nome do seu bairro"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('neighborhood')}
                    onBlur={() => {
                      setFocusedField(null);
                      setTouched({ ...touched, neighborhood: true });
                      const finalized = capitalizeFirstLetter(sanitizeCityNeighborhood(formData.neighborhood));
                      setFormData({ ...formData, neighborhood: finalized });
                      setErrors({ ...errors, neighborhood: finalized.trim() ? undefined : 'Bairro é obrigatório.' });
                    }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Campo de bairro"
                    accessibilityHint="Digite o nome do seu bairro"
                  />
                  {(errors.neighborhood && (submitted || touched.neighborhood || attemptedTabChange)) ? (
                    <Text style={styles.errorText}>{errors.neighborhood}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Endereço *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'address' ? styles.inputFocused : null]}
                    value={formData.address}
                    onChangeText={(text) => {
                      const sanitized = sanitizeAddress(text);
                      const cleaned = capitalizeFirstLetterLive(sanitized);
                      setFormData({ ...formData, address: cleaned });
                      if (submitted || attemptedTabChange || touched.address) {
                        setErrors({ ...errors, address: cleaned.trim() ? undefined : 'Endereço é obrigatório.' });
                      } else if (errors.address) {
                        setErrors({ ...errors, address: undefined });
                      }
                    }}
                    placeholder="Digite seu endereço"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => {
                      setFocusedField(null);
                      setTouched({ ...touched, address: true });
                      const finalized = capitalizeFirstLetter(sanitizeAddress(formData.address));
                      setFormData({ ...formData, address: finalized });
                      setErrors({ ...errors, address: finalized.trim() ? undefined : 'Endereço é obrigatório.' });
                    }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Digite seu endereço"
                    accessibilityHint="Digite o nome da sua rua"
                  />
                  {(errors.address && (submitted || touched.address || attemptedTabChange)) ? (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Número *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'number' ? styles.inputFocused : null]}
                    value={formData.number}
                    onChangeText={(text) => {
                      const cleaned = sanitizeNumberField(text, 6);
                      setFormData({ ...formData, number: cleaned });
                      if (submitted || attemptedTabChange || touched.number) {
                        setErrors({ ...errors, number: cleaned.trim() ? undefined : 'Número é obrigatório.' });
                      } else if (errors.number) {
                        setErrors({ ...errors, number: undefined });
                      }
                    }}
                    placeholder="Digite o número do seu endereço"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('number')}
                    onBlur={() => {
                      setFocusedField(null);
                      setTouched({ ...touched, number: true });
                      setErrors({ ...errors, number: formData.number.trim() ? undefined : 'Número é obrigatório.' });
                    }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    keyboardType="numeric"
                    maxLength={6}
                    accessibilityLabel="Campo de número"
                    accessibilityHint="Digite o número da sua residência"
                  />
                  {(errors.number && (submitted || touched.number || attemptedTabChange)) ? (
                    <Text style={styles.errorText}>{errors.number}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Complemento</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'complement' ? styles.inputFocused : null]}
                    value={formData.complement}
                    onChangeText={(text) => {
                      const sanitized = sanitizeComplement(text);
                      const cleaned = capitalizeFirstLetterLive(sanitized);
                      setFormData({ ...formData, complement: cleaned });
                    }}
                    placeholder="Ex: bloco A, sala 10, apartamento 5"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('complement')}
                    onBlur={() => {
                      setFocusedField(null);
                      const finalized = capitalizeFirstLetter(sanitizeComplement(formData.complement));
                      setFormData({ ...formData, complement: finalized });
                    }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Campo de complemento"
                    accessibilityHint="Digite informações adicionais como apartamento, sala, etc."
                  />
                </View>
              </View>
              )}
              </View>
          </ScrollView>

          {/* Fixed Bottom Buttons */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FCFCFC',
    borderRadius: 12,
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#3A3F51',
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#7D8592',
    letterSpacing: 0,
    marginTop: 5,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  navArrow: {
    width: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  navIcons: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  navIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
  },
  activeNavIcon: {
    backgroundColor: '#F4F4F4',
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  photoContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 65,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 65,
    height: 80,
    borderRadius: 8,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -12,
    right: -12,
    width: 30,
    height: 35,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    gap: 25,
  },
  fieldGroup: {
    gap: 20,
  },
  locationSection: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#3A3F51',
    letterSpacing: 0,
    paddingHorizontal: 5,
    lineHeight: 26,
  },
  inputContainer: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#7D8592',
    letterSpacing: 0,
    paddingHorizontal: 6,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#3A3F51',
    backgroundColor: '#FCFCFC',
    // Evita o outline laranja padrão no Web e mantém o foco pela borda azul
      // Removed outlineStyle to satisfy RN types; outline suppressed via width 0 where needed
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  dropdownInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingRight: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FCFCFC',
    // Evita o outline laranja padrão no Web e mantém o foco pela borda azul
      // Removed outlineStyle to satisfy RN types; outline suppressed via width 0 where needed
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#3A3F51',
    flex: 1,
  },
  dropdownChevron: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Linha do seletor de estado com texto e chevron à direita
  stateSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputFocused: {
    borderColor: '#1777CF',
    borderWidth: 0.5,
    // Mantém acessibilidade visual com foco pela borda azul slim
      // Removed outlineStyle to satisfy RN types; outline suppressed via width 0 where needed
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  placeholderText: {
    color: '#91929E',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#D82B2B',
    paddingHorizontal: 6,
  },
  stateDropdownList: {
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    backgroundColor: '#FCFCFC',
    marginTop: 6,
    overflow: 'hidden',
  },
  stateItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  stateItemText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#3A3F51',
  },
  // Estilos do modal de dropdown com busca
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000055',
  },
  dropdownModalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dropdownContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    backgroundColor: '#FCFCFC',
    padding: 8,
  },
  stateList: {
    maxHeight: 180,
    marginTop: 8,
  },
  stateItemSelected: {
    backgroundColor: '#D8E0F033',
    borderRadius: 8,
  },
  stateDivider: {
    height: 1,
    backgroundColor: '#D8E0F0',
    opacity: 0.7,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
  },
  cancelButton: {
    flex: 1,
    alignSelf: 'stretch',
    height: 40,
    backgroundColor: '#F4F4F4',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#3A3F51',
  },
  saveButton: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#1777CF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FCFCFC',
  },
});

export default RegistrationDataPersonal;