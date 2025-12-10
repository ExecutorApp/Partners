import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import SchedulingDetailsPersonalData from './20.SchedulingDetails-PersonalData';
import SchedulingDetailsContent from './21.SchedulingDetails-Content';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatAppointmentDateLabel } from '../../utils/dateLabel';

type Appointment = {
  id: string;
  client?: string;
  date?: string; // YYYY-MM-DD
  slots?: { start: string; end: string }[];
  professional?: string;
  product?: string;
  activity?: string;
  flowType?: string;
  agendaType?: string;
  clientPhotoKey?: string | null;
  clientPhotoUri?: string | null;
};

// Ícones (Figma / Ícones 10.txt)
const BACK_ARROW_XML = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M10 19L1 10M1 10L10 1M1 10L19 10" stroke="#1777CF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const DATE_ICON_XML = `
<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
  <path d="M0.599976 7.6001H17.6M4.84998 2.6001V0.600098M13.35 2.6001V0.600098M2.72498 17.6001H15.475C16.6486 17.6001 17.6 16.7047 17.6 15.6001V4.6001C17.6 3.49553 16.6486 2.6001 15.475 2.6001H2.72498C1.55137 2.6001 0.599976 3.49553 0.599976 4.6001V15.6001C0.599976 16.7047 1.55137 17.6001 2.72498 17.6001Z" stroke="#7D8592" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const TIME_ICON_XML = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M9.59428 4.40087C9.54518 3.97813 9.18591 3.65 8.75 3.65C8.28056 3.65 7.9 4.03056 7.9 4.5V8.9625L7.90728 9.07369C7.94578 9.36603 8.13429 9.62092 8.4093 9.74123L11.8093 11.2287L11.9024 11.2632C12.3094 11.3877 12.754 11.1901 12.9287 10.7907L12.9632 10.6976C13.0877 10.2906 12.8901 9.84599 12.4907 9.67127L9.6 8.4066V4.5L9.59428 4.40087Z" fill="#7D8592"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.75 0.25C4.05558 0.25 0.25 4.05558 0.25 8.75C0.25 13.4444 4.05558 17.25 8.75 17.25C13.4444 17.25 17.25 13.4444 17.25 8.75C17.25 4.05558 13.4444 0.25 8.75 0.25ZM8.75 1.95C12.5055 1.95 15.55 4.99446 15.55 8.75C15.55 12.5055 12.5055 15.55 8.75 15.55C4.99446 15.55 1.95 12.5055 1.95 8.75C1.95 4.99446 4.99446 1.95 8.75 1.95Z" fill="#7D8592"/>
  <path d="M9.59428 4.40087C9.54518 3.97813 9.18591 3.65 8.75 3.65C8.28056 3.65 7.9 4.03056 7.9 4.5V8.9625L7.90728 9.07369C7.94578 9.36603 8.13429 9.62092 8.4093 9.74123L11.8093 11.2287L11.9024 11.2632C12.3094 11.3877 12.754 11.1901 12.9287 10.7907L12.9632 10.6976C13.0877 10.2906 12.8901 9.84599 12.4907 9.67127L9.6 8.4066V4.5L9.59428 4.40087Z" stroke="#FCFCFC" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.75 0.25C4.05558 0.25 0.25 4.05558 0.25 8.75C0.25 13.4444 4.05558 17.25 8.75 17.25C13.4444 17.25 17.25 13.4444 17.25 8.75C17.25 4.05558 13.4444 0.25 8.75 0.25ZM8.75 1.95C12.5055 1.95 15.55 4.99446 15.55 8.75C15.55 12.5055 12.5055 15.55 8.75 15.55C4.99446 15.55 1.95 12.5055 1.95 8.75C1.95 4.99446 4.99446 1.95 8.75 1.95Z" stroke="#FCFCFC" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Bloco de ÃƒÂ­cone 40x40 (Data) conforme container solicitado
const DATE_BLOCK_XML = `
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="6" fill="#F4F4F4"/>
  <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="6" stroke="#D8E0F0" stroke-width="0.5"/>
  <path d="M11.5 18.5H28.5M15.75 13.5V11.5M24.25 13.5V11.5M13.625 28.5H26.375C27.5486 28.5 28.5 27.6046 28.5 26.5V15.5C28.5 14.3954 27.5486 13.5 26.375 13.5H13.625C12.4514 13.5 11.5 14.3954 11.5 15.5V26.5C11.5 27.6046 12.4514 28.5 13.625 28.5Z" stroke="#7D8592" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Bloco de ÃƒÂ­cone 40x40 (RelÃƒÂ³gio) conforme container solicitado
const TIME_BLOCK_XML = `
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="6" fill="#F4F4F4"/>
  <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="6" stroke="#D8E0F0" stroke-width="0.5"/>
  <path d="M20.8443 15.6509C20.7952 15.2281 20.4359 14.9 20 14.9C19.5306 14.9 19.15 15.2806 19.15 15.75V20.2125L19.1573 20.3237C19.1958 20.616 19.3843 20.8709 19.6593 20.9912L23.0593 22.4787L23.1524 22.5132C23.5594 22.6377 24.004 22.4401 24.1787 22.0407L24.2132 21.9476C24.3377 21.5406 24.1401 21.096 23.7407 20.9213L20.85 19.6566V15.75L20.8443 15.6509Z" fill="#7D8592"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M20 11.5C15.3056 11.5 11.5 15.3056 11.5 20C11.5 24.6944 15.3056 28.5 20 28.5C24.6944 28.5 28.5 24.6944 28.5 20C28.5 15.3056 24.6944 11.5 20 11.5ZM20 13.2C23.7555 13.2 26.8 16.2445 26.8 20C26.8 23.7555 23.7555 26.8 20 26.8C16.2445 26.8 13.2 23.7555 13.2 20C13.2 16.2445 16.2445 13.2 20 13.2Z" fill="#7D8592"/>
  <path d="M20.8443 15.6509C20.7952 15.2281 20.4359 14.9 20 14.9C19.5306 14.9 19.15 15.2806 19.15 15.75V20.2125L19.1573 20.3237C19.1958 20.616 19.3843 20.8709 19.6593 20.9912L23.0593 22.4787L23.1524 22.5132C23.5594 22.6377 24.004 22.4401 24.1787 22.0407L24.2132 21.9476C24.3377 21.5406 24.1401 21.096 23.7407 20.9213L20.85 19.6566V15.75L20.8443 15.6509Z" stroke="#FCFCFC" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M20 11.5C15.3056 11.5 11.5 15.3056 11.5 20C11.5 24.6944 15.3056 28.5 20 28.5C24.6944 28.5 28.5 24.6944 28.5 20C28.5 15.3056 24.6944 11.5 20 11.5ZM20 13.2C23.7555 13.2 26.8 16.2445 26.8 20C26.8 23.7555 23.7555 26.8 20 26.8C16.2445 26.8 13.2 23.7555 13.2 20C13.2 16.2445 16.2445 13.2 20 13.2Z" stroke="#FCFCFC" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Divider (linha fina 0.5px) entre Data e Horário
const DATE_TIME_DIVIDER_XML = `
<svg width="186" height="1" viewBox="0 0 186 1" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0.25H186" stroke="#D8E0F0" stroke-width="0.5"/>
</svg>`;

const FLOW_ICON_XML = `
<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path d="M14.9742 0.149902H11.7957C11.1184 0.149902 10.5712 0.696244 10.5712 1.37267V2.59543H5.77748V1.37267C5.77748 0.696244 5.23037 0.149902 4.55299 0.149902H1.37452C0.697138 0.149902 0.150024 0.696244 0.150024 1.37267V4.52063C0.150024 5.19706 0.697138 5.7434 1.37452 5.7434H4.52693C5.20431 5.7434 5.75143 5.19706 5.75143 4.52063V3.29787H10.5452V4.52063C10.5452 4.72876 10.5973 4.93689 10.7015 5.11901L5.12615 10.7125C4.94378 10.6084 4.76141 10.5564 4.52693 10.5564H1.37452C0.697138 10.5564 0.150024 11.1027 0.150024 11.7792V14.9271C0.150024 15.6036 0.697138 16.1499 1.37452 16.1499H4.52693C5.20431 16.1499 5.75143 15.6036 5.75143 14.9271V13.7044H13.3068L11.8999 15.1093C11.7697 15.2393 11.7697 15.4475 11.8999 15.6036C11.9781 15.6816 12.0563 15.7076 12.1344 15.7076C12.2126 15.7076 12.3168 15.6816 12.3689 15.6036L14.3489 13.6263C14.4792 13.4962 14.4792 13.2881 14.3489 13.132L12.3689 11.1548C12.2386 11.0247 12.0302 11.0247 11.8739 11.1548C11.7436 11.2849 11.7436 11.493 11.8739 11.6491L13.2808 13.054H5.72537V11.8312C5.72537 11.6231 5.67327 11.4149 5.56906 11.2328L11.1705 5.63933C11.3528 5.7434 11.5352 5.79543 11.7697 5.79543H14.9221C15.5995 5.79543 16.1466 5.24909 16.1466 4.57267V1.37267C16.1987 0.696244 15.6516 0.149902 14.9742 0.149902ZM5.1001 4.54665C5.1001 4.85884 4.86562 5.09299 4.55299 5.09299H1.37452C1.06188 5.09299 0.827403 4.85884 0.827403 4.54665V1.37267C0.827403 1.06047 1.06188 0.826325 1.37452 0.826325H4.52693C4.83957 0.826325 5.07405 1.06047 5.07405 1.37267V4.54665H5.1001ZM5.1001 14.9532C5.1001 15.2653 4.86562 15.4995 4.55299 15.4995H1.37452C1.06188 15.4995 0.827403 15.2653 0.827403 14.9532V11.7792C0.827403 11.467 1.06188 11.2328 1.37452 11.2328H4.52693C4.83957 11.2328 5.07405 11.467 5.07405 11.7792V14.9532H5.1001ZM15.5213 4.54665C15.5213 4.85884 15.2868 5.09299 14.9742 5.09299H11.7957C11.4831 5.09299 11.2486 4.85884 11.2486 4.54665V1.37267C11.2486 1.06047 11.4831 0.826325 11.7957 0.826325H14.9481C15.2608 0.826325 15.4953 1.06047 15.4953 1.37267V4.54665H15.5213Z" fill="#7D8592" stroke="#7D8592" stroke-width="0.3"/>
</svg>`;

const AGENDA_ICON_XML = `
<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path d="M15.0072 1.67371H13.8643V0.530855C13.8643 0.42982 13.8242 0.332923 13.7527 0.261481C13.6813 0.190038 13.5844 0.149902 13.4834 0.149902C13.3823 0.149902 13.2854 0.190038 13.214 0.261481C13.1425 0.332923 13.1024 0.42982 13.1024 0.530855V1.67371H8.53098V0.530855C8.53098 0.42982 8.49084 0.332923 8.4194 0.261481C8.34796 0.190038 8.25106 0.149902 8.15002 0.149902C8.04899 0.149902 7.95209 0.190038 7.88065 0.261481C7.80921 0.332923 7.76907 0.42982 7.76907 0.530855V1.67371H3.19764V0.530855C3.19764 0.42982 3.15751 0.332923 3.08607 0.261481C3.01462 0.190038 2.91773 0.149902 2.81669 0.149902C2.71566 0.149902 2.61876 0.190038 2.54732 0.261481C2.47587 0.332923 2.43574 0.42982 2.43574 0.530855V1.67371H1.29288C0.989777 1.67371 0.699087 1.79412 0.48476 2.00845C0.270432 2.22277 0.150024 2.51346 0.150024 2.81657V15.007C0.150024 15.3102 0.270432 15.6008 0.48476 15.8152C0.699087 16.0295 0.989777 16.1499 1.29288 16.1499H15.0072C15.3103 16.1499 15.601 16.0295 15.8153 15.8152C16.0296 15.6008 16.15 15.3102 16.15 15.007V2.81657C16.15 2.51346 16.0296 2.22277 15.8153 2.00845C15.601 1.79412 15.3103 1.67371 15.0072 1.67371ZM1.29288 2.43562H2.43574V2.81657C2.43574 2.9176 2.47587 3.0145 2.54732 3.08594C2.61876 3.15739 2.71566 3.19752 2.81669 3.19752C2.91773 3.19752 3.01462 3.15739 3.08607 3.08594C3.15751 3.0145 3.19764 2.9176 3.19764 2.81657V2.43562H7.76907V2.81657C7.76907 2.9176 7.80921 3.0145 7.88065 3.08594C7.95209 3.15739 8.04899 3.19752 8.15002 3.19752C8.25106 3.19752 8.34796 3.15739 8.4194 3.08594C8.49084 3.0145 8.53098 2.9176 8.53098 2.81657V2.43562H13.1024V2.81657C13.1024 2.9176 13.1425 3.0145 13.214 3.08594C13.2854 3.15739 13.3823 3.19752 13.4834 3.19752C13.5844 3.19752 13.6813 3.15739 13.7527 3.08594C13.8242 3.0145 13.8643 2.9176 13.8643 2.81657V2.43562H15.0072C15.1082 2.43562 15.2051 2.47575 15.2765 2.5472C15.348 2.61864 15.3881 2.71553 15.3881 2.81657V4.72133H0.911929V2.81657C0.911929 2.71553 0.952065 2.61864 1.02351 2.5472C1.09495 2.47575 1.19185 2.43562 1.29288 2.43562ZM15.0072 15.388H1.29288C1.19185 15.388 1.09495 15.3479 1.02351 15.2764C0.952065 15.205 0.911929 15.1081 0.911929 15.007V5.48324H15.3881V15.007C15.3881 15.1081 15.348 15.205 15.2765 15.2764C15.2051 15.3479 15.1082 15.388 15.0072 15.388ZM10.6795 7.86038C10.7182 7.89199 10.7501 7.93102 10.7733 7.97516C10.7966 8.01931 10.8108 8.06767 10.815 8.11739C10.8193 8.16711 10.8136 8.21718 10.7981 8.26464C10.7827 8.3121 10.7579 8.35599 10.7253 8.39371L6.91574 12.9651C6.88202 13.0058 6.84022 13.0389 6.793 13.0625C6.74579 13.0861 6.69418 13.0997 6.64145 13.1023C6.59149 13.1029 6.54195 13.093 6.49603 13.0734C6.4501 13.0537 6.4088 13.0246 6.37479 12.988L4.85098 11.4642C4.81596 11.4292 4.78818 11.3876 4.76923 11.3418C4.75027 11.2961 4.74052 11.247 4.74052 11.1975C4.74052 11.148 4.75027 11.099 4.76923 11.0532C4.78818 11.0074 4.81596 10.9659 4.85098 10.9309C4.886 10.8958 4.92757 10.8681 4.97332 10.8491C5.01908 10.8302 5.06812 10.8204 5.11764 10.8204C5.16717 10.8204 5.21621 10.8302 5.26196 10.8491C5.30772 10.8681 5.34929 10.8958 5.38431 10.9309L6.6186 12.1575L10.1615 7.90609C10.2249 7.83259 10.3145 7.78671 10.4112 7.77817C10.508 7.76964 10.6042 7.79912 10.6795 7.86038Z" fill="#7D8592" stroke="#7D8592" stroke-width="0.3"/>
</svg>`;

const EXPERT_ICON_XML = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="23" viewBox="0 0 18 23" fill="none">
  <path d="M6.60998 4.40247C7.28899 4.55218 8.06954 4.63739 8.9 4.63739C9.73046 4.63739 10.511 4.55218 11.19 4.40247M6.60998 4.40247C6.07858 4.2853 5.57166 4.67143 5.57166 5.1951V8.26467C5.57166 9.91034 6.91319 11.4135 8.94291 11.4157C10.7498 11.4178 12.2283 9.97674 12.2283 8.24125M6.60998 4.40247C6.07858 4.28534 5.57166 4.67139 5.57166 5.19505V5.99684M12.2283 8.24125V5.1951C12.2283 4.67143 11.7214 4.2853 11.19 4.40247M12.2283 8.24125L12.2283 5.99684M12.2283 8.24125C12.2281 8.28704 12.2269 8.33282 12.2247 8.37856C12.3682 8.42829 12.5196 8.45366 12.6722 8.45355C13.3997 8.45355 13.9895 7.88708 13.9895 7.18825C13.9895 6.48947 13.3997 5.923 12.6722 5.923M11.19 4.40247C11.7214 4.28534 12.2283 4.67139 12.2283 5.19505V5.99684M5.12783 5.923C5.28361 5.923 5.43298 5.94917 5.57166 5.99684M5.12783 5.923C4.84354 5.92258 4.5668 6.0109 4.33931 6.17466C4.27622 5.18483 4.20543 3.94915 4.20543 3.38498C4.20543 2.73449 4.68516 2.50564 5.0316 2.42516C5.24872 2.37474 5.42409 2.22273 5.51013 2.02478C6.45568 -0.149694 9.40674 0.343826 11.0506 0.769309C12.2036 1.06775 12.8434 0.825217 13.1415 0.630757C13.2622 0.552009 13.4289 0.599993 13.4838 0.72978C14.0087 1.97073 13.8182 3.01053 13.6884 3.45695C13.6324 3.64938 13.5982 3.84705 13.5865 4.04653L13.4613 6.17505C13.2337 6.01105 12.9567 5.92259 12.6722 5.923M5.12783 5.923C5.2791 5.92289 5.42925 5.94787 5.57166 5.99684M5.12783 5.923C4.40024 5.923 3.81045 6.48947 3.81045 7.18825C3.81045 7.88704 4.40024 8.45355 5.12783 8.45355C5.28467 8.45355 5.43505 8.42708 5.57456 8.37878C5.57313 8.34076 5.57166 8.30278 5.57166 8.26462L5.57166 5.99684M12.2283 5.99684C12.3708 5.94788 12.5209 5.9229 12.6722 5.923M14.6252 22.3113V16.3204M3.17485 16.3204V22.3113M10.9522 12.25C11.4726 12.4436 11.9931 12.6372 12.5135 12.8308L10.622 14.3373C10.4732 14.4558 10.2505 14.4252 10.1423 14.2713L9.59718 13.496M10.9522 12.25C10.8997 12.2303 10.8533 12.198 10.8174 12.1562L9.65944 13.0785C9.59698 13.1282 9.55601 13.1985 9.5445 13.2757C9.53299 13.3529 9.55177 13.4314 9.59718 13.496M10.9522 12.25C11.171 12.3314 15.377 13.8959 15.6008 13.9792C16.585 14.3682 17.4 15.437 17.4 16.6596V18.1947M10.9522 12.25C10.8897 12.2268 10.836 12.186 10.7981 12.133C10.7601 12.08 10.7398 12.0172 10.7396 11.9529L10.7387 10.9026C10.2232 11.2266 9.6081 11.4157 8.94752 11.4157C8.21905 11.4157 7.57976 11.2218 7.05846 10.898L7.05851 11.951C7.05851 12.0826 6.9926 12.1601 6.91674 12.2096M9.59718 13.496C9.55323 13.4334 9.53426 13.3578 9.54376 13.2829H8.25624C8.26577 13.3578 8.2468 13.4335 8.20283 13.496M9.59718 13.496L10.063 14.1586L9.52864 14.9612M8.20283 13.496L7.6577 14.2713C7.54958 14.4252 7.32679 14.4558 7.17801 14.3373L5.27822 12.8242L6.91674 12.2096M8.20283 13.496C8.24823 13.4314 8.26701 13.3529 8.2555 13.2757C8.24399 13.1985 8.20303 13.1282 8.14056 13.0785L6.98145 12.1553C6.96223 12.1758 6.94051 12.194 6.91674 12.2096M8.20283 13.496L7.73701 14.1586L8.27141 14.9612M6.91674 12.2096L2.19926 13.9792C1.43 14.2832 0.400024 15.2399 0.400024 16.6596V21.824C0.400024 22.1421 0.668441 22.3999 0.999584 22.3999H4.47172M9.52864 14.9612H8.27141M9.52864 14.9612L10.3347 22.3999H7.46528L8.27141 14.9612M6.0848 22.3999H16.8005C17.1316 22.3999 17.4 22.142 17.4 21.824V19.744M7.65166 20.6799L9.44241 22.3998H10.3347L10.21 21.2484L7.83703 18.9693L7.65166 20.6799ZM8.01539 17.3235L9.99017 19.2202L9.76171 17.1122L8.20075 15.6129L8.01539 17.3235Z" stroke="#7D8592" stroke-width="0.8" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const PRODUCT_ICON_XML = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none">
  <path d="M15.951 2.25814H14.4349H12.9902H12.0282V1.24316C12.0282 0.613867 11.5149 0.0996094 10.8792 0.0996094H6.31733C5.68506 0.0996094 5.16836 0.610484 5.16836 1.24316V2.25814H4.20635H2.76164H1.24895C0.613273 2.25814 0.0999756 2.76901 0.0999756 3.3983V12.9561C0.0999756 13.5854 0.613273 14.0996 1.24895 14.0996H2.76504H4.20975H12.9902H14.4349H15.951C16.5833 14.0996 17.1 13.5887 17.1 12.9561V3.3983C17.0966 2.76901 16.5833 2.25814 15.951 2.25814ZM5.51169 2.9348H11.6883H12.6503V13.423H4.54629V2.9348H5.51169ZM5.85163 1.24316C5.85163 0.986028 6.06238 0.776265 6.32073 0.776265H10.8826C11.141 0.776265 11.3517 0.986028 11.3517 1.24316V2.25814H5.85163V1.24316ZM0.77984 12.9561V3.3983C0.77984 3.14118 0.990597 2.93141 1.24895 2.93141L4.20635 2.9348V8.35824V13.423L1.24895 13.4196C0.990597 13.423 0.77984 13.2132 0.77984 12.9561ZM4.20635 13.423V8.35824V2.9348H3.86642V13.423H4.20635ZM13.3301 13.423V2.9348H12.9902V13.423H13.3301ZM16.4167 12.9561C16.4167 13.2132 16.206 13.423 15.9476 13.423H12.9902V2.9348H15.9476C16.206 2.9348 16.4167 3.14456 16.4167 3.40169V12.9561Z" fill="#7D8592"/>
  <path d="M4.20635 2.9348L1.24895 2.93141C0.990597 2.93141 0.77984 3.14118 0.77984 3.3983V12.9561C0.77984 13.2132 0.990597 13.423 1.24895 13.4196L4.20635 13.423M4.20635 2.9348H3.86642V13.423H4.20635M4.20635 2.9348V8.35824V13.423M12.9902 2.9348H13.3301V13.423H12.9902M12.9902 2.9348V13.423M12.9902 2.9348H15.9476C16.206 2.9348 16.4167 3.14456 16.4167 3.40169V12.9561C16.4167 13.2132 16.206 13.423 15.9476 13.423H12.9902M15.951 2.25814H14.4349H12.9902H12.0282V1.24316C12.0282 0.613867 11.5149 0.0996094 10.8792 0.0996094H6.31733C5.68506 0.0996094 5.16836 0.610484 5.16836 1.24316V2.25814H4.20635H2.76164H1.24895C0.613273 2.25814 0.0999756 2.76901 0.0999756 3.3983V12.9561C0.0999756 13.5854 0.613273 14.0996 1.24895 14.0996H2.76504H4.20975H12.9902H14.4349H15.951C16.5833 14.0996 17.1 13.5887 17.1 12.9561V3.3983C17.0966 2.76901 16.5833 2.25814 15.951 2.25814ZM5.51169 2.9348H11.6883H12.6503V13.423H4.54629V2.9348H5.51169ZM5.85163 1.24316C5.85163 0.986028 6.06238 0.776265 6.32073 0.776265H10.8826C11.141 0.776265 11.3517 0.986028 11.3517 1.24316V2.25814H5.85163V1.24316Z" stroke="#7D8592" stroke-width="0.2"/>
</svg>`;

const PHASE_ICON_XML = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16" fill="none">
  <path d="M16.8667 0.150391H14.4108H7.76516C7.60869 0.150391 7.48183 0.275042 7.48183 0.428783V3.20224H5.851C5.69453 3.20224 5.56767 3.32689 5.56767 3.48063V5.79286H3.9367C3.78023 5.79286 3.65337 5.91751 3.65337 6.07125V8.95114H2.45598C2.29951 8.95114 2.17265 9.07579 2.17265 9.22953V11.8256H0.433358C0.276888 11.8256 0.150024 11.9502 0.150024 12.104V14.872C0.150024 15.0257 0.276888 15.1504 0.433358 15.1504H16.8667C17.0232 15.1504 17.15 15.0257 17.15 14.872V0.428783C17.15 0.275042 17.0232 0.150391 16.8667 0.150391ZM14.1274 0.707175V3.20224H12.4965H8.04849V0.707175H14.1274ZM7.76516 3.75902H12.2131V5.79286H10.5823H6.13433V3.75902H7.76516ZM5.851 6.34964H10.299V8.95114H9.10145H4.22004V6.34964H5.851ZM3.9367 9.50792H8.81812V11.8256H7.07896H2.73931V9.50792H3.9367ZM0.716691 12.3824H2.45598H6.79563V14.5936H0.716691V12.3824ZM16.5834 14.5936H7.3623V12.3824H9.10145C9.25792 12.3824 9.38478 12.2577 9.38478 12.104V9.50792H10.5823C10.7388 9.50792 10.8656 9.38327 10.8656 9.22953V6.34964H12.4965C12.6529 6.34964 12.7798 6.22499 12.7798 6.07125V3.75902H14.4108C14.5672 3.75902 14.6941 3.63437 14.6941 3.48063V0.707175H16.5834V14.5936Z" fill="#7D8592" stroke="#7D8592" stroke-width="0.3"/>
</svg>`;

const ACTIVITY_ICON_XML = `
<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <mask id="path-1-inside-1_653_1324" fill="white">
    <path d="M3.89865 8.70084C4.21829 8.06228 4.56647 7.44707 4.94317 6.8552C5.32056 6.26334 5.73644 5.68486 6.19082 5.11977L4.60806 4.79741C4.50219 4.77063 4.39977 4.77406 4.30078 4.80771C4.2018 4.84135 4.11243 4.89731 4.03269 4.97558L1.53121 7.47522C1.49134 7.51436 1.47793 7.56036 1.49099 7.61323C1.50405 7.6661 1.53705 7.70592 1.58998 7.7327L3.89865 8.70084ZM15.709 1.00624C14.1225 1.11953 12.7253 1.46799 11.5176 2.05162C10.3098 2.63524 9.17383 3.4585 8.10972 4.52139C7.34945 5.28216 6.68575 6.07452 6.11864 6.89846C5.55153 7.7224 5.08409 8.5412 4.71632 9.35484L7.63541 12.2644C8.44999 11.897 9.27282 11.4301 10.1039 10.8637C10.935 10.2972 11.7317 9.63361 12.494 8.87283C13.5581 7.80995 14.3823 6.67977 14.9666 5.48231C15.5509 4.28485 15.8998 2.89376 16.0132 1.30904C16.0132 1.26716 16.0101 1.22836 16.0039 1.19266C15.9978 1.15695 15.9758 1.11988 15.938 1.08143C15.9001 1.04297 15.863 1.021 15.8266 1.01551C15.7902 1.01002 15.7513 1.00658 15.7101 1.00521M10.1977 6.80989C9.89527 6.50709 9.74404 6.14421 9.74404 5.72125C9.74404 5.2983 9.89527 4.93542 10.1977 4.63262C10.5002 4.32982 10.8645 4.17876 11.2907 4.17945C11.7169 4.18014 12.0809 4.33119 12.3827 4.63262C12.6844 4.93404 12.8357 5.29692 12.8364 5.72125C12.837 6.14558 12.6858 6.50812 12.3827 6.80886C12.0795 7.1096 11.7152 7.26065 11.2897 7.26203C10.8642 7.2634 10.4998 7.11234 10.1967 6.80886M8.28914 13.0997L9.25942 15.4118C9.28623 15.464 9.32575 15.4936 9.37799 15.5004C9.43024 15.5073 9.47664 15.4908 9.51719 15.451L12.0197 12.9709C12.0988 12.892 12.1548 12.8027 12.1878 12.7031C12.2215 12.6043 12.2249 12.5023 12.1981 12.3972L11.8754 10.8163C11.3096 11.2709 10.7305 11.6852 10.1379 12.0594C9.54538 12.4336 8.92843 12.7804 8.28914 13.0997ZM17 0.85587C16.9918 2.57242 16.6659 4.15576 16.0225 5.6059C15.3791 7.05604 14.4191 8.41829 13.1426 9.69266C13.0766 9.75857 13.0137 9.81796 12.9539 9.87083C12.8941 9.9237 12.8315 9.9831 12.7662 10.049L13.2024 12.183C13.2574 12.4604 13.2436 12.7292 13.1612 12.9895C13.078 13.249 12.9357 13.479 12.7343 13.6795L9.86262 16.5479C9.65777 16.7525 9.4079 16.828 9.113 16.7744C8.81879 16.7216 8.616 16.5564 8.50464 16.279L7.26936 13.3695L3.61509 9.69884L0.702189 8.46498C0.424476 8.35444 0.261216 8.15188 0.21241 7.85732C0.163603 7.56276 0.241625 7.31318 0.446473 7.10857L3.3171 4.24022C3.51782 4.03972 3.74948 3.90137 4.01207 3.82515C4.27397 3.74825 4.54378 3.73761 4.8215 3.79323L6.95694 4.22889C7.02293 4.16297 7.07929 4.10358 7.12604 4.05071C7.17209 3.99784 7.22812 3.93845 7.29411 3.87253C8.56994 2.59817 9.93377 1.63621 11.3856 0.986672C12.8374 0.33713 14.4229 0.00823943 16.1421 0C16.2528 0.00411971 16.3604 0.0260917 16.4649 0.0659156C16.5693 0.105739 16.6666 0.170968 16.7567 0.261602C16.8467 0.352236 16.9086 0.445959 16.9423 0.542772C16.9759 0.639585 16.9945 0.743951 16.9979 0.85587M1.43737 12.6321C1.84088 12.2297 2.33101 12.0306 2.90775 12.0347C3.48448 12.0388 3.97461 12.2428 4.37812 12.6465C4.78163 13.0502 4.98235 13.5398 4.98029 14.1152C4.97823 14.6919 4.77544 15.1815 4.37193 15.5838C3.79863 16.1565 3.12428 16.517 2.34888 16.6653C1.57348 16.8129 0.790522 16.9245 0 17C0.0756151 16.1967 0.190756 15.4112 0.345424 14.6435C0.500091 13.8759 0.863387 13.2054 1.43737 12.6321ZM2.17359 13.3808C1.86769 13.6864 1.65563 14.0451 1.53739 14.4571C1.41916 14.8691 1.3322 15.2962 1.27652 15.7383C1.7199 15.6827 2.14781 15.5935 2.56026 15.4706C2.97271 15.3477 3.33153 15.1338 3.63674 14.8289C3.84297 14.6229 3.94814 14.3775 3.95227 14.0925C3.9557 13.8069 3.85431 13.5611 3.64809 13.3551C3.44186 13.1491 3.19611 13.0506 2.91084 13.0595C2.62556 13.0677 2.37981 13.1748 2.17359 13.3808Z"/>
  </mask>
  <path d="M3.89865 8.70084C4.21829 8.06228 4.56647 7.44707 4.94317 6.8552C5.32056 6.26334 5.73644 5.68486 6.19082 5.11977L4.60806 4.79741C4.50219 4.77063 4.39977 4.77406 4.30078 4.80771C4.2018 4.84135 4.11243 4.89731 4.03269 4.97558L1.53121 7.47522C1.49134 7.51436 1.47793 7.56036 1.49099 7.61323C1.50405 7.6661 1.53705 7.70592 1.58998 7.7327L3.89865 8.70084ZM15.709 1.00624C14.1225 1.11953 12.7253 1.46799 11.5176 2.05162C10.3098 2.63524 9.17383 3.4585 8.10972 4.52139C7.34945 5.28216 6.68575 6.07452 6.11864 6.89846C5.55153 7.7224 5.08409 8.5412 4.71632 9.35484L7.63541 12.2644C8.44999 11.897 9.27282 11.4301 10.1039 10.8637C10.935 10.2972 11.7317 9.63361 12.494 8.87283C13.5581 7.80995 14.3823 6.67977 14.9666 5.48231C15.5509 4.28485 15.8998 2.89376 16.0132 1.30904C16.0132 1.26716 16.0101 1.22836 16.0039 1.19266C15.9978 1.15695 15.9758 1.11988 15.938 1.08143C15.9001 1.04297 15.863 1.021 15.8266 1.01551C15.7902 1.01002 15.7513 1.00658 15.7101 1.00521M10.1977 6.80989C9.89527 6.50709 9.74404 6.14421 9.74404 5.72125C9.74404 5.2983 9.89527 4.93542 10.1977 4.63262C10.5002 4.32982 10.8645 4.17876 11.2907 4.17945C11.7169 4.18014 12.0809 4.33119 12.3827 4.63262C12.6844 4.93404 12.8357 5.29692 12.8364 5.72125C12.837 6.14558 12.6858 6.50812 12.3827 6.80886C12.0795 7.1096 11.7152 7.26065 11.2897 7.26203C10.8642 7.2634 10.4998 7.11234 10.1967 6.80886M8.28914 13.0997L9.25942 15.4118C9.28623 15.464 9.32575 15.4936 9.37799 15.5004C9.43024 15.5073 9.47664 15.4908 9.51719 15.451L12.0197 12.9709C12.0988 12.892 12.1548 12.8027 12.1878 12.7031C12.2215 12.6043 12.2249 12.5023 12.1981 12.3972L11.8754 10.8163C11.3096 11.2709 10.7305 11.6852 10.1379 12.0594C9.54538 12.4336 8.92843 12.7804 8.28914 13.0997ZM17 0.85587C16.9918 2.57242 16.6659 4.15576 16.0225 5.6059C15.3791 7.05604 14.4191 8.41829 13.1426 9.69266C13.0766 9.75857 13.0137 9.81796 12.9539 9.87083C12.8941 9.9237 12.8315 9.9831 12.7662 10.049L13.2024 12.183C13.2574 12.4604 13.2436 12.7292 13.1612 12.9895C13.078 13.249 12.9357 13.479 12.7343 13.6795L9.86262 16.5479C9.65777 16.7525 9.4079 16.828 9.113 16.7744C8.81879 16.7216 8.616 16.5564 8.50464 16.279L7.26936 13.3695L3.61509 9.69884L0.702189 8.46498C0.424476 8.35444 0.261216 8.15188 0.21241 7.85732C0.163603 7.56276 0.241625 7.31318 0.446473 7.10857L3.3171 4.24022C3.51782 4.03972 3.74948 3.90137 4.01207 3.82515C4.27397 3.74825 4.54378 3.73761 4.8215 3.79323L6.95694 4.22889C7.02293 4.16297 7.07929 4.10358 7.12604 4.05071C7.17209 3.99784 7.22812 3.93845 7.29411 3.87253C8.56994 2.59817 9.93377 1.63621 11.3856 0.986672C12.8374 0.33713 14.4229 0.00823943 16.1421 0C16.2528 0.00411971 16.3604 0.0260917 16.4649 0.0659156C16.5693 0.105739 16.6666 0.170968 16.7567 0.261602C16.8467 0.352236 16.9086 0.445959 16.9423 0.542772C16.9759 0.639585 16.9945 0.743951 16.9979 0.85587M1.43737 12.6321C1.84088 12.2297 2.33101 12.0306 2.90775 12.0347C3.48448 12.0388 3.97461 12.2428 4.37812 12.6465C4.78163 13.0502 4.98235 13.5398 4.98029 14.1152C4.97823 14.6919 4.77544 15.1815 4.37193 15.5838C3.79863 16.1565 3.12428 16.517 2.34888 16.6653C1.57348 16.8129 0.790522 16.9245 0 17C0.0756151 16.1967 0.190756 15.4112 0.345424 14.6435C0.500091 13.8759 0.863387 13.2054 1.43737 12.6321ZM2.17359 13.3808C1.86769 13.6864 1.65563 14.0451 1.53739 14.4571C1.41916 14.8691 1.3322 15.2962 1.27652 15.7383C1.7199 15.6827 2.14781 15.5935 2.56026 15.4706C2.97271 15.3477 3.33153 15.1338 3.63674 14.8289C3.84297 14.6229 3.94814 14.3775 3.95227 14.0925C3.9557 13.8069 3.85431 13.5611 3.64809 13.3551C3.44186 13.1491 3.19611 13.0506 2.91084 13.0595C2.62556 13.0677 2.37981 13.1748 2.17359 13.3808Z" fill="#7D8592"/>
</svg>`;

const formatHour = (apt: Appointment) => {
  return apt?.slots?.[0]?.start || '10:00';
};

// Traduz o tipo de fluxo para português
const translateFlowType = (flowType?: string): string => {
  if (!flowType) return 'Livre';
  switch (flowType.toLowerCase()) {
    case 'guided': return 'Guiado';
    case 'free': return 'Livre';
    default: return flowType;
  }
};

// Traduz o tipo de agenda para português
const translateAgendaType = (agendaType?: string): string => {
  if (!agendaType) return 'Pessoal';
  switch (agendaType.toLowerCase()) {
    case 'shared': return 'Compartilhada';
    case 'personal': return 'Pessoal';
    default: return agendaType;
  }
};

// Resolve a imagem do cliente a partir da chave ou URI (igual ao CalendarHomeScreen)
const resolveClientPhotoSource = (apt: Appointment | undefined) => {
  if (!apt) return require('../../../assets/AvatarPlaceholder02.png');
  if (apt.clientPhotoUri) return { uri: apt.clientPhotoUri } as any;
  switch (apt.clientPhotoKey) {
    case '01-Foto.png': return require('../../../assets/01-Foto.png');
    case '02-Foto.png': return require('../../../assets/02-Foto.png');
    case '03-Foto.png': return require('../../../assets/03-Foto.png');
    case '04-Foto.png': return require('../../../assets/04-Foto.png');
    case '05-Foto.png': return require('../../../assets/05-Foto.png');
    default: return require('../../../assets/AvatarPlaceholder02.png');
  }
};

const SchedulingDetailsMain: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const apt = (route.params as any)?.appointment as Appointment;
  
  const [tab, setTab] = useState<'main' | 'personal' | 'content'>('main');

  return (
    <View style={styles.screen}>
      {/* Header com tabs - posiÃƒÂ§ÃƒÂ£o fixa no topo (teto) */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <SvgXml xml={BACK_ARROW_XML} width={20} height={20} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerDivider} />
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tabBtn, tab === 'main' ? styles.tabActive : null]} onPress={() => setTab('main')}>
              <Text style={[styles.tabText, tab === 'main' ? styles.tabTextActive : null]}>Principal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, tab === 'personal' ? styles.tabActive : null]} onPress={() => setTab('personal')}>
              <Text style={[styles.tabText, tab === 'personal' ? styles.tabTextActive : null]}>Dados Pessoais</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, tab === 'content' ? styles.tabActive : null]} onPress={() => setTab('content')}>
              <Text style={[styles.tabText, tab === 'content' ? styles.tabTextActive : null]}>Conteúdo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ÃƒÂrea de conteÃƒÂºdo com limites verticais definidos */}
      <View style={styles.contentContainer}>
        {tab === 'main' && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={Platform.OS === 'android'}
            bounces={Platform.OS === 'ios'}
          >
            {/* Nome acima do contÃƒÂªiner combinado (foto + data/horÃƒÂ¡rio) */}
            <Text style={styles.personName} numberOfLines={1}>{apt?.client || 'Pérola Marina Diniz'}</Text>
            {/* ContÃƒÂªiner combinado com borda, alinhando foto e Data/Horário lado a lado */}
            <View style={styles.profileMainBox}>
              <View style={styles.avatarBox}>
                <Image source={resolveClientPhotoSource(apt)} style={styles.avatar} resizeMode="cover" />
              </View>
              <View style={[styles.dateTimeContainer, styles.dateTimeContainerOverride]}>
                <View style={styles.dateTimeTitleRow}>
                  <Text style={styles.dateTimeTitle}>Data e Horário</Text>
                </View>
                <View style={styles.dateTimeList}>
                  <View style={styles.dateTimeItem}>
                    <SvgXml xml={DATE_BLOCK_XML} width={40} height={40} />
                    <View style={styles.dateTimeTextCol}>
                      <View style={styles.labelRow}><Text style={styles.smallCardLabel}>Data</Text></View>
                      <View style={styles.valueRow}><Text style={styles.smallCardValue}>{formatAppointmentDateLabel(apt?.date || '')}</Text></View>
                    </View>
                  </View>
                  <View style={styles.dateTimeDivider}><SvgXml xml={DATE_TIME_DIVIDER_XML} width={186} height={1} /></View>
                  <View style={styles.dateTimeItem}>
                    <SvgXml xml={TIME_BLOCK_XML} width={40} height={40} />
                    <View style={styles.dateTimeTextCol}>
                      <View style={styles.labelRow}><Text style={styles.smallCardLabel}>Horário</Text></View>
                      <View style={styles.valueRow}><Text style={styles.smallCardValue}>{formatHour(apt)} às {apt?.slots?.[0]?.end || '11:00'}</Text></View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de:</Text>
              <View style={styles.inlineCards}>
                <View style={styles.inlineCard}>
                  <View style={styles.iconBlock}>
                    <SvgXml xml={FLOW_ICON_XML} width={17} height={17} />
                  </View>
                  <View style={styles.inlineCardCol}><Text style={styles.smallCardLabel}>Fluxo</Text><Text style={styles.smallCardValue}>{translateFlowType(apt?.flowType)}</Text></View>
                </View>
                <View style={styles.inlineCard}>
                  <View style={styles.iconBlock}>
                    <SvgXml xml={AGENDA_ICON_XML} width={17} height={17} />
                  </View>
                  <View style={styles.inlineCardCol}><Text style={styles.smallCardLabel}>Agenda</Text><Text style={styles.smallCardValue}>{translateAgendaType(apt?.agendaType)}</Text></View>
                </View>
              </View>
            </View>

            {/* Expert - só exibe se tiver profissional associado */}
            {apt?.professional && apt.professional !== 'Nenhum' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Expert</Text>
                <View style={styles.inlineCardFull}>
                  <View style={styles.iconBlock}>
                    <SvgXml xml={EXPERT_ICON_XML} width={18} height={23} />
                  </View>
                  <View style={styles.inlineCardCol}><Text style={styles.smallCardLabel}>Profissional</Text><Text style={styles.smallCardValue}>{apt.professional}</Text></View>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fluxo</Text>
              <View style={styles.flowList}>
                <View style={styles.flowRow}>
                  <View style={styles.iconBlock}>
                    <SvgXml xml={PRODUCT_ICON_XML} width={18} height={15} />
                  </View>
                  <View style={styles.flowCol}><Text style={styles.smallCardLabel}>Produto</Text><Text style={styles.smallCardValue}>{apt?.product || '—'}</Text></View>
                </View>
                {/* Fase e Atividade - só exibe se tiver atividade associada */}
                {apt?.activity && (
                  <>
                    <View style={styles.flowRow}>
                      <View style={styles.iconBlock}>
                        <SvgXml xml={PHASE_ICON_XML} width={18} height={16} />
                      </View>
                      <View style={styles.flowCol}>
                        <View style={styles.flowTopRow}>
                          <Text style={styles.smallCardLabel}>Fase</Text>
                          <Text style={styles.flowValueRight}>01/30</Text>
                        </View>
                        <View style={styles.flowBottomRow}>
                          <Text style={styles.smallCardValue} numberOfLines={1} ellipsizeMode="tail">Memorando</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.flowRow}>
                      <View style={styles.iconBlock}>
                        <SvgXml xml={ACTIVITY_ICON_XML} width={17} height={17} />
                      </View>
                      <View style={styles.flowCol}>
                        <View style={styles.flowTopRow}>
                          <Text style={styles.smallCardLabel}>Atividade</Text>
                          <Text style={styles.flowValueRight}>01/10</Text>
                        </View>
                        <View style={styles.flowBottomRow}>
                          <Text style={styles.smallCardValue} numberOfLines={1} ellipsizeMode="tail">{apt.activity}</Text>
                        </View>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>
            
            {/* Espaçador inferior para garantir 10px no fim da tela */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}

        {tab === 'personal' && (
          <SchedulingDetailsPersonalData
            data={{
              name: apt?.client || 'Pérola Marina Diniz',
              email: 'perola@email.com',
              whatsapp: '(11) 99999-0000',
              cpf: '000.111.222-33',
            }}
          />
        )}

        {tab === 'content' && (
          <SchedulingDetailsContent />
        )}
      </View>
    </View>
  );
};

export default SchedulingDetailsMain;

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  // Container do header - define o "teto"
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 0,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingTop: 12 
  },
  backBtn: { 
    padding: 6, 
    marginRight: 8 
  },
  headerDivider: { 
    height: 1, 
    backgroundColor: '#E5E7EB', 
    marginTop: 8 
  },
  tabsContainer: { 
    paddingHorizontal: 12, 
    paddingTop: 12, 
    paddingBottom: 12,
    alignItems: 'center' 
  },
  tabs: { 
    flexDirection: 'row', 
    backgroundColor: '#F4F4F4', 
    borderRadius: 8, 
    padding: 4, 
    justifyContent: 'flex-start', 
    gap: 8, 
    alignSelf: 'center' 
  },
  tabBtn: { 
    paddingHorizontal: 10, 
    paddingVertical: 8, 
    borderRadius: 6 
  },
  tabActive: { 
    backgroundColor: '#1777CF' 
  },
  tabText: { 
    color: '#3A3F51', 
    fontFamily: 'Inter_500Medium' 
  },
  tabTextActive: { 
    color: '#fff' 
  },
  // Container do conteÃƒÂºdo - define os limites verticais (piso e teto)
  contentContainer: { 
    flex: 1,
    position: 'relative',
    // No web, precisa de overflow hidden para o scroll interno funcionar
    ...Platform.select({
      web: {
        overflow: 'hidden',
      } as any,
      default: {},
    }),
  },
  // ScrollView - No web usa position absolute para ter altura definida
  scrollView: { 
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
      } as any,
      default: {
        flex: 1,
      },
    }),
  },
  scrollContent: { 
    paddingHorizontal: 16, 
    paddingTop: 16,
    paddingBottom: 0, // Padding bottom removido, usando bottomSpacer
  },
  personName: { 
    marginBottom: 8, 
    fontSize: 18, 
    paddingLeft: 5, 
    fontFamily: 'Inter_600SemiBold', 
    color: '#3A3F51' 
  },
  // Container "Data e Horário"
  dateTimeContainer: { 
    flex: 1, 
    alignSelf: 'stretch', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 15 
  },
  dateTimeTitleRow: { 
    alignSelf: 'stretch', 
    height: 15, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  dateTimeTitle: { 
    flex: 1, 
    color: '#3A3F51', 
    fontSize: 14, 
    fontFamily: 'Inter_500Medium' 
  },
  dateTimeList: { 
    alignSelf: 'stretch', 
    flexDirection: 'column', 
    alignItems: 'flex-start', 
    gap: 15 
  },
  dateTimeItem: { 
    alignSelf: 'stretch', 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 10 
  },
  profileMainBox: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 0, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 12, 
    padding: 12 
  },
  dateTimeContainerOverride: { 
    minHeight: 120, 
    justifyContent: 'flex-start', 
    alignItems: 'flex-start' 
  },
  dateTimeTextCol: { 
    flex: 1, 
    flexDirection: 'column', 
    alignItems: 'flex-start', 
    gap: 5 
  },
  dateTimeDivider: { 
    alignSelf: 'stretch', 
    height: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarBox: { 
    width: 140 
  },
  avatar: { 
    width: 120, 
    height: 145, 
    borderRadius: 10, 
    backgroundColor: '#D9D9D9' 
  },
  labelRow: { 
    alignSelf: 'stretch', 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  valueRow: { 
    alignSelf: 'stretch', 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  smallCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 10, 
    padding: 10 
  },
  smallCardIcon: { 
    marginRight: 10 
  },
  smallCardCol: { },
  smallCardLabel: { 
    color: '#7D8592', 
    fontSize: 14, 
    fontFamily: 'Inter_500Medium' 
  },
  smallCardValue: { 
    color: '#3A3F51', 
    fontSize: 14, 
    fontFamily: 'Inter_400Regular' 
  },
  section: { 
    marginTop: 20 
  },
  sectionTitle: { 
    color: '#3A3F51', 
    fontFamily: 'Inter_500Medium', 
    marginBottom: 8, 
    paddingLeft: 5 
  },
  inlineCards: { 
    flexDirection: 'row', 
    gap: 10, 
    alignSelf: 'stretch' 
  },
  inlineCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    flex: 1 
  },
  inlineCardFull: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 10 
  },
  inlineCardText: { 
    color: '#3A3F51' 
  },
  inlineCardCol: { },
  flowList: { 
    gap: 12 
  },
  flowRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 12 
  },
  flowCol: { 
    flex: 1, 
    marginLeft: 8 
  },
  flowTopRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  flowBottomRow: { 
    marginTop: 2 
  },
  flowLabel: { 
    marginLeft: 8, 
    color: '#7D8592', 
    width: 80 
  },
  flowValue: { 
    color: '#3A3F51', 
    fontFamily: 'Inter_600SemiBold', 
    flex: 1 
  },
  flowValueRight: { 
    color: '#7D8592', 
    marginLeft: 10 
  },
  iconBlock: { 
    width: 40, 
    height: 40, 
    borderRadius: 6, 
    borderWidth: 0.5, 
    borderColor: '#D8E0F0', 
    backgroundColor: '#F4F4F4', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  contentHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  outlineBtn: { 
    borderWidth: 1, 
    borderColor: '#1777CF', 
    borderRadius: 8, 
    paddingVertical: 8, 
    paddingHorizontal: 12 
  },
  outlineBtnText: { 
    color: '#1777CF', 
    fontFamily: 'Inter_500Medium' 
  },
  primaryBtn: { 
    backgroundColor: '#1777CF', 
    borderRadius: 8, 
    paddingVertical: 8, 
    paddingHorizontal: 12 
  },
  primaryBtnText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
  filterBox: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 10, 
    padding: 10, 
    marginTop: 12 
  },
  filterLabel: { 
    color: '#7D8592', 
    fontSize: 12 
  },
  filterValue: { 
    color: '#3A3F51', 
    fontWeight: '600', 
    marginTop: 4 
  },
  noteRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 10, 
    padding: 12, 
    marginTop: 10 
  },
  noteIcon: { 
    width: 20, 
    height: 20, 
    borderRadius: 4, 
    backgroundColor: '#EEF3F7', 
    marginRight: 10 
  },
  noteText: { 
    flex: 1, 
    color: '#3A3F51' 
  },
  noteMenuDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: '#7D8592' 
  },
  audioBar: { 
    backgroundColor: '#1777CF', 
    borderRadius: 12, 
    marginTop: 16, 
    padding: 12 
  },
  audioControls: { 
    height: 20, 
    justifyContent: 'center' 
  },
  audioLabel: { 
    color: '#fff', 
    fontFamily: 'Inter_600SemiBold' 
  },
  audioButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginTop: 10 
  },
  audioBtn: { 
    color: '#fff', 
    fontSize: 18 
  },
  // EspaÃƒÂ§ador inferior - define o "piso" com margem de respiro
  bottomSpacer: { 
    height: 10 
  },
});