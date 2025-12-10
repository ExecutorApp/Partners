import React, { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image, ViewStyle, TextStyle, FlatList, Platform, Alert } from 'react-native';
import { Layout } from '../../constants/theme';
import Svg, { Path, Rect } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';
import CardMenu from './3.CardMenu';
import Header from '../5.Side Menu/2.Header';
import BottomMenu from '../5.Side Menu/3.BottomMenu';
import SideMenuScreen from '../5.Side Menu/1.SideMenuScreen';
import AlternativeScreen from './18.AlternativeScreen';
import { RootStackParamList, ScreenNames } from '../../types/navigation';
import ModalFilters from './2.ModalFilters';
import NewAppointment01 from './4.NewAppointment-Customer';
import NewAppointmentProducts from './6.NewAppointment-Products';
import NewAppointmentFlowTypes from './7.NewAppointment-FlowTypes';
import NewAppointmentActivities from './8.NewAppointment-Activities';
import NewAppointmentAgendaTypes from './9.NewAppointment-AgendaTypes';
import NewAppointmentProfessionals from './10.NewAppointment-Professionals';
import NewAppointmentDateTime from './12.NewAppointment-DateTime';
import ModalAlertLeaveTheSchedule from './15.ModalAlert-LeaveTheSchedule';
import ModalAlertDeleteCommitment from './14.ModalAlert-DeleteCommitment';
import { getLocalStorage, idbGet, idbSet, idbRemove } from '../../utils/persistentStorageEngine';
import ModalShell from './16.NewAppointment-ModalShell';
import formatAppointmentDateLabel from '../../utils/dateLabel';

const { width, height: winHeight } = Dimensions.get('window');
if (Platform.OS === 'web') {
  // Log temporário para validar cálculo de altura do ScrollView na web
  console.log('[web] ScrollView target height:', winHeight - Layout.bottomMenuHeight);
}
const FLOW_SUMMARIES_STORAGE_KEY = 'partners.agenda.flow.summaries';
const FLOW_PROGRESS_STORAGE_KEY = 'partners.agenda.flow.progress';
const SLOT_MAP_STORAGE_KEY = 'partners.agenda.slots.map';
const APPOINTMENTS_STORAGE_KEY = 'partners.agenda.items';
const SELECTED_APT_STORAGE_KEY = 'partners.agenda.selected.appointment';
const TOTAL_STEPS = 7;

// SVG da ilustração de estado vazio (arquivo de referência completo)
const EMPTY_CALENDAR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="202" height="150" viewBox="0 0 202 150" fill="none">
  <g clip-path="url(#clip0_706_1863)">
    <path opacity="0.1" d="M2.17432 71.9155C5.36402 84.3254 12.1107 95.053 22.7724 100.253C44.9369 111.06 94.9237 105.487 132.231 99.0886C151.529 95.7795 168.491 86.6473 180.813 73.7956L2.17432 71.9155Z" fill="#1777CF"/>
    <path opacity="0.1" d="M197.81 13.5008H177.34C176.369 13.5008 175.572 12.7761 175.572 11.8906C175.572 11.0051 176.369 10.2786 177.34 10.2786H180.88C179.907 10.2786 179.112 9.55392 179.112 8.66658C179.112 7.77923 179.907 7.05642 180.88 7.05642H178.354C177.38 7.05642 176.583 6.33175 176.583 5.44441C176.583 4.55707 177.38 3.83425 178.354 3.83425H189.037C186.667 2.83044 183.896 2.11687 180.702 1.7416C151.569 -1.66544 141.168 0.588049 137.499 2.90439C132.926 5.82753 127.846 7.85583 122.526 8.88287C104.552 12.2603 70.9375 16.3236 40.4709 7.58883C25.3286 3.23899 14.0737 10.5799 7.32886 22.8511H201.365C201.111 19.2851 200.353 15.9909 198.961 13.1088C198.631 13.3651 198.226 13.503 197.81 13.5008V13.5008Z" fill="#1777CF"/>
    <path opacity="0.1" d="M0.438812 46.0127C-0.34742 53.2301 -0.0801568 60.5244 1.23211 67.6639L180.95 73.6516C185.897 68.4863 190.1 62.6482 193.437 56.3077L0.438812 46.0127ZM71.5195 61.458H67.9809C68.9541 61.458 69.7511 62.1845 69.7511 63.07C69.7511 63.9555 68.9541 64.6802 67.9809 64.6802H47.5113C46.5399 64.6802 45.7429 63.9555 45.7429 63.07C45.7429 62.1845 46.5399 61.458 47.5113 61.458H51.0517C50.0785 61.458 49.2834 60.7334 49.2834 59.8479C49.2834 58.9624 50.0785 58.2359 51.0517 58.2359H48.5231C47.5499 58.2359 46.7529 57.5112 46.7529 56.6257C46.7529 55.7402 47.5499 55.0137 48.5231 55.0137H68.9927C69.9659 55.0137 70.7611 55.7384 70.7611 56.6257C70.7611 57.513 69.9659 58.2359 68.9927 58.2359H71.5195C72.4927 58.2359 73.2879 58.9605 73.2879 59.8479C73.2879 60.7352 72.4927 61.458 71.5195 61.458Z" fill="#1777CF"/>
    <path opacity="0.1" d="M201.372 22.9619L5.16377 27.3062C2.77654 32.8946 1.19362 39.2133 0.4646 45.7611H197.934C199.22 41.9302 200.173 37.9946 200.784 33.9983C201.374 30.1513 201.609 26.43 201.372 22.9619ZM40.3019 37.2056H36.7633C37.7366 37.2056 38.5336 37.9322 38.5336 38.8176C38.5336 39.7031 37.7366 40.4297 36.7633 40.4297H16.2938C15.3223 40.4297 14.5254 39.7031 14.5254 38.8176C14.5254 37.9322 15.3223 37.2056 16.2938 37.2056H19.8342C18.861 37.2056 18.0658 36.481 18.0658 35.5955C18.0658 34.71 18.861 33.9835 19.8342 33.9835H17.3056C16.3323 33.9835 15.5354 33.2588 15.5354 32.3733C15.5354 31.4878 16.3323 30.7613 17.3056 30.7613H37.7752C38.7484 30.7613 39.5435 31.486 39.5435 32.3733C39.5435 33.2607 38.7484 33.9835 37.7752 33.9835H40.3019C41.2752 33.9835 42.0703 34.71 42.0703 35.5955C42.0703 36.481 41.2752 37.2056 40.3019 37.2056Z" fill="#1777CF"/>
    <path opacity="0.1" d="M100.095 144.393C145.426 144.393 182.175 140.99 182.175 136.792C182.175 132.593 145.426 129.19 100.095 129.19C54.763 129.19 18.0144 132.593 18.0144 136.792C18.0144 140.99 54.763 144.393 100.095 144.393Z" fill="#1777CF"/>
    <path d="M95.3036 141.104C126.591 141.104 151.954 115.571 151.954 84.0738C151.954 52.5768 126.591 27.0435 95.3036 27.0435C64.0163 27.0435 38.6528 52.5768 38.6528 84.0738C38.6528 115.571 64.0163 141.104 95.3036 141.104Z" fill="#F4F4F4"/>
    <path d="M125.028 112.734C125.028 121.736 110.97 113.503 95.8969 113.503C80.8243 113.503 65.5791 121.396 65.5791 112.393C65.5791 107.26 70.438 100.12 77.4087 94.9349C82.6606 91.0269 89.1098 88.228 95.5884 88.228C102.251 88.228 108.777 91.2579 113.983 95.4174C120.553 100.662 125.028 107.709 125.028 112.734Z" fill="#444053"/>
    <path d="M113.981 95.4135C105.969 94.1989 91.4787 92.7181 77.4087 94.931C82.6606 91.0229 89.1098 88.2241 95.5884 88.2241C102.249 88.2241 108.775 91.254 113.981 95.4135Z" fill="#F6F8FB"/>
    <path opacity="0.05" d="M65.5791 43.8164C65.5791 43.8164 48.5141 54.7991 48.6537 71.9785C48.7932 89.1578 65.5791 43.8164 65.5791 43.8164Z" fill="black"/>
    <path d="M151.932 12.798C151.932 12.798 136.471 11.8607 138.294 22.7677C138.294 22.7677 137.927 24.6939 139.668 25.5702C139.668 25.5702 139.695 24.7623 141.252 25.0359C141.807 25.1294 142.371 25.1567 142.933 25.1173C143.691 25.0654 144.412 24.7655 144.986 24.2632V24.2632C144.986 24.2632 149.332 22.4571 151.023 15.3047C151.023 15.3047 152.274 13.7445 152.224 13.3452L149.615 14.4655C149.615 14.4655 150.506 16.3603 149.799 17.9353C149.799 17.9353 149.714 14.5357 149.213 14.6078C149.112 14.6244 147.858 15.2641 147.858 15.2641C147.858 15.2641 149.391 18.5657 148.225 20.9634C148.225 20.9634 148.664 16.8964 147.369 15.5025L145.533 16.5821C145.533 16.5821 147.325 19.991 146.109 22.7732C146.109 22.7732 146.422 18.5066 145.147 16.8447L143.482 18.1516C143.482 18.1516 145.166 21.5125 144.139 23.8195C144.139 23.8195 144.005 18.8523 143.122 18.477C143.122 18.477 141.666 19.771 141.443 20.3016C141.443 20.3016 142.597 22.7399 141.882 24.0266C141.882 24.0266 141.443 20.7175 141.083 20.6991C141.083 20.6991 139.633 22.8915 139.48 24.3963C139.48 24.3963 139.545 22.1595 140.731 20.4902C140.731 20.4902 139.328 20.7323 138.511 21.6492C138.511 21.6492 138.737 20.0982 141.082 19.9633C141.082 19.9633 142.281 18.2995 142.602 18.1997C142.602 18.1997 140.261 18.0019 138.841 18.636C138.841 18.636 140.09 17.1737 143.03 17.8374L144.683 16.4879C144.683 16.4879 141.601 16.0627 140.294 16.5322C140.294 16.5322 141.798 15.2382 145.125 16.181L146.916 15.1032C146.916 15.1032 144.288 14.5339 142.721 14.7335C142.721 14.7335 144.374 13.8369 147.439 14.8093L148.724 14.2307C148.724 14.2307 146.798 13.8499 146.234 13.7907C145.671 13.7316 145.641 13.5726 145.641 13.5726C146.864 13.3723 148.119 13.5189 149.264 13.9959C149.264 13.9959 151.978 12.9699 151.932 12.798Z" fill="#1777CF"/>
    <path d="M136.074 7.94915C136.074 7.94915 129.096 7.52396 129.911 12.4524C129.911 12.4524 129.748 13.3231 130.532 13.7187C130.532 13.7187 130.543 13.349 131.248 13.4784C131.499 13.5199 131.753 13.5323 132.006 13.5154C132.349 13.4907 132.675 13.3552 132.936 13.129V13.129C132.936 13.129 134.899 12.3119 135.663 9.08051C135.663 9.08051 136.228 8.37618 136.214 8.19502L135.035 8.70154C135.035 8.70154 135.439 9.55746 135.121 10.2692C135.121 10.2692 135.082 8.73297 134.856 8.76994C134.811 8.76994 134.243 9.06572 134.243 9.06572C134.243 9.06572 134.937 10.5576 134.414 11.6409C134.414 11.6409 134.612 9.80333 134.028 9.17294L133.198 9.66098C133.198 9.66098 134.008 11.2027 133.459 12.4598C133.459 12.4598 133.599 10.5317 133.024 9.78114L132.271 10.3709C132.271 10.3709 133.031 11.8886 132.568 12.9312C132.568 12.9312 132.508 10.687 132.107 10.5169C132.107 10.5169 131.45 11.1011 131.349 11.3414C131.349 11.3414 131.871 12.4506 131.547 13.0255C131.547 13.0255 131.349 11.53 131.18 11.5244C131.18 11.5244 130.525 12.5134 130.457 13.1882C130.488 12.5602 130.683 11.9516 131.02 11.4227C130.643 11.4947 130.294 11.6766 130.018 11.9459C130.018 11.9459 130.119 11.2453 131.182 11.1843C131.182 11.1843 131.724 10.4337 131.869 10.3875C131.869 10.3875 130.811 10.2988 130.17 10.5853C130.17 10.5853 130.734 9.92349 132.063 10.2156L132.798 9.60737C132.798 9.60737 131.406 9.42251 130.815 9.62586C130.815 9.62586 131.494 9.04169 132.998 9.46873L133.806 8.98069C133.806 8.98069 132.62 8.72373 131.911 8.81616C131.911 8.81616 132.658 8.41131 134.043 8.85128L134.621 8.58878C134.621 8.58878 133.751 8.41685 133.498 8.39097C133.244 8.36509 133.228 8.29299 133.228 8.29299C133.779 8.20068 134.345 8.26469 134.862 8.47786C134.862 8.47786 136.094 8.02679 136.074 7.94915Z" fill="#1777CF"/>
    <path opacity="0.1" d="M197.055 134.952C199.786 134.952 202 134.576 202 134.111C202 133.647 199.786 133.27 197.055 133.27C194.324 133.27 192.11 133.647 192.11 134.111C192.11 134.576 194.324 134.952 197.055 134.952Z" fill="#1777CF"/>
    <path opacity="0.1" d="M8.58855 148.944C11.3197 148.944 13.5338 148.568 13.5338 148.103C13.5338 147.639 11.3197 147.262 8.58855 147.262C5.85737 147.262 3.64331 147.639 3.64331 148.103C3.64331 148.568 5.85737 148.944 8.58855 148.944Z" fill="#1777CF"/>
    <path opacity="0.1" d="M37.2958 150C40.027 150 42.2411 149.624 42.2411 149.159C42.2411 148.694 40.027 148.318 37.2958 148.318C34.5646 148.318 32.3506 148.694 32.3506 149.159C32.3506 149.624 34.5646 150 37.2958 150Z" fill="#1777CF"/>
    <path d="M186.232 144.382C190.31 144.382 193.615 143.819 193.615 143.125C193.615 142.43 190.31 141.868 186.232 141.868C182.154 141.868 178.848 142.43 178.848 143.125C178.848 143.819 182.154 144.382 186.232 144.382Z" fill="#1777CF"/>
    <path d="M189.283 141.071C189.62 140.794 189.866 140.421 189.988 140.001C190.078 139.578 189.899 139.067 189.496 138.912C189.045 138.738 188.562 139.054 188.196 139.372C187.831 139.69 187.41 140.053 186.931 139.986C187.177 139.761 187.362 139.476 187.466 139.158C187.57 138.84 187.591 138.501 187.526 138.173C187.505 138.037 187.448 137.909 187.361 137.803C187.109 137.533 186.656 137.648 186.354 137.86C185.4 138.537 185.133 139.842 185.128 141.018C185.032 140.594 185.113 140.152 185.111 139.724C185.109 139.295 184.99 138.799 184.626 138.572C184.401 138.451 184.148 138.391 183.892 138.398C183.462 138.381 182.985 138.424 182.691 138.74C182.324 139.134 182.421 139.792 182.739 140.219C183.056 140.646 183.537 140.923 183.98 141.221C184.336 141.434 184.64 141.725 184.869 142.073C184.896 142.122 184.918 142.174 184.935 142.227H187.625C188.227 141.919 188.785 141.53 189.283 141.071V141.071Z" fill="#1777CF"/>
    <path d="M10.8967 125.57C10.8967 125.57 11.9048 126.898 10.4303 128.898C8.95568 130.898 7.74003 132.595 8.22666 133.845C8.22666 133.845 10.4505 130.122 12.2666 130.068C14.0827 130.014 12.8873 127.809 10.8967 125.57Z" fill="#1777CF"/>
    <path opacity="0.1" d="M10.8969 125.57C10.9844 125.699 11.0536 125.839 11.1025 125.986C12.8691 128.075 13.8093 130.026 12.1125 130.074C10.5296 130.12 8.62347 132.967 8.17725 133.686C8.19285 133.742 8.21123 133.796 8.23234 133.85C8.23234 133.85 10.4561 130.127 12.2723 130.074C14.0884 130.02 12.8874 127.809 10.8969 125.57Z" fill="black"/>
    <path d="M13.4069 127.82C12.9993 128.044 12.645 128.179 12.6138 128.121C12.5825 128.064 12.8891 127.839 13.2967 127.615C13.7043 127.391 13.5427 127.554 13.5739 127.615C13.6052 127.676 13.8218 127.596 13.4069 127.82Z" fill="#FFD037"/>
    <path d="M5.56771 125.57C5.56771 125.57 4.55957 126.898 6.0323 128.898C7.50504 130.898 8.72253 132.595 8.2359 133.845C8.2359 133.845 6.01027 130.122 4.19597 130.068C2.38168 130.014 3.57529 127.809 5.56771 125.57Z" fill="#1777CF"/>
    <path opacity="0.1" d="M5.56769 125.57C5.47934 125.698 5.41005 125.838 5.36202 125.986C3.59547 128.075 2.65343 130.026 4.35204 130.074C5.93312 130.12 7.84107 132.967 8.28546 133.686C8.27048 133.742 8.25271 133.796 8.2322 133.85C8.2322 133.85 6.00657 130.127 4.19228 130.074C2.37798 130.02 3.57527 127.809 5.56769 125.57Z" fill="#1777CF"/>
    <path d="M3.69287 127.262C3.69287 127.729 3.74428 128.108 3.80853 128.108C3.87279 128.108 3.9242 127.739 3.9242 127.262C3.9242 126.785 3.85994 127.014 3.79568 127.014C3.73143 127.014 3.69287 126.794 3.69287 127.262Z" fill="#FFD037"/>
    <path d="M3.04821 127.82C3.45579 128.044 3.81195 128.179 3.84316 128.121C3.87437 128.064 3.56778 127.839 3.1602 127.615C2.75263 127.391 2.91236 127.554 2.88298 127.615C2.85361 127.676 2.64064 127.596 3.04821 127.82Z" fill="#FFD037"/>
    <path d="M4.01416 133.677C4.01416 133.677 6.83476 133.59 7.68682 132.98C8.53888 132.37 12.0261 131.643 12.2372 132.61C12.4484 133.577 16.4755 137.472 13.2913 137.498C10.1071 137.524 5.89273 136.997 5.04434 136.477C4.19596 135.958 4.01416 133.677 4.01416 133.677Z" fill="#A8A8A8"/>
    <path opacity="0.2" d="M13.3446 137.167C10.1604 137.193 5.94598 136.666 5.0976 136.146C4.45121 135.751 4.19412 134.329 4.10781 133.673H4.01416C4.01416 133.673 4.19779 135.963 5.04067 136.483C5.88355 137.002 10.1034 137.529 13.2876 137.503C14.2058 137.503 14.5235 137.165 14.507 136.679C14.3784 136.976 14.0295 137.161 13.3446 137.167Z" fill="black"/>
    <path d="M75.1629 76.5963C76.2408 76.5353 81.3146 76.1507 84.5373 74.3003C85.0549 73.9937 85.6396 73.8204 86.2396 73.7956C87.2643 73.766 88.4432 74.1967 87.6885 76.6074C86.4655 80.5505 79.3644 84.9872 74.9572 84.7413C70.719 84.5047 65.6911 82.7855 62.371 76.7405C62.0529 76.1589 61.8962 75.5018 61.9174 74.8382C61.956 73.6181 62.3967 72.0893 64.6719 73.7937C67.7459 76.0953 73.5781 76.5316 74.7479 76.5963C74.8861 76.6037 75.0246 76.6037 75.1629 76.5963V76.5963Z" fill="#444053"/>
    <path d="M115.929 76.5963C117.007 76.5353 122.081 76.1507 125.304 74.3003C125.821 73.9937 126.406 73.8204 127.006 73.7956C128.031 73.766 129.21 74.1967 128.455 76.6074C127.232 80.5505 120.131 84.9872 115.724 84.7413C111.485 84.5047 106.457 82.7855 103.137 76.7405C102.819 76.1589 102.663 75.5018 102.684 74.8382C102.722 73.6181 103.163 72.0893 105.438 73.7937C108.512 76.0953 114.344 76.5316 115.514 76.5963C115.652 76.6037 115.791 76.6037 115.929 76.5963V76.5963Z" fill="#444053"/>
  </g>
  <defs>
    <clipPath id="clip0_706_1863">
      <rect width="202" height="150" fill="white"/>
    </clipPath>
  </defs>
</svg>`;

const CalendarHomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [sideMenuVisible, setSideMenuVisible] = useState<boolean>(false);
  const [showWeekCalendar, setShowWeekCalendar] = useState<boolean>(false);
  // Seleção de dia no calendário mensal (30 dias)
  const [selectedMonthDateKey, setSelectedMonthDateKey] = useState<string | null>(null);
  // Modal de menu por agenda (3 pontinhos)
  const [agendaMenuVisible, setAgendaMenuVisible] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const handleOpenAgendaMenu = (apt?: AppointmentItem) => {
    if (apt) {
      setSelectedAppointment(apt);
      // Persiste no storage para manter ativo ao alternar telas
      try {
        const storage = getLocalStorage();
        if (storage) storage.setItem(SELECTED_APT_STORAGE_KEY, apt.id);
        idbSet(SELECTED_APT_STORAGE_KEY, apt.id).catch(() => {});
      } catch {}
    }
    setAgendaMenuVisible(true);
  };
  // Fecha o menu mas MANTÉM o card ativo
  const handleCloseAgendaMenu = () => {
    setAgendaMenuVisible(false);
  };
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  // Inicializa com o dia atual da semana (0 = Domingo, 6 = Sábado)
  const [selectedWeekDayIndex, setSelectedWeekDayIndex] = useState<number>(new Date().getDay());
  const [showMonthCalendar, setShowMonthCalendar] = useState<boolean>(false);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [monthContainerWidth, setMonthContainerWidth] = useState<number>(width);
  const [appointmentDays, setAppointmentDays] = useState<number[]>([]);
  // Modal de Filtros
  const [filtersModalVisible, setFiltersModalVisible] = useState<boolean>(false);
  const [filtersModalTab, setFiltersModalTab] = useState<'periods' | 'products' | 'flows' | 'types'>('periods');
  // Labels dinâmicos dos filtros exibidos nos cards
  const [periodsLabel, setPeriodsLabel] = useState<string>('Hoje');
  const [productsLabel, setProductsLabel] = useState<string>('Todos');
  const [flowsLabel, setFlowsLabel] = useState<string>('Todos');
  const [typesLabel, setTypesLabel] = useState<string>('Todos');
  // Estado detalhado do filtro de Períodos para compor o label conforme regras
  const [periodQuickLabel, setPeriodQuickLabel] = useState<'none' | 'Hoje' | '15 dias' | 'Este mês'>('none');
  const [periodStartDate, setPeriodStartDate] = useState<Date | null>(null);
  const [periodEndDate, setPeriodEndDate] = useState<Date | null>(null);
  // Medição para decidir entre "esticar" (preencher largura) ou manter tamanho natural com scroll
  const [containerWidth, setContainerWidth] = useState<number>(width);
  const [filterWidths, setFilterWidths] = useState<number[]>([0, 0, 0, 0]);
  const [measurementDone, setMeasurementDone] = useState<boolean>(false);
  const gapSize = 10; // mesmo valor usado em styles.filtersRow.gap
  // total de largura dos filtros + gaps entre eles
  const numFilterCards = showWeekCalendar ? 3 : 4;
  const gapCount = numFilterCards - 1;
  const totalFiltersWidth = filterWidths.reduce((a, b) => a + b, 0) + gapSize * gapCount;
  const shouldStretch = measurementDone && totalFiltersWidth > 0 && totalFiltersWidth <= containerWidth;
  // No modo 7 dias, usamos flex layout (sem scroll), então shouldStretch não é usado
  // No modo normal (4 filtros), mantém o comportamento padrão baseado em shouldStretch
  const effectiveShouldStretch = showWeekCalendar ? false : shouldStretch;
  const cardStretchWidth = Math.max(120, Math.floor((containerWidth - gapSize * gapCount) / numFilterCards));

  const onFilterLayout = (index: number) => (e: any) => {
    if (measurementDone) return; // evita re-medição que causa loop visual
    const w = e?.nativeEvent?.layout?.width ?? 0;
    setFilterWidths((prev) => {
      const next = [...prev];
      next[index] = w;
      return next;
    });
  };

  React.useEffect(() => {
    if (!measurementDone && filterWidths.every((w) => w > 0)) {
      setMeasurementDone(true);
    }
  }, [filterWidths, measurementDone]);

  const handleMenuPress = () => {
    setSideMenuVisible(true);
  };

  const handleNewSchedule = () => {
    // Fluxo de criação: desativa modo edição
    setIsEditingSchedule(false);
    setNewAppointmentStep(1);
    setNewAppointmentVisible(true);
  };

  const handleProductPress = () => {
    console.log('Produto');
  };

  const handlePhasePress = () => {
    console.log('Fase');
  };

  const handleActivityPress = () => {
    console.log('Atividade');
  };

  // Abrir detalhes do agendamento (tela 19)
  const openAppointmentDetails = (apt: AppointmentItem) => {
    try {
      // Define o card como ativo
      setSelectedAppointment(apt);
      // Persiste no storage para manter ativo ao voltar/alternar telas
      try {
        const storage = getLocalStorage();
        if (storage) storage.setItem(SELECTED_APT_STORAGE_KEY, apt.id);
        idbSet(SELECTED_APT_STORAGE_KEY, apt.id).catch(() => {});
      } catch {}
      navigation.navigate(ScreenNames.SchedulingDetailsMain as any, { appointment: apt } as any);
    } catch (e) {
      console.log('[CalendarHomeScreen] navigation to SchedulingDetailsMain failed:', e);
    }
  };

  // Alternar telas (placeholder para futura lógica de alternância de layout)
  const [alternateView, setAlternateView] = useState<boolean>(false);
  const handleToggleScreens = () => {
    setAlternateView((v) => !v);
    console.log('[CalendarHomeScreen] Alternar telas:', !alternateView);
  };

  const [newAppointmentVisible, setNewAppointmentVisible] = React.useState(false);
  const [newAppointmentStep, setNewAppointmentStep] = React.useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [maxAccessibleStep, setMaxAccessibleStep] = React.useState<number>(1);
  const [leaveModalVisible, setLeaveModalVisible] = React.useState<boolean>(false);
  // Modo de edição do agendamento (altera título e rótulo final)
  const [isEditingSchedule, setIsEditingSchedule] = React.useState<boolean>(false);
  // Seleções para navegação condicional
  const [selectedFlowType, setSelectedFlowType] = React.useState<'guided' | 'free' | null>(null);
  const [selectedAgendaType, setSelectedAgendaType] = React.useState<string | null>(null);
  // Direção das transições entre etapas do novo agendamento
  const [transitionDirection, setTransitionDirection] = React.useState<'forward' | 'backward'>('forward');

  type SlotPair = { start: string; end: string };
  type AppointmentItem = {
    id: string;
    date: string;
    slots: SlotPair[];
    client?: string | null;
    product?: string | null;
    activity?: string | null;
    agendaType?: 'personal' | 'shared' | null;
    flowType?: 'guided' | 'free' | null;
    professional?: string | null;
    clientPhotoKey?: string | null;
    clientPhotoUri?: string | null;
  };

  const [appointments, setAppointments] = React.useState<AppointmentItem[]>([]);

  const handleEditAppointment = async () => {
    if (selectedAppointment) {
      // Monta resumo da etapa 7 (data e horários) para hidratação do fluxo guiado
      const parseDate = (key: string) => {
        const [yyyy, mm, dd] = key.split('-').map((v) => parseInt(v, 10));
        return new Date(yyyy, (mm || 1) - 1, dd || 1);
      };
      const d = parseDate(selectedAppointment.date);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = String(d.getFullYear()).slice(-2);
      const weekdayNames = ['Domingo', 'Segunda Feira', 'Terça Feira', 'Quarta Feira', 'Quinta Feira', 'Sexta Feira', 'Sábado'];
      const dateLabel = `${weekdayNames[d.getDay()]} - ${dd}/${mm}/${yy}`;
      const timesLabel = (selectedAppointment.slots || []).map((s) => `${s.start}-${s.end}`).join(', ');
      const step7Summary = timesLabel ? `${dateLabel}: ${timesLabel}` : `${dateLabel}`;

      // Determina e hidrata "Tipos de Fluxo" (etapa 3) e "Tipos de Agenda" (etapa 5)
      const inferredFlowType: 'guided' | 'free' | null = (selectedAppointment as any).flowType ?? (selectedAppointment.activity ? 'guided' : 'free');
      const flowTypeLabel = inferredFlowType === 'free' ? 'Livre' : inferredFlowType === 'guided' ? 'Guiado' : '';
      const rawAgenda = selectedAppointment.agendaType ?? null;
      let agendaTypeId: 'personal' | 'shared' | null = null;
      if (rawAgenda === 'personal' || rawAgenda === 'shared') {
        agendaTypeId = rawAgenda;
      } else if (typeof rawAgenda === 'string') {
        const norm = (rawAgenda as string).toLowerCase().trim();
        if (norm === 'pessoal') agendaTypeId = 'personal';
        else if (norm === 'compartilhada') agendaTypeId = 'shared';
      }
      const agendaTypeLabel = agendaTypeId === 'personal' ? 'Pessoal' : agendaTypeId === 'shared' ? 'Compartilhada' : '';

      const updatedSummaries: Partial<Record<number, string>> = {
        1: selectedAppointment.client || '',
        2: selectedAppointment.product || '',
        3: flowTypeLabel,
        4: selectedAppointment.activity || '',
        5: agendaTypeLabel,
        6: selectedAppointment.professional || '',
        7: step7Summary,
      };
      setFlowSummaries(updatedSummaries);
      console.log('[EditAppointment] Hydrated summaries:', updatedSummaries);
      recomputeMaxAccessible(updatedSummaries);
      const agendaType = agendaTypeId;
      if (agendaType === 'personal' || agendaType === 'shared') {
        setSelectedAgendaType(agendaType);
      }
      if (inferredFlowType) {
        setSelectedFlowType(inferredFlowType);
      }
      console.log('[EditAppointment] Selected flowType:', inferredFlowType, 'agendaType:', agendaType);

      // Precarrega storage da etapa 7 para que a tela de Data/Horário venha hidratada
      try {
        const storage = getLocalStorage();
        const SLOTS_STORAGE_KEY = 'partners.agenda.slots.map';
        const SELECTED_DATE_STORAGE_KEY = 'partners.agenda.selected.date';
        // Merge do mapa de horários existente com os do agendamento selecionado
        const rawLocal = storage ? storage.getItem(SLOTS_STORAGE_KEY) : null;
        const rawIdb = await idbGet(SLOTS_STORAGE_KEY);
        const raw = rawLocal ?? rawIdb;
        const currentMap: Record<string, { start: string; end: string }[]> = raw ? JSON.parse(raw) : {};
        const newMap = { ...currentMap, [selectedAppointment.date]: selectedAppointment.slots || [] };
        const payload = JSON.stringify(newMap);
        if (storage) storage.setItem(SLOTS_STORAGE_KEY, payload);
        await idbSet(SLOTS_STORAGE_KEY, payload);
        // Persiste também a data selecionada para posicionar o calendário
        if (storage) storage.setItem(SELECTED_DATE_STORAGE_KEY, selectedAppointment.date);
        await idbSet(SELECTED_DATE_STORAGE_KEY, selectedAppointment.date);
        console.log('[EditAppointment] Preloaded date/time:', { date: selectedAppointment.date, slots: selectedAppointment.slots });
      } catch {
        // silencia erros de persistência
      }
    }
    // Fluxo vindo do menu: ativa modo edição
    setIsEditingSchedule(true);
    setNewAppointmentStep(1);
    setNewAppointmentVisible(true);
  };

  const handleCopyLink = async () => {
    const fakeLink = `https://partners.app/reuniao/${selectedAppointment?.id ?? 'novo'}`;
    try {
      // Web: usa clipboard nativo do browser
      if (Platform.OS === 'web' && (navigator as any)?.clipboard?.writeText) {
        await (navigator as any).clipboard.writeText(fakeLink);
        console.log('[CardMenu] Link copiado (web):', fakeLink);
      } else {
        // Nativo: exibe alerta com link para cópia manual
        Alert.alert('Link copiado', fakeLink);
        console.log('[CardMenu] Link disponível (native):', fakeLink);
      }
    } catch {
      // fallback discreto
      console.log('[CardMenu] Falha ao copiar, exibir link:', fakeLink);
      Alert.alert('Link da reunião', fakeLink);
    }
  };

  const requestDeleteAppointment = () => {
    if (!selectedAppointment) return;
    setDeleteModalVisible(true);
  };

  const cancelDeleteAppointment = () => setDeleteModalVisible(false);

  const confirmDeleteAppointment = async () => {
    if (!selectedAppointment) { setDeleteModalVisible(false); return; }
    const next = appointments.filter((a) => a.id !== selectedAppointment.id);
    setAppointments(next);
    await saveAppointments(next);
    setDeleteModalVisible(false);
    setSelectedAppointment(null);
    // Limpa também do storage após excluir
    try {
      const storage = getLocalStorage();
      if (storage) storage.removeItem(SELECTED_APT_STORAGE_KEY);
      await idbRemove(SELECTED_APT_STORAGE_KEY);
    } catch {}
  };

  const dateKey = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const loadAppointments = React.useCallback(async () => {
    try {
      const storage = getLocalStorage();
      const rawLocal = storage ? storage.getItem(APPOINTMENTS_STORAGE_KEY) : null;
      const rawIdb = await idbGet(APPOINTMENTS_STORAGE_KEY);
      const raw = rawLocal ?? rawIdb;
      console.log('[CalendarHomeScreen] loadAppointments raw sources:', { rawLocal, rawIdb });
      if (!raw) return;
      const parsed = JSON.parse(raw) as AppointmentItem[];
      console.log('[CalendarHomeScreen] loadAppointments parsed count:', Array.isArray(parsed) ? parsed.length : 'invalid');
      if (Array.isArray(parsed)) setAppointments(parsed);
    } catch {
      // ignora
    }
  }, []);

  const saveAppointments = React.useCallback(async (items: AppointmentItem[]) => {
    const payload = JSON.stringify(items);
    const storage = getLocalStorage();
    try { if (storage) storage.setItem(APPOINTMENTS_STORAGE_KEY, payload); } catch {}
    try { await idbSet(APPOINTMENTS_STORAGE_KEY, payload); } catch {}
    console.log('[CalendarHomeScreen] saveAppointments persisted count:', items.length);
  }, []);

  const requestLeaveSchedule = () => setLeaveModalVisible(true);
  const confirmLeaveSchedule = async () => {
    // Fechar imediatamente os modais para evitar travamentos/latência
    setLeaveModalVisible(false);
    setNewAppointmentVisible(false);
    setFlowSummaries({});
    setMaxAccessibleStep(1);
    setNewAppointmentStep(1);
    setIsEditingSchedule(false);
    setSelectedAppointment(null);
    // Limpa também do storage
    try {
      const storage = getLocalStorage();
      if (storage) storage.removeItem(SELECTED_APT_STORAGE_KEY);
      await idbRemove(SELECTED_APT_STORAGE_KEY);
    } catch {}

    // Limpeza assíncrona não bloqueante
    try {
      const storage = getLocalStorage();
      if (storage) {
        try { storage.removeItem(FLOW_SUMMARIES_STORAGE_KEY); } catch {}
        try { storage.removeItem(FLOW_PROGRESS_STORAGE_KEY); } catch {}
        try { storage.removeItem(SLOT_MAP_STORAGE_KEY); } catch {}
      }
      Promise.allSettled([
        idbRemove(FLOW_SUMMARIES_STORAGE_KEY),
        idbRemove(FLOW_PROGRESS_STORAGE_KEY),
        idbRemove(SLOT_MAP_STORAGE_KEY),
      ]).catch(() => {});
    } catch {
      // silencia erros de limpeza
    }
  };
  const cancelLeaveSchedule = () => setLeaveModalVisible(false);

  // Resumos do fluxo (FullFlow)
  const [flowSummaries, setFlowSummaries] = React.useState<Partial<Record<number, string>>>({});
  const recomputeMaxAccessible = (summaries: Partial<Record<number, string>>) => {
    const completedSteps = Object.entries(summaries)
      .filter(([k, v]) => !!v && Number(k) >= 1 && Number(k) <= TOTAL_STEPS)
      .map(([k]) => Number(k));
    const maxCompleted = completedSteps.length ? Math.max(...completedSteps) : 0;
    const next = Math.min(TOTAL_STEPS, Math.max(1, (maxCompleted || 0) + 1));
    // Nunca reduzir o passo máximo acessível; manter monotônico
    setMaxAccessibleStep((prev) => Math.max(prev, next));
  };
  const handleUpdateSummary = (step: number, value: string) => {
    setFlowSummaries((prev) => {
      const updated = { ...prev, [step]: value };
      recomputeMaxAccessible(updated);
      return updated;
    });
  };
  const handleSelectFullFlowStep = (step: number) => {
    // Permite navegação direta ao passo via FullFlow
    if (step >= 1 && step <= 7) {
      setNewAppointmentStep(step as 1 | 2 | 3 | 4 | 5 | 6 | 7);
      setMaxAccessibleStep((prev) => Math.max(prev, step));
    }
  };

  // Abrir modal de filtros na aba correspondente
  const openFiltersModal = (tab: 'periods' | 'products' | 'flows' | 'types') => {
    setFiltersModalTab(tab);
    setFiltersModalVisible(true);
  };

  // Recebe as seleções do modal e atualiza os labels visíveis
  const handleApplyFilters = (selection: {
    periodsLabel: string;
    productLabel: string;
    flowLabel: string;
    typeLabel: string;
    startDate?: Date | null;
    endDate?: Date | null;
    quickLabel?: 'none' | 'Hoje' | '15 dias' | 'Este mês';
  }) => {
    setPeriodsLabel(selection.periodsLabel);
    setProductsLabel(selection.productLabel);
    setFlowsLabel(selection.flowLabel);
    setTypesLabel(selection.typeLabel);
    // Atualiza estado detalhado para cálculo do label de Períodos
    setPeriodQuickLabel(selection.quickLabel ?? 'none');
    setPeriodStartDate(selection.startDate ?? null);
    setPeriodEndDate(selection.endDate ?? null);
    setFiltersModalVisible(false);
  };

  // Helpers locais de data para compor o label
  const formatDDMMYY = (d?: Date | null) => {
    if (!d) return '00/00/00';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  // Carregar progresso e resumos persistidos na montagem
  React.useEffect(() => {
    const loadProgress = async () => {
      try {
        const storage = getLocalStorage();
        const rawSummLocal = storage ? storage.getItem(FLOW_SUMMARIES_STORAGE_KEY) : null;
        const rawSummIdb = await idbGet(FLOW_SUMMARIES_STORAGE_KEY);
        const rawSumm = rawSummLocal ?? rawSummIdb;
        if (rawSumm) {
          try {
            const parsed = JSON.parse(rawSumm) as Partial<Record<number, string>>;
            if (parsed && typeof parsed === 'object') {
              setFlowSummaries(parsed);
              recomputeMaxAccessible(parsed);
            }
          } catch {
            // ignora
          }
        }
        const rawProgLocal = storage ? storage.getItem(FLOW_PROGRESS_STORAGE_KEY) : null;
        const rawProgIdb = await idbGet(FLOW_PROGRESS_STORAGE_KEY);
        const rawProg = rawProgLocal ?? rawProgIdb;
        if (rawProg) {
          const n = parseInt(rawProg, 10);
          if (!isNaN(n)) setMaxAccessibleStep(Math.min(TOTAL_STEPS, Math.max(1, n)));
        }
      } catch {
        // ignora
      }
    };
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistir progresso e resumos sempre que mudarem
  React.useEffect(() => {
    const saveProgress = async () => {
      try {
        const storage = getLocalStorage();
        const summariesPayload = JSON.stringify(flowSummaries ?? {});
        if (storage) storage.setItem(FLOW_SUMMARIES_STORAGE_KEY, summariesPayload);
        await idbSet(FLOW_SUMMARIES_STORAGE_KEY, summariesPayload);
        if (storage) storage.setItem(FLOW_PROGRESS_STORAGE_KEY, String(maxAccessibleStep));
        await idbSet(FLOW_PROGRESS_STORAGE_KEY, String(maxAccessibleStep));
      } catch {
        // ignora
      }
    };
    saveProgress();
  }, [flowSummaries, maxAccessibleStep]);

  React.useEffect(() => { loadAppointments(); }, [loadAppointments]);

  // Restaura o selectedAppointment do storage ao ganhar foco (montagem OU volta da navegação)
  useFocusEffect(
    useCallback(() => {
      const restoreSelectedAppointment = async () => {
        try {
          const storage = getLocalStorage();
          const rawLocal = storage ? storage.getItem(SELECTED_APT_STORAGE_KEY) : null;
          const rawIdb = await idbGet(SELECTED_APT_STORAGE_KEY);
          const id = rawLocal ?? rawIdb;
          if (id && typeof id === 'string') {
            // Busca o appointment pelo ID na lista atual
            const apt = appointments.find((a) => a.id === id);
            if (apt) {
              setSelectedAppointment(apt);
            }
          }
        } catch {}
      };
      restoreSelectedAppointment();
    }, [appointments])
  );

  const displayHour = (s?: string) => {
    if (!s) return '';
    const [hh, mm] = String(s).split(':');
    const h = hh ? String(parseInt(hh, 10)).padStart(2, '0') : '00';
    const m = (mm ?? '00').padStart(2, '0');
    return `${h}:${m}`;
  };

  // Ajusta rótulos em caixa alta (HOJE/AMANHÃ/DIAS) para frase (Hoje/Amanhã/Segunda...)
  const sentenceCaseLabel = (s: string) => {
    if (!s) return s;
    // Mantém datas no formato DD/MM/AA como estão
    if (s.includes('/')) return s;
    const lower = s.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const handleSchedule = async (date: Date, slots: SlotPair[], client?: { id: string; photoKey?: string; photoUri?: string | null } | null) => {
    const editing = isEditingSchedule && !!selectedAppointment;
    const id = editing && selectedAppointment ? selectedAppointment.id : `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item: AppointmentItem = {
      id,
      date: dateKey(date),
      slots: Array.isArray(slots) ? slots : [],
      // Usa resumos do fluxo (já hidratados ao entrar em edição) com fallback ao agendamento atual
      client: (flowSummaries?.[1] ?? selectedAppointment?.client ?? null),
      product: (flowSummaries?.[2] ?? selectedAppointment?.product ?? null),
      activity: (flowSummaries?.[4] ?? selectedAppointment?.activity ?? null),
      agendaType: ((selectedAgendaType as 'personal' | 'shared' | null) ?? selectedAppointment?.agendaType ?? null),
      flowType: ((selectedFlowType as 'guided' | 'free' | null) ?? selectedAppointment?.flowType ?? null),
      professional: (flowSummaries?.[6] ?? selectedAppointment?.professional ?? null),
      clientPhotoKey: (client?.photoKey ?? selectedAppointment?.clientPhotoKey ?? null),
      clientPhotoUri: (client?.photoUri ?? selectedAppointment?.clientPhotoUri ?? null),
    };
    const next = editing ? appointments.map((a) => (a.id === id ? item : a)) : [item, ...appointments];
    console.log('[handleSchedule] mode:', editing ? 'edit' : 'create', { id, date: item.date, slotsCount: item.slots.length });
    setAppointments(next);
    await saveAppointments(next);
    try {
      const storage = getLocalStorage();
      if (storage) {
        storage.removeItem(FLOW_SUMMARIES_STORAGE_KEY);
        storage.removeItem(FLOW_PROGRESS_STORAGE_KEY);
        storage.removeItem(SLOT_MAP_STORAGE_KEY);
      }
      await idbRemove(FLOW_SUMMARIES_STORAGE_KEY);
      await idbRemove(FLOW_PROGRESS_STORAGE_KEY);
      await idbRemove(SLOT_MAP_STORAGE_KEY);
    } catch {}
    setFlowSummaries({});
    setMaxAccessibleStep(1);
    setNewAppointmentStep(1);
    setNewAppointmentVisible(false);
    setIsEditingSchedule(false);
    setSelectedAppointment(null);
    // Limpa também do storage após criar/editar
    try {
      const storage = getLocalStorage();
      if (storage) storage.removeItem(SELECTED_APT_STORAGE_KEY);
      await idbRemove(SELECTED_APT_STORAGE_KEY);
    } catch {}
  };
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(d.getDate() + n); return r; };
  const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const lastOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isTomorrow = (d: Date, today: Date) => {
    const t = startOfDay(today);
    const next = addDays(t, 1);
    return isSameDay(startOfDay(d), next);
  };
  const weekStartSunday = (d: Date) => { const r = new Date(d); r.setDate(d.getDate() - d.getDay()); return startOfDay(r); };

  // A função é importada de ../../utils/dateLabel para manter modularidade e testabilidade.
  const isSameWeek = (a: Date, b: Date) => {
    const ws = weekStartSunday(b);
    const we = addDays(ws, 6);
    const ad = startOfDay(a);
    return ad >= ws && ad <= we;
  };
  const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  // Resolve a imagem do cliente a partir da chave ou URI
  const resolveClientPhotoSource = (apt: AppointmentItem) => {
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

  // Computa o label visível do card "Períodos" conforme regras fornecidas
  const periodsDisplayLabel = React.useMemo(() => {
    const today = new Date();

    // Deriva datas a partir dos atalhos rápidos quando necessário
    let s: Date | null = periodStartDate;
    let e: Date | null = periodEndDate;
    if (periodQuickLabel === 'Hoje') {
      const t = startOfDay(today);
      s = t; e = t;
    } else if (periodQuickLabel === '15 dias') {
      s = startOfDay(today);
      e = startOfDay(addDays(today, 14));
    } else if (periodQuickLabel === 'Este mês') {
      s = startOfDay(firstOfMonth(today));
      e = startOfDay(lastOfMonth(today));
    }

    // Caso nenhum período selecionado
    if (!s && !e) return 'Todos';

    // Se apenas uma das datas existe, tratar como data única
    const single = (s && !e) ? s : (!s && e) ? e : (s && e && isSameDay(s, e)) ? s : null;
    if (single) {
      const d = single;
      const inSameWeek = isSameWeek(d, today);
      const dayName = weekdayNames[d.getDay()];
      if (isSameDay(d, today)) return `Hoje - ${formatDDMMYY(d)}`;
      if (inSameWeek && isTomorrow(d, today)) return `Amanhã - ${formatDDMMYY(d)}`;
      if (inSameWeek) return `${dayName} - ${formatDDMMYY(d)}`;
      return `${formatDDMMYY(d)} (${dayName})`;
    }

    // Intervalo com início e fim
    if (s && e) {
      // Garantir consistência de ordem
      const start = s.getTime() <= e.getTime() ? s : e;
      const end = e.getTime() >= s.getTime() ? e : s;
      return `${formatDDMMYY(start)} - ${formatDDMMYY(end)}`;
    }

    return 'Todos';
  }, [periodQuickLabel, periodStartDate, periodEndDate]);

  // Filtro combinado de agendamentos - aplica todos os filtros selecionados simultaneamente
  const filteredAppointments = React.useMemo(() => {
    let result = [...appointments];
    const today = startOfDay(new Date());

    // 0. Filtro por dia selecionado no calendário (tem prioridade sobre filtro de período)
    // Calendário de 7 dias ativo
    if (showWeekCalendar && !showMonthCalendar) {
      // Calcular a data selecionada no calendário de 7 dias
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const selectedDate = new Date(startOfWeek);
      selectedDate.setDate(startOfWeek.getDate() + selectedWeekDayIndex);
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      const selectedDateKey = `${yyyy}-${mm}-${dd}`;

      result = result.filter((apt) => apt.date === selectedDateKey);
    }
    // Calendário de 30 dias ativo e dia selecionado
    else if (showMonthCalendar && selectedMonthDateKey) {
      result = result.filter((apt) => apt.date === selectedMonthDateKey);
    }
    // Modo padrão - aplicar filtros normais
    else {
      // 1. Filtro de Período
      let filterStartDate: Date | null = null;
      let filterEndDate: Date | null = null;

      if (periodQuickLabel === 'Hoje') {
        filterStartDate = today;
        filterEndDate = today;
      } else if (periodQuickLabel === '15 dias') {
        filterStartDate = today;
        filterEndDate = addDays(today, 14);
      } else if (periodQuickLabel === 'Este mês') {
        filterStartDate = firstOfMonth(today);
        filterEndDate = lastOfMonth(today);
      } else if (periodStartDate || periodEndDate) {
        filterStartDate = periodStartDate ? startOfDay(periodStartDate) : null;
        filterEndDate = periodEndDate ? startOfDay(periodEndDate) : null;
      }

      // Aplicar filtro de período se houver datas definidas
      if (filterStartDate || filterEndDate) {
        result = result.filter((apt) => {
          const aptDate = startOfDay(new Date(`${apt.date}T00:00:00`));
          if (filterStartDate && filterEndDate) {
            // Intervalo completo
            const start = filterStartDate.getTime() <= filterEndDate.getTime() ? filterStartDate : filterEndDate;
            const end = filterEndDate.getTime() >= filterStartDate.getTime() ? filterEndDate : filterStartDate;
            return aptDate >= start && aptDate <= end;
          } else if (filterStartDate) {
            return aptDate >= filterStartDate;
          } else if (filterEndDate) {
            return aptDate <= filterEndDate;
          }
          return true;
        });
      }
    }

    // 2. Filtro de Produto (aplicado sempre)
    if (productsLabel && productsLabel !== 'Todos') {
      result = result.filter((apt) => {
        if (!apt.product) return false;
        return apt.product.toLowerCase().includes(productsLabel.toLowerCase());
      });
    }

    // 3. Filtro de Tipo de Fluxo (aplicado sempre)
    if (flowsLabel && flowsLabel !== 'Todos') {
      result = result.filter((apt) => {
        if (!apt.flowType) return false;
        // Mapear label para valor interno
        const flowMap: Record<string, string> = {
          'Guiado': 'guided',
          'Livre': 'free',
        };
        const expectedFlow = flowMap[flowsLabel] || flowsLabel.toLowerCase();
        return apt.flowType === expectedFlow;
      });
    }

    // 4. Filtro de Tipo de Agenda (aplicado sempre)
    if (typesLabel && typesLabel !== 'Todos') {
      result = result.filter((apt) => {
        if (!apt.agendaType) return false;
        // Mapear label para valor interno
        const typeMap: Record<string, string> = {
          'Pessoal': 'personal',
          'Compartilhada': 'shared',
        };
        const expectedType = typeMap[typesLabel] || typesLabel.toLowerCase();
        return apt.agendaType === expectedType;
      });
    }

    return result;
  }, [appointments, periodQuickLabel, periodStartDate, periodEndDate, productsLabel, flowsLabel, typesLabel, showWeekCalendar, showMonthCalendar, selectedWeekDayIndex, selectedMonthDateKey]);

  // Navegação do calendário mensal
  const goToPrevMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonthDate(d);
  };

  const goToNextMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonthDate(d);
  };

  // Gerar mapa de contagem de agendamentos por data (formato YYYY-MM-DD)
  const appointmentCountByDate = React.useMemo(() => {
    const countMap: Record<string, number> = {};
    appointments.forEach((apt) => {
      if (apt.date) {
        countMap[apt.date] = (countMap[apt.date] || 0) + 1;
      }
    });
    return countMap;
  }, [appointments]);

  // Calcular dias com agendamentos para o mês atual (calendário de 30 dias)
  React.useEffect(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysWithAppointments: number[] = [];

    // Verificar cada dia do mês se tem agendamento
    appointments.forEach((apt) => {
      if (apt.date) {
        const [aptYear, aptMonth, aptDay] = apt.date.split('-').map(Number);
        // aptMonth vem como 1-12, month é 0-11
        if (aptYear === year && aptMonth === month + 1) {
          if (!daysWithAppointments.includes(aptDay)) {
            daysWithAppointments.push(aptDay);
          }
        }
      }
    });

    setAppointmentDays(daysWithAppointments.sort((a, b) => a - b));
  }, [currentMonthDate, appointments]);

  // Render do calendário semanal (Figma 03), abaixo dos filtros
  const renderWeekCalendar = () => {
    if (!showWeekCalendar || showMonthCalendar) return null;
    const today = new Date();
    const startOfWeek = new Date(today);
    // semana iniciando no domingo
    startOfWeek.setDate(today.getDate() - today.getDay());
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const days = new Array(7).fill(0).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      // Calcular chave da data no formato YYYY-MM-DD
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;
      // Obter contagem real de agendamentos para este dia
      const count = appointmentCountByDate[dateKey] || 0;
      return { name: dayNames[i], number: d.getDate(), count, isToday, dateKey };
    });

    return (
        <View style={styles.weekCalendarContainer}>
        <View style={styles.weekCalendarDaysRow}>
          {days.map((d, idx) => (
            <View key={`name-${idx}`} style={styles.weekCalendarDayNameCell}>
              <Text style={[styles.weekCalendarDayName, d.isToday ? styles.weekCalendarDayNameActive : null]}>
                {d.name}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.weekCalendarNumbersRow}>
          {days.map((d, idx) => {
            const isSelected = selectedWeekDayIndex === idx;
            return (
              <View key={`col-${idx}`} style={styles.weekCalendarColumn}>
                <TouchableOpacity
                  onPress={() => setSelectedWeekDayIndex(idx)}
                  style={[styles.weekCalendarTopCell, isSelected ? styles.weekCalendarTopCellActive : null]}
                >
                  <Text style={[styles.weekCalendarTopText, isSelected ? styles.weekCalendarTopTextActive : null]}>{d.number}</Text>
                </TouchableOpacity>
                <View style={styles.weekCalendarBottomCell}>
                  <Text style={styles.weekCalendarBottomText}>{String(d.count).padStart(2, '0')}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Render do calendário mensal (Figma 02), abaixo do Header e acima do conteúdo
  const renderMonthCalendar = () => {
    if (!showMonthCalendar) return null;

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay(); // 0..6 (Dom..Sáb)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Calcular largura da coluna com base no container medido
    const gap = 6;
    const horizontalPadding = 12; // styles.monthCalendarContainer.paddingHorizontal
    const innerWidth = monthContainerWidth - horizontalPadding * 2;
    const columnWidth = Math.floor((innerWidth - gap * 6) / 7);

    // Gerar células e semanas (linhas)
    const cells: { label: number; inMonth: boolean; date: Date; isToday: boolean }[] = [];
    const today = new Date();

    // Dias do mês anterior para preencher o início
    for (let i = 0; i < startWeekday; i++) {
      const num = daysInPrevMonth - startWeekday + 1 + i;
      const d = new Date(year, month - 1, num);
      const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      cells.push({ label: num, inMonth: false, date: d, isToday });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      cells.push({ label: i, inMonth: true, date: d, isToday });
    }

    // Preenche o resto com dias do próximo mês
    let nextDay = 1;
    // Completar até múltiplo de 7
    while (cells.length % 7 !== 0) {
      const d = new Date(year, month + 1, nextDay);
      const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      cells.push({ label: nextDay, inMonth: false, date: d, isToday });
      nextDay++;
    }

    // Agrupar em semanas
    const weeks: { label: number; inMonth: boolean; date: Date; isToday: boolean }[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    // Remover semanas que não possuem nenhum dia do mês atual
    const visibleWeeks = weeks.filter((w) => w.some((c) => c.inMonth));

    const dateKey = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    return (
      <View style={styles.monthCalendarContainer} onLayout={(e) => setMonthContainerWidth(e?.nativeEvent?.layout?.width ?? monthContainerWidth)}>
        {/* Cabeçalho: setas e mês/ano */}
        <View style={styles.monthCalendarHeader}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.monthArrowButton}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M15 18L9 12L15 6" stroke="#7D8592" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <View style={styles.monthHeaderCenter}>
            <Text style={styles.monthHeaderText}>{`${monthNames[month]} - ${year}`}</Text>
          </View>
          <TouchableOpacity onPress={goToNextMonth} style={styles.monthArrowButton}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M9 18L15 12L9 6" stroke="#7D8592" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Dias da semana */}
        <View style={styles.monthDayNamesRow}>
          {dayNames.map((name, idx) => (
            <View key={name} style={[styles.monthDayNameCell, { width: columnWidth }] }>
              <Text style={styles.monthDayName}>{name}</Text>
            </View>
          ))}
        </View>

        {/* Grade de dias */}
        <View style={styles.monthGrid}>
          {visibleWeeks.map((week, wi) => (
            <View key={`w-${wi}`} style={styles.monthWeekRow}>
              {week.map((cell, di) => {
                const cellStyle: ViewStyle[] = [styles.monthDayCell, { width: columnWidth }];
                const textStyle: TextStyle[] = [styles.monthDayText];
                if (!cell.inMonth) {
                  textStyle.push(styles.monthDayTextOut);
                }
                const isSelected = selectedMonthDateKey === dateKey(cell.date);
                if (isSelected) {
                  cellStyle.push(styles.monthDaySelected);
                  textStyle.push(styles.monthDayTextSelected);
                }
                const showUnderline = cell.inMonth && appointmentDays.includes(cell.label);
                return (
                  <TouchableOpacity
                    key={`d-${wi}-${di}`}
                    style={cellStyle}
                    activeOpacity={0.8}
                    onPress={() => setSelectedMonthDateKey(dateKey(cell.date))}
                  >
                    {/* Bolinha azul no dia atual, canto superior direito */}
                    {cell.isToday && (
                      <Svg width={8} height={8} viewBox="0 0 8 8" fill="none" style={styles.monthTodayDot}>
                        <Rect width={8} height={8} rx={4} fill="#1777CF" />
                      </Svg>
                    )}
                    <Text style={textStyle}>{String(cell.label).padStart(2, '0')}</Text>
                    {showUnderline && (
                      <View style={[styles.monthUnderline, isSelected && styles.monthUnderlineSelected]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCalendarIcon = () => (
    <Svg width="26" height="27" viewBox="0 0 26 27" fill="none">
      <Path d="M24.2848 2.80841C24.2848 2.5376 24.013 2.26673 23.7413 2.26673H18.5782V0.641781C18.5782 0.316781 18.3608 0.100098 18.0347 0.100098C17.7087 0.100098 17.4913 0.316781 17.4913 0.641781V6.6001C17.4913 6.9251 17.7087 7.14178 18.0347 7.14178C18.3608 7.14178 18.5782 6.9251 18.5782 6.6001V5.08341C19.2304 5.3001 19.6652 5.89591 19.6652 6.6001C19.6652 7.52097 18.9587 8.22515 18.0347 8.22515C17.1109 8.22515 16.4043 7.52097 16.4043 6.6001C16.4043 6.22091 16.5673 5.84178 16.7847 5.51673C17.0021 5.30005 16.9478 4.97505 16.7304 4.75841C16.513 4.54173 16.1869 4.59591 15.9695 4.81255C15.5348 5.3001 15.3174 5.95005 15.3174 6.60005C15.3174 8.11673 16.513 9.30836 18.0347 9.30836C19.5565 9.30836 20.7521 8.11673 20.7521 6.60005C20.7521 5.30005 19.8282 4.21668 18.5782 3.94586V3.3501H23.1978L23.4695 9.8501H1.73041L2.00213 3.3501H5.53477C5.86086 3.3501 6.07827 3.13341 6.07827 2.80841C6.07827 2.48341 5.86091 2.26673 5.53477 2.26673H1.45869C1.18697 2.26673 0.915192 2.48341 0.915192 2.80841L0.0999756 23.1209C0.0999756 24.746 1.45869 26.1001 3.08912 26.1001H22.1108C22.926 26.1001 23.6326 25.7751 24.2304 25.2334C24.7739 24.6917 25.1 23.9334 25.1 23.1209L24.2848 2.80841ZM23.4695 24.4751C23.0891 24.8543 22.6543 25.0168 22.1108 25.0168H3.08912C2.05655 25.0168 1.18697 24.1501 1.18697 23.121L1.67615 10.9335H23.5239L24.013 23.121C24.013 23.6085 23.7956 24.096 23.4695 24.4751Z" fill="#3A3F51"/>
      <Path d="M7.16521 7.14178C7.49129 7.14178 7.7087 6.92515 7.7087 6.6001V5.08341C8.36082 5.3001 8.79569 5.89591 8.79569 6.6001C8.79569 7.52097 8.08915 8.22515 7.16521 8.22515C6.24126 8.22515 5.53472 7.52091 5.53472 6.6001C5.53472 6.22091 5.69776 5.84178 5.91517 5.51673C6.13258 5.30005 6.07822 4.97505 5.86086 4.75841C5.64345 4.54173 5.31736 4.59591 5.10001 4.81255C4.66524 5.3001 4.44783 5.95005 4.44783 6.60005C4.44783 8.11673 5.64345 9.30836 7.16521 9.30836C8.68696 9.30836 9.88258 8.11673 9.88258 6.60005C9.88258 5.30005 8.95868 4.21668 7.7087 3.94586V3.3501H16.4044C16.7304 3.3501 16.9479 3.13341 16.9479 2.80841C16.9479 2.48341 16.7304 2.26673 16.4044 2.26673H7.7087V0.641781C7.7087 0.316781 7.49129 0.100098 7.16521 0.100098C6.83912 0.100098 6.62171 0.316781 6.62171 0.641781V6.6001C6.62171 6.9251 6.83907 7.14178 7.16521 7.14178ZM15.3174 13.6417H9.88258C9.55649 13.6417 9.33908 13.8584 9.33908 14.1834C9.33908 14.5084 9.55644 14.7251 9.88258 14.7251H14.3391L9.99121 21.496C9.82816 21.7668 9.88248 22.0918 10.1542 22.2543C10.263 22.3084 10.3716 22.3626 10.426 22.3626C10.589 22.3626 10.8064 22.2543 10.8607 22.0918L15.752 14.5085C15.8608 14.346 15.8608 14.1293 15.752 13.9668C15.6978 13.7501 15.5348 13.6417 15.3174 13.6417Z" fill="#3A3F51"/>
      <Path d="M24.2848 2.80841C24.2848 2.5376 24.013 2.26673 23.7413 2.26673H18.5782V0.641781C18.5782 0.316781 18.3608 0.100098 18.0347 0.100098C17.7087 0.100098 17.4913 0.316781 17.4913 0.641781V6.6001C17.4913 6.9251 17.7087 7.14178 18.0347 7.14178C18.3608 7.14178 18.5782 6.9251 18.5782 6.6001V5.08341C19.2304 5.3001 19.6652 5.89591 19.6652 6.6001C19.6652 7.52097 18.9587 8.22515 18.0347 8.22515C17.1109 8.22515 16.4043 7.52097 16.4043 6.6001C16.4043 6.22091 16.5673 5.84178 16.7847 5.51673C17.0021 5.30005 16.9478 4.97505 16.7304 4.75841C16.513 4.54173 16.1869 4.59591 15.9695 4.81255C15.5348 5.3001 15.3174 5.95005 15.3174 6.60005C15.3174 8.11673 16.513 9.30836 18.0347 9.30836C19.5565 9.30836 20.7521 8.11673 20.7521 6.60005C20.7521 5.30005 19.8282 4.21668 18.5782 3.94586V3.3501H23.1978L23.4695 9.8501H1.73041L2.00213 3.3501H5.53477C5.86086 3.3501 6.07827 3.13341 6.07827 2.80841C6.07827 2.48341 5.86091 2.26673 5.53477 2.26673H1.45869C1.18697 2.26673 0.915192 2.48341 0.915192 2.80841L0.0999756 23.1209C0.0999756 24.746 1.45869 26.1001 3.08912 26.1001H22.1108C22.926 26.1001 23.6326 25.7751 24.2304 25.2334C24.7739 24.6917 25.1 23.9334 25.1 23.1209L24.2848 2.80841ZM23.4695 24.4751C23.0891 24.8543 22.6543 25.0168 22.1108 25.0168H3.08912C2.05655 25.0168 1.18697 24.1501 1.18697 23.121L1.67615 10.9335H23.5239L24.013 23.121C24.013 23.6085 23.7956 24.096 23.4695 24.4751Z" stroke="#3A3F51" stroke-width="0.2"/>
      <Path d="M7.16521 7.14178C7.49129 7.14178 7.7087 6.92515 7.7087 6.6001V5.08341C8.36082 5.3001 8.79569 5.89591 8.79569 6.6001C8.79569 7.52097 8.08915 8.22515 7.16521 8.22515C6.24126 8.22515 5.53472 7.52091 5.53472 6.6001C5.53472 6.22091 5.69776 5.84178 5.91517 5.51673C6.13258 5.30005 6.07822 4.97505 5.86086 4.75841C5.64345 4.54173 5.31736 4.59591 5.10001 4.81255C4.66524 5.3001 4.44783 5.95005 4.44783 6.60005C4.44783 8.11673 5.64345 9.30836 7.16521 9.30836C8.68696 9.30836 9.88258 8.11673 9.88258 6.60005C9.88258 5.30005 8.95868 4.21668 7.7087 3.94586V3.3501H16.4044C16.7304 3.3501 16.9479 3.13341 16.9479 2.80841C16.9479 2.48341 16.7304 2.26673 16.4044 2.26673H7.7087V0.641781C7.7087 0.316781 7.49129 0.100098 7.16521 0.100098C6.83912 0.100098 6.62171 0.316781 6.62171 0.641781V6.6001C6.62171 6.9251 6.83907 7.14178 7.16521 7.14178ZM15.3174 13.6417H9.88258C9.55649 13.6417 9.33908 13.8584 9.33908 14.1834C9.33908 14.5084 9.55644 14.7251 9.88258 14.7251H14.3391L9.99121 21.496C9.82816 21.7668 9.88248 22.0918 10.1542 22.2543C10.263 22.3084 10.3716 22.3626 10.426 22.3626C10.589 22.3626 10.8064 22.2543 10.8607 22.0918L15.752 14.5085C15.8608 14.346 15.8608 14.1293 15.752 13.9668C15.6978 13.7501 15.5348 13.6417 15.3174 13.6417Z" stroke="#3A3F51" stroke-width="0.2"/>
    </Svg>
  );

  const renderNewScheduleIcon = () => (
    <Svg width="18" height="16" viewBox="0 0 18 16" fill="none">
      <Path d="M0.52656 12.8H14.3084C14.432 12.8 14.5515 12.7562 14.6463 12.6765C14.7786 12.5644 17.7982 9.9374 17.9824 4.26666H3.18091C2.99749 9.41417 0.216574 11.8336 0.187674 11.8578C0.0182484 12.0026 -0.0440864 12.239 0.0321357 12.4495C0.107831 12.6594 0.305101 12.8 0.52656 12.8Z" fill="#FCFCFC"/>
      <Path d="M17.4726 1.06666H14.8358V0.533332C14.8358 0.234666 14.6037 0 14.3084 0C14.0131 0 13.781 0.234666 13.781 0.533332V1.06666H11.109V0.533332C11.109 0.234666 10.877 0 10.5817 0C10.2863 0 10.0543 0.234666 10.0543 0.533332V1.06666H7.41746V0.533332C7.41746 0.234666 7.18542 0 6.89009 0C6.59477 0 6.36272 0.234666 6.36272 0.533332V1.06666H3.72589C3.43056 1.06666 3.19852 1.30133 3.19852 1.6V3.19999H18V1.6C18 1.30133 17.7679 1.06666 17.4726 1.06666Z" fill="#FCFCFC"/>
      <Path d="M15.3235 13.4943C15.0371 13.7354 14.6777 13.8667 14.3084 13.8667H3.19855V15.4667C3.19855 15.7615 3.43443 16 3.72592 16H17.4726C17.7641 16 18 15.7615 18 15.4667V9.48816C16.9832 12.0109 15.5644 13.2904 15.3235 13.4943Z" fill="#FCFCFC"/>
    </Svg>
  );

  // Ícone do botão "Alternar telas" (adaptado do SVG fornecido)
  const renderToggleIcon = (active?: boolean) => (
    <Svg width="37" height="32" viewBox="0 0 37 32" fill="none">
      <Rect x="0.25" y="0.25" width="36.5" height="31.5" rx="5.75" fill={active ? '#1777CF' : '#F4F4F4'} />
      <Rect x="0.25" y="0.25" width="36.5" height="31.5" rx="5.75" stroke={active ? '#1777CF' : '#D8E0F0'} strokeWidth="0.5" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.7332 16.2563C13.8951 16.0932 14.1111 16.0042 14.3346 16.0084C14.558 16.0127 14.7709 16.1098 14.9271 16.2789C15.0834 16.4479 15.1704 16.6753 15.1693 16.9117C15.1683 17.1481 15.0792 17.3746 14.9215 17.5421L12.9351 19.5967H26.15C26.3754 19.5967 26.5916 19.6914 26.751 19.86C26.9104 20.0287 27 20.2574 27 20.4959C27 20.7343 26.9104 20.963 26.751 21.1317C26.5916 21.3003 26.3754 21.395 26.15 21.395H12.9351L14.9215 23.4496C15.003 23.5317 15.0683 23.6302 15.1136 23.7392C15.1589 23.8482 15.1832 23.9657 15.1852 24.0847C15.1872 24.2038 15.1669 24.3221 15.1253 24.4328C15.0838 24.5434 15.0219 24.6443 14.9432 24.7294C14.8645 24.8146 14.7706 24.8823 14.6669 24.9288C14.5633 24.9752 14.4519 24.9994 14.3394 25C14.2268 25.0006 14.1153 24.9775 14.0112 24.932C13.9071 24.8866 13.8126 24.8198 13.7332 24.7354L10.2559 21.1388C10.1749 21.055 10.1106 20.955 10.0666 20.8446C10.0227 20.7342 10.0001 20.6156 10.0001 20.4959C10.0001 20.3761 10.0227 20.2575 10.0666 20.1471C10.1106 20.0367 10.1749 19.9367 10.2559 19.8529L13.7332 16.2563ZM23.2668 7.26456C23.1874 7.1802 23.0929 7.11337 22.9888 7.06796C22.8847 7.02254 22.7732 6.99945 22.6606 7.00001C22.5481 7.00057 22.4367 7.02478 22.3331 7.07123C22.2294 7.11768 22.1355 7.18545 22.0568 7.2706C21.9781 7.35574 21.9162 7.45658 21.8747 7.56725C21.8331 7.67792 21.8128 7.79621 21.8148 7.91527C21.8168 8.03433 21.8411 8.15178 21.8864 8.26081C21.9317 8.36983 21.997 8.46826 22.0785 8.55037L24.065 10.605H10.85C10.6246 10.605 10.4084 10.6997 10.249 10.8683C10.0896 11.037 10 11.2657 10 11.5041C10 11.7426 10.0896 11.9713 10.249 12.14C10.4084 12.3086 10.6246 12.4033 10.85 12.4033H24.065L22.0785 14.4579C21.997 14.54 21.9317 14.6385 21.8864 14.7475C21.8411 14.8565 21.8168 14.974 21.8148 15.093C21.8128 15.2121 21.8331 15.3304 21.8747 15.441C21.9162 15.5517 21.9781 15.6525 22.0568 15.7377C22.1355 15.8228 22.2294 15.8906 22.3331 15.9371C22.4367 15.9835 22.5481 16.0077 22.6606 16.0083C22.7732 16.0088 22.8847 15.9857 22.9888 15.9403C23.0929 15.8949 23.1874 15.8281 23.2668 15.7437L26.7442 12.1471C26.8251 12.0633 26.8894 11.9633 26.9334 11.8529C26.9773 11.7425 26.9999 11.6239 26.9999 11.5041C26.9999 11.3844 26.9773 11.2658 26.9334 11.1554C26.8894 11.045 26.8251 10.945 26.7442 10.8612L23.2668 7.26456Z"
        fill={active ? '#FCFCFC' : '#7D8592'}
      />
    </Svg>
  );

  const renderProductIcon = () => (
    <Svg width="18" height="15" viewBox="0 0 18 15" fill="none">
      <Path d="M15.951 2.25814H14.4349H12.9902H12.0282V1.24316C12.0282 0.613867 11.5149 0.0996094 10.8792 0.0996094H6.31733C5.68506 0.0996094 5.16836 0.610484 5.16836 1.24316V2.25814H4.20635H2.76164H1.24895C0.613273 2.25814 0.0999756 2.76901 0.0999756 3.3983V12.9561C0.0999756 13.5854 0.613273 14.0996 1.24895 14.0996H2.76504H4.20975H12.9902H14.4349H15.951C16.5833 14.0996 17.1 13.5887 17.1 12.9561V3.3983C17.0966 2.76901 16.5833 2.25814 15.951 2.25814ZM5.51169 2.9348H11.6883H12.6503V13.423H4.54629V2.9348H5.51169ZM5.85163 1.24316C5.85163 0.986028 6.06238 0.776265 6.32073 0.776265H10.8826C11.141 0.776265 11.3517 0.986028 11.3517 1.24316V2.25814H5.85163V1.24316Z" fill="#7D8592"/>
      <Path d="M5.41411 2.9348L1.58688 2.93141C1.25255 2.93141 0.9798 3.2011 0.9798 3.5317V12.9561C0.9798 13.2867 1.25255 13.5564 1.58688 13.552L5.41411 13.5564M5.41411 2.9348H4.9742V13.5564H5.41411M5.41411 2.9348V8.74534V13.5564M16.7814 2.9348H17.2214V13.5564H16.7814M16.7814 2.9348V13.5564M16.7814 2.9348H20.6087C20.943 2.9348 21.2158 3.20449 21.2158 3.53508V12.9561C21.2158 13.2867 20.943 13.5564 20.6087 13.552L16.7814 13.5564M20.6131 2.25814H18.6511H16.7814H15.5365V1.24316C15.5365 0.761286 14.8722 0.100098 14.0496 0.100098H8.14597C7.32773 0.100098 6.65906 0.756936 6.65906 1.24316V2.25814H5.41411H3.54449H1.58688C0.764243 2.25814 0.0999756 2.76901 0.0999756 3.3983V12.9561C0.0999756 13.5854 0.764243 14.0996 1.58688 14.0996H3.54889H5.41851H12.9902H14.4349H15.951C16.5833 14.0996 17.1 13.5887 17.1 12.9561V3.3983C17.0966 2.76901 16.5833 2.25814 15.951 2.25814ZM7.10338 3.74534H15.0966H16.3415V17.2301H5.85403V3.74534H7.10338ZM7.54329 1.57037C7.54329 1.23978 7.81603 0.970083 8.15037 0.970083H14.054C14.3883 0.970083 14.6611 1.23978 14.6611 1.57037V2.25814H7.54329V1.57037Z" stroke="#7D8592" stroke-width="0.2"/>
    </Svg>
  );

  const renderPhaseIcon = () => (
    <Svg width="17" height="15" viewBox="0 0 17 15" fill="none">
      <Path d="M15.8834 0.150391H13.5719H7.31721C7.16995 0.150391 7.05055 0.266732 7.05055 0.410223V2.99878H5.51565C5.36838 2.99878 5.24898 3.11512 5.24898 3.25861V5.41669H3.71396C3.56669 5.41669 3.44729 5.53303 3.44729 5.67653V8.36442H2.32034C2.17307 8.36442 2.05367 8.48076 2.05367 8.62426V11.0472H0.416691C0.269425 11.0472 0.150024 11.1636 0.150024 11.3071V13.8906C0.150024 14.034 0.269425 14.1504 0.416691 14.1504H15.8834C16.0306 14.1504 16.15 14.034 16.15 13.8906V0.410223C16.15 0.266732 16.0306 0.150391 15.8834 0.150391ZM13.3052 0.670056V2.99878H11.7702H7.58388V0.670056H13.3052ZM7.31721 3.51844H11.5035V5.41669H9.96865H5.78232V3.51844H7.31721ZM5.51565 5.93636H9.70198V8.36442H8.57489H3.98062V5.93636H5.51565ZM3.71396 8.88409H8.30823V11.0472H6.67138H2.587V8.88409H3.71396ZM0.683358 11.5669H2.32034H6.40471V13.6307H0.683358V11.5669ZM15.6167 13.6307H6.93805V11.5669H8.57489C8.72216 11.5669 8.84156 11.4506 8.84156 11.3071V8.88409H9.96865C10.1159 8.88409 10.2353 8.76775 10.2353 8.62426V5.93636H11.7702C11.9175 5.93636 12.0369 5.82002 12.0369 5.67653V3.51844H13.5719C13.7192 3.51844 13.8386 3.4021 13.8386 3.25861V0.670056H15.6167V13.6307Z" fill="#7D8592" stroke="#7D8592" stroke-width="0.3"/>
    </Svg>
  );

  const renderActivityIcon = () => (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <mask id="path-1-inside-1_325_1717" fill="white">
        <Path d="M3.21065 7.16539C3.47389 6.63952 3.76062 6.13288 4.07084 5.64546C4.38163 5.15804 4.72413 4.68165 5.09832 4.21629L3.79487 3.95081C3.70769 3.92875 3.62334 3.93158 3.54182 3.95929C3.4603 3.98699 3.38671 4.03308 3.32104 4.09754L1.26099 6.15606C1.22816 6.18829 1.21712 6.22618 1.22788 6.26972C1.23863 6.31326 1.26581 6.34606 1.3094 6.36811L3.21065 7.16539ZM12.9369 0.828669C11.6303 0.921968 10.4797 1.20893 9.48505 1.68957C8.49041 2.1702 7.55492 2.84818 6.6786 3.72349C6.05249 4.35001 5.50591 5.00254 5.03888 5.68109C4.57184 6.35963 4.18689 7.03393 3.88403 7.70399L6.28798 10.1001C6.95882 9.79757 7.63644 9.41306 8.32086 8.94657C9.00528 8.48007 9.66139 7.93356 10.2892 7.30704C11.1655 6.43172 11.8443 5.50099 12.3255 4.51484C12.8067 3.5287 13.094 2.38309 13.1874 1.07803C13.1874 1.04354 13.1848 1.01159 13.1797 0.982188C13.1746 0.952785 13.1565 0.922251 13.1254 0.890585C13.0942 0.85892 13.0637 0.840826 13.0337 0.836302C13.0037 0.831778 12.9717 0.828951 12.9377 0.82782M8.39813 5.60814C8.14905 5.35878 8.0245 5.05994 8.0245 4.71162C8.0245 4.3633 8.14905 4.06446 8.39813 3.8151C8.64722 3.56573 8.94725 3.44133 9.29824 3.4419C9.64922 3.44247 9.94897 3.56686 10.1975 3.8151C10.446 4.06333 10.5706 4.36217 10.5711 4.71162C10.5717 5.06107 10.4471 5.35963 10.1975 5.60729C9.94784 5.85496 9.6478 5.97936 9.29739 5.98049C8.94697 5.98162 8.64693 5.85722 8.39728 5.60729M6.82635 10.788L7.6254 12.6921C7.64748 12.7351 7.68003 12.7594 7.72305 12.7651C7.76608 12.7707 7.80429 12.7571 7.83769 12.7243L9.89859 10.6819C9.96369 10.6169 10.0098 10.5434 10.037 10.4614C10.0647 10.38 10.0676 10.296 10.0455 10.2095L9.77971 8.90755C9.3138 9.28188 8.83686 9.62313 8.34888 9.9313C7.8609 10.2395 7.35282 10.525 6.82635 10.788ZM14 0.704834C13.9932 2.11846 13.7249 3.42239 13.195 4.61662C12.6651 5.81086 11.8746 6.93271 10.8233 7.98219C10.769 8.03647 10.7172 8.08538 10.6679 8.12892C10.6187 8.17246 10.5672 8.22137 10.5134 8.27566L10.8726 10.0331C10.9179 10.2615 10.9065 10.4829 10.8386 10.6972C10.7701 10.9109 10.6529 11.1004 10.4871 11.2655L8.12216 13.6277C7.95346 13.7962 7.74768 13.8584 7.50482 13.8142C7.26253 13.7707 7.09553 13.6347 7.00382 13.4063L5.98653 11.0102L2.97713 7.98728L0.578274 6.97116C0.349568 6.88012 0.215119 6.71332 0.174926 6.47074C0.134732 6.22816 0.198985 6.02262 0.367684 5.85411L2.73173 3.49194C2.89703 3.32683 3.08781 3.21289 3.30406 3.15013C3.51974 3.0868 3.74194 3.07803 3.97064 3.12383L5.72924 3.48261C5.78359 3.42833 5.83001 3.37942 5.8685 3.33588C5.90643 3.29234 5.95257 3.24343 6.00691 3.18914C7.0576 2.13967 8.18075 1.34747 9.37636 0.812553C10.572 0.277637 11.8777 0.00678541 13.2935 0C13.3846 0.00339271 13.4732 0.0214872 13.5593 0.0542834C13.6453 0.0870796 13.7254 0.140797 13.7996 0.215437C13.8738 0.290076 13.9247 0.36726 13.9524 0.446989C13.9802 0.526717 13.9955 0.612666 13.9983 0.704834M1.18372 10.4029C1.51602 10.0715 1.91965 9.90755 2.39461 9.91094C2.86957 9.91433 3.27321 10.0823 3.60551 10.4148C3.93781 10.7472 4.10311 11.1504 4.10141 11.6243C4.09972 12.0992 3.93271 12.5024 3.60041 12.8338C3.12828 13.3053 2.57294 13.6022 1.93437 13.7243C1.29581 13.8459 0.651018 13.9378 0 14C0.0622713 13.3384 0.157093 12.6915 0.284467 12.0594C0.41184 11.4272 0.711025 10.875 1.18372 10.4029ZM1.79002 11.0195C1.5381 11.2711 1.36346 11.5666 1.26609 11.9059C1.16872 12.2451 1.09711 12.5968 1.05125 12.961C1.41639 12.9152 1.76879 12.8417 2.10845 12.7405C2.44811 12.6392 2.74362 12.4631 2.99497 12.212C3.1648 12.0424 3.25141 11.8403 3.25481 11.6056C3.25764 11.3704 3.17414 11.1679 3.00431 10.9983C2.83448 10.8287 2.63209 10.7475 2.39716 10.7549C2.16223 10.7617 1.95985 10.8499 1.79002 11.0195Z" fill="white"/>
      </mask>
      <Path d="M3.21065 7.16539C3.47389 6.63952 3.76062 6.13288 4.07084 5.64546C4.38163 5.15804 4.72413 4.68165 5.09832 4.21629L3.79487 3.95081C3.70769 3.92875 3.62334 3.93158 3.54182 3.95929C3.4603 3.98699 3.38671 4.03308 3.32104 4.09754L1.26099 6.15606C1.22816 6.18829 1.21712 6.22618 1.22788 6.26972C1.23863 6.31326 1.26581 6.34606 1.3094 6.36811L3.21065 7.16539ZM12.9369 0.828669C11.6303 0.921968 10.4797 1.20893 9.48505 1.68957C8.49041 2.1702 7.55492 2.84818 6.6786 3.72349C6.05249 4.35001 5.50591 5.00254 5.03888 5.68109C4.57184 6.35963 4.18689 7.03393 3.88403 7.70399L6.28798 10.1001C6.95882 9.79757 7.63644 9.41306 8.32086 8.94657C9.00528 8.48007 9.66139 7.93356 10.2892 7.30704C11.1655 6.43172 11.8443 5.50099 12.3255 4.51484C12.8067 3.5287 13.094 2.38309 13.1874 1.07803C13.1874 1.04354 13.1848 1.01159 13.1797 0.982188C13.1746 0.952785 13.1565 0.922251 13.1254 0.890585C13.0942 0.85892 13.0637 0.840826 13.0337 0.836302C13.0037 0.831778 12.9717 0.828951 12.9377 0.82782M8.39813 5.60814C8.14905 5.35878 8.0245 5.05994 8.0245 4.71162C8.0245 4.3633 8.14905 4.06446 8.39813 3.8151C8.64722 3.56573 8.94725 3.44133 9.29824 3.4419C9.64922 3.44247 9.94897 3.56686 10.1975 3.8151C10.446 4.06333 10.5706 4.36217 10.5711 4.71162C10.5717 5.06107 10.4471 5.35963 10.1975 5.60729C9.94784 5.85496 9.6478 5.97936 9.29739 5.98049C8.94697 5.98162 8.64693 5.85722 8.39728 5.60729M6.82635 10.788L7.6254 12.6921C7.64748 12.7351 7.68003 12.7594 7.72305 12.7651C7.76608 12.7707 7.80429 12.7571 7.83769 12.7243L9.89859 10.6819C9.96369 10.6169 10.0098 10.5434 10.037 10.4614C10.0647 10.38 10.0676 10.296 10.0455 10.2095L9.77971 8.90755C9.3138 9.28188 8.83686 9.62313 8.34888 9.9313C7.8609 10.2395 7.35282 10.525 6.82635 10.788ZM14 0.704834C13.9932 2.11846 13.7249 3.42239 13.195 4.61662C12.6651 5.81086 11.8746 6.93271 10.8233 7.98219C10.769 8.03647 10.7172 8.08538 10.6679 8.12892C10.6187 8.17246 10.5672 8.22137 10.5134 8.27566L10.8726 10.0331C10.9179 10.2615 10.9065 10.4829 10.8386 10.6972C10.7701 10.9109 10.6529 11.1004 10.4871 11.2655L8.12216 13.6277C7.95346 13.7962 7.74768 13.8584 7.50482 13.8142C7.26253 13.7707 7.09553 13.6347 7.00382 13.4063L5.98653 11.0102L2.97713 7.98728L0.578274 6.97116C0.349568 6.88012 0.215119 6.71332 0.174926 6.47074C0.134732 6.22816 0.198985 6.02262 0.367684 5.85411L2.73173 3.49194C2.89703 3.32683 3.08781 3.21289 3.30406 3.15013C3.51974 3.0868 3.74194 3.07803 3.97064 3.12383L5.72924 3.48261C5.78359 3.42833 5.83001 3.37942 5.8685 3.33588C5.90643 3.29234 5.95257 3.24343 6.00691 3.18914C7.0576 2.13967 8.18075 1.34747 9.37636 0.812553C10.572 0.277637 11.8777 0.00678541 13.2935 0C13.3846 0.00339271 13.4732 0.0214872 13.5593 0.0542834C13.6453 0.0870796 13.7254 0.140797 13.7996 0.215437C13.8738 0.290076 13.9247 0.36726 13.9524 0.446989C13.9802 0.526717 13.9955 0.612666 13.9983 0.704834M1.18372 10.4029C1.51602 10.0715 1.91965 9.90755 2.39461 9.91094C2.86957 9.91433 3.27321 10.0823 3.60551 10.4148C3.93781 10.7472 4.10311 11.1504 4.10141 11.6243C4.09972 12.0992 3.93271 12.5024 3.60041 12.8338C3.12828 13.3053 2.57294 13.6022 1.93437 13.7243C1.29581 13.8459 0.651018 13.9378 0 14C0.0622713 13.3384 0.157093 12.6915 0.284467 12.0594C0.41184 11.4272 0.711025 10.875 1.18372 10.4029ZM1.79002 11.0195C1.5381 11.2711 1.36346 11.5666 1.26609 11.9059C1.16872 12.2451 1.09711 12.5968 1.05125 12.961C1.41639 12.9152 1.76879 12.8417 2.10845 12.7405C2.44811 12.6392 2.74362 12.4631 2.99497 12.212C3.1648 12.0424 3.25141 11.8403 3.25481 11.6056C3.25764 11.3704 3.17414 11.1679 3.00431 10.9983C2.83448 10.8287 2.63209 10.7475 2.39716 10.7549C2.16223 10.7617 1.95985 10.8499 1.79002 11.0195Z" fill="#7D8592"/>
    </Svg>
  );

  const renderMoreIcon = () => (
    <Svg width="4" height="18" viewBox="0 0 4 18" fill="none">
      <Path d="M4 2C4 3.10457 3.10457 4 2 4C0.895431 4 0 3.10457 0 2C0 0.895431 0.895431 0 2 0C3.10457 0 4 0.895431 4 2Z" fill="#7D8592"/>
      <Path d="M4 9C4 10.1046 3.10457 11 2 11C0.895431 11 0 10.1046 0 9C0 7.89543 0.895431 7 2 7C3.10457 7 4 7.89543 4 9Z" fill="#7D8592"/>
      <Path d="M2 18C3.10457 18 4 17.1046 4 16C4 14.8954 3.10457 14 2 14C0.895431 14 0 14.8954 0 16C0 17.1046 0.895431 18 2 18Z" fill="#7D8592"/>
    </Svg>
  );

  // Renderização do card de agendamento (reutilizado em web/mobile)
  const renderAppointmentCard = (apt: AppointmentItem) => {
    const d = new Date(`${apt.date}T00:00:00`);
    const firstSlot = apt.slots?.[0]?.start;
    const hasExpert = !!(apt.professional && apt.professional !== 'Nenhum');
    const isSelected = selectedAppointment?.id === apt.id;
    const dateLabel = formatAppointmentDateLabel(d);

    // Monta estilos do card principal de forma explícita
    const cardStyles: ViewStyle[] = [styles.scheduleCardRow];
    // Todos os cards usam a mesma altura (conteúdo interno é idêntico)
    cardStyles.push(styles.scheduleCardRowSmall);
    // Card ativo (COM ou SEM foto): mesma borda azul e fundo azul 3%
    if (isSelected) {
      cardStyles.push(styles.scheduleCardRowSelected);
    }

    // Monta estilos do tile esquerdo de forma explícita
    const tileStyles: ViewStyle[] = [styles.leftTile];
    if (hasExpert) {
      // Card COM foto: tile com fundo azul
      tileStyles.push(styles.leftTileBlue);
    } else if (isSelected) {
      // Card SEM foto E selecionado: tile com borda azul (sem fundo azul)
      tileStyles.push(styles.leftTileSelected);
    }

    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={() => openAppointmentDetails(apt)}
        activeOpacity={0.85}
      >
        {/* Coluna esquerda (HOJE + imagem) */}
        <View style={tileStyles}>
          <View style={hasExpert ? styles.leftTileTopBlue : styles.leftTileTop}>
            <Text style={hasExpert ? styles.leftTileTodayBlue : styles.leftTileToday}>
              {dateLabel.toUpperCase()}
            </Text>
            <Text style={hasExpert ? styles.leftTileHourBlue : styles.leftTileHour}>
              {displayHour(firstSlot)}
            </Text>
          </View>
          <View style={styles.leftTileBottom}>
            <Image
              style={styles.leftTileImage}
              source={resolveClientPhotoSource(apt)}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Conteúdo direita */}
        <View style={styles.rightContent}>
          <View style={styles.rightHeader}>
            <Text style={styles.personName}>{apt.client || 'Novo agendamento'}</Text>
            <TouchableOpacity style={styles.moreIcon} onPress={() => handleOpenAgendaMenu(apt)}>
              {renderMoreIcon()}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Produto:</Text>
          </View>
          <Text style={styles.fieldValue}>{apt.product || '—'}</Text>

          <View style={styles.divider} />
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Atividade: </Text>
          </View>
          <Text style={styles.fieldValue}>{apt.activity || '—'}</Text>

        </View>
      </TouchableOpacity>
    );
  };

  // Cabeçalho da lista (reutilizado em FlatList e ScrollView)
  const renderListHeader = () => (
    <View>
      {renderMonthCalendar()}
      {/* Botão Nova agenda */}
      {!showMonthCalendar && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={handleToggleScreens}
            accessibilityRole="button"
            accessibilityLabel="Alternar telas"
            testID="CalendarHomeScreen_ToggleButton"
            activeOpacity={0.7}
          >
            {renderToggleIcon(alternateView)}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.newScheduleButton, styles.actionButtonMarginFix]} onPress={handleNewSchedule}>
            <View style={styles.newScheduleIcon}>
              {renderNewScheduleIcon()}
            </View>
            <Text style={styles.newScheduleText}>Novo agendamento</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filtros (carrossel horizontal com esticamento condicional) */}
      {!showMonthCalendar && (
        showWeekCalendar ? (
          // Modo 7 dias: 3 filtros com flex distribuído, sem scroll
          <View style={styles.filtersRowWeekMode}>
            <TouchableOpacity
              style={styles.filterCardFlex}
              onPress={() => openFiltersModal('products')}
            >
              <Text style={styles.filterLabel} numberOfLines={1}>Produtos</Text>
              <Text style={styles.filterValue} numberOfLines={1} ellipsizeMode="tail">{productsLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterCardFlex}
              onPress={() => openFiltersModal('flows')}
            >
              <Text style={styles.filterLabel} numberOfLines={1}>Tipos de fluxo</Text>
              <Text style={styles.filterValue} numberOfLines={1} ellipsizeMode="tail">{flowsLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterCardFlex}
              onPress={() => openFiltersModal('types')}
            >
              <Text style={styles.filterLabel} numberOfLines={1}>Tipo de agenda</Text>
              <Text style={styles.filterValue} numberOfLines={1} ellipsizeMode="tail">{typesLabel}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Modo normal: 4 filtros com scroll horizontal
          <View onLayout={(e) => setContainerWidth(e?.nativeEvent?.layout?.width ?? width)}>
            <ScrollView
              horizontal
              style={styles.filtersScroll}
              contentContainerStyle={[
                styles.filtersRow,
                effectiveShouldStretch ? { width: containerWidth } : null,
              ]}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={!effectiveShouldStretch}
              nestedScrollEnabled={true}
            >
              <TouchableOpacity
                style={[
                  styles.filterCard,
                  effectiveShouldStretch ? { width: cardStretchWidth } : null,
                ]}
                onLayout={onFilterLayout(0)}
                onPress={() => openFiltersModal('periods')}
              >
                <Text style={styles.filterLabel} numberOfLines={1}>Períodos</Text>
                <Text style={styles.filterValue} numberOfLines={1} ellipsizeMode="tail">{periodsDisplayLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterCard,
                  effectiveShouldStretch ? { width: cardStretchWidth } : null,
                ]}
                onLayout={onFilterLayout(1)}
                onPress={() => openFiltersModal('products')}
              >
                <Text style={styles.filterLabel} numberOfLines={1}>Produtos</Text>
                <Text style={styles.filterValue} numberOfLines={1} ellipsizeMode="tail">{productsLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterCard,
                  effectiveShouldStretch ? { width: cardStretchWidth } : null,
                ]}
                onLayout={onFilterLayout(2)}
                onPress={() => openFiltersModal('flows')}
              >
                <Text style={styles.filterLabel} numberOfLines={1}>Tipos de fluxo</Text>
                <Text style={styles.filterValue} numberOfLines={1} ellipsizeMode="tail">{flowsLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterCard,
                  effectiveShouldStretch ? { width: cardStretchWidth } : null,
                ]}
                onLayout={onFilterLayout(3)}
                onPress={() => openFiltersModal('types')}
              >
                <Text style={styles.filterLabel} numberOfLines={1}>Tipo de agenda</Text>
                <Text style={styles.filterValue} numberOfLines={1} ellipsizeMode="tail">{typesLabel}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )
      )}

      {renderWeekCalendar()}
    </View>
  );

  // Estado vazio da Agenda (Figma Lista)
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <SvgXml xml={EMPTY_CALENDAR_SVG} width={202} height={150} />
      <View style={styles.emptyTitleWrapper}>
        <Text style={styles.emptyTitle}>Nenhum agendamento{"\n"}encontrado!</Text>
      </View>
      <View style={styles.emptySubtitleWrapper}>
        <Text style={styles.emptySubtitle}>{'Para criar um novo agendamento, toque '}</Text>
        <Text style={styles.emptySubtitle}>{'no bot\u00E3o azul "Novo agendamento"'}</Text>
        <Text style={styles.emptySubtitle}>no topo da tela.</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="Agenda" 
        notificationCount={3} 
        onMenuPress={handleMenuPress}
        showAgendaIcons
        onCalendarWeekPress={() => setShowWeekCalendar((v) => { const next = !v; if (next) setShowMonthCalendar(false); return next; })}
        calendarWeekActive={showWeekCalendar}
        onCalendarMonthPress={() => setShowMonthCalendar((v) => { const next = !v; if (next) setShowWeekCalendar(false); return next; })}
        calendarMonthActive={showMonthCalendar}
      />
      {/* Divisória abaixo do header */}
      <View style={styles.headerDividerWrapper}>
        <View style={styles.headerDivider} />
      </View>
      
      {/* ÁREA FIXA: Botões e Filtros (fora do scroll) */}
      <View style={styles.fixedHeader}>
        {renderListHeader()}
      </View>
      
      {/* ÁREA SCROLLÁVEL: Apenas os cards */}
      <View style={styles.scrollWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* Conteúdo principal - apenas cards */}
          {filteredAppointments.length === 0 ? (
            renderEmptyState()
          ) : alternateView ? (
            <AlternativeScreen
              items={filteredAppointments.map((a) => ({
                id: a.id,
                date: a.date,
                slots: a.slots,
                client: a.client || undefined,
                product: a.product || undefined,
                hasExpert: !!(a.professional && a.professional !== 'Nenhum'),
              }))}
              selectedId={selectedAppointment?.id}
              onSelect={(id) => {
                const apt = appointments.find((x) => x.id === id);
                if (apt) openAppointmentDetails(apt);
              }}
              onOpenMenu={(id) => {
                const apt = appointments.find((x) => x.id === id);
                if (apt) handleOpenAgendaMenu(apt);
              }}
            />
          ) : (
            <>
              {filteredAppointments.map((apt) => (
                <React.Fragment key={apt.id}>
                  {renderAppointmentCard(apt)}
                </React.Fragment>
              ))}
            </>
          )}
          
          {/* Espaçador final para o BottomMenu */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      {/* Modal de Filtros */}
      <ModalFilters
        visible={filtersModalVisible}
        initialTab={filtersModalTab}
        onClose={() => setFiltersModalVisible(false)}
        onApply={(selection) => handleApplyFilters(selection)}
      />

      {/* Novo Agendamento – Modal unificado com Header/Footer fixos e conteúdo embed */}
      <ModalShell
        visible={newAppointmentVisible}
        onClose={requestLeaveSchedule}
        currentStep={newAppointmentStep}
        goToStep={(n) => setNewAppointmentStep(n as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
        setTransitionDirection={setTransitionDirection}
        transitionDirection={transitionDirection}
        summaries={flowSummaries}
        onSelectStep={handleSelectFullFlowStep}
        onUpdateSummary={handleUpdateSummary}
        maxAccessibleStep={Math.max(maxAccessibleStep, newAppointmentStep)}
        selectedFlowType={selectedFlowType}
        onSelectFlowType={(id) => setSelectedFlowType(id)}
        selectedAgendaType={selectedAgendaType as 'personal' | 'shared' | null}
        onSelectAgendaType={(id) => setSelectedAgendaType(id)}
        editing={isEditingSchedule}
        onSchedule={({ date, slots, client }) => handleSchedule(date as Date, slots as SlotPair[], client as { id: string; photoKey?: string; photoUri?: string | null } | null)}
      />

      {/* Modal de confirmação de saída do novo agendamento */}
      <ModalAlertLeaveTheSchedule
        visible={leaveModalVisible}
        onCancel={cancelLeaveSchedule}
        onConfirm={confirmLeaveSchedule}
      />

      {/* Menu de ações do card (Figma 17) */}
      <CardMenu
        visible={agendaMenuVisible}
        onClose={handleCloseAgendaMenu}
        onEdit={handleEditAppointment}
        onCopyLink={handleCopyLink}
        onDelete={requestDeleteAppointment}
      />

      {/* Confirmação de exclusão de agendamento */}
      <ModalAlertDeleteCommitment
        visible={deleteModalVisible}
        start={selectedAppointment?.slots?.[0]?.start ?? ''}
        end={selectedAppointment?.slots?.[0]?.end ?? ''}
        dateLabel={selectedAppointment ? sentenceCaseLabel(formatAppointmentDateLabel(selectedAppointment.date)) : undefined}
        onCancel={cancelDeleteAppointment}
        onConfirm={confirmDeleteAppointment}
      />

      <BottomMenu activeScreen="Schedule" />

      {/* Menu Lateral */}
      <SideMenuScreen
        isVisible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  // ÁREA FIXA: Botões e Filtros (não fazem scroll)
  fixedHeader: {
    paddingHorizontal: 16,
    backgroundColor: '#FCFCFC',
  },
  // WRAPPER DO SCROLL - A CHAVE PARA FUNCIONAR NO WEB
  // Usa position relative para que o filho absolute funcione
  scrollWrapper: {
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
  // SCROLLVIEW - No web usa position absolute para ter altura definida
  scrollView: {
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: Layout.bottomMenuHeight,
        overflowY: 'auto',
        overflowX: 'hidden',
      } as any,
      default: {
        flex: 1,
      },
    }),
  },
  // CONTENT do scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 0,
    // Faz o conteúdo ocupar toda a altura disponível do ScrollView
    flexGrow: 1,
  },
  // Espaçador no final para não ficar atrás do BottomMenu
  bottomSpacer: {
    height: 0,
  },
  // Divisória entre o Header (título + ícones) e a área do botão
  headerDividerWrapper: {
    paddingHorizontal: 16,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#D8E0F0',
    alignSelf: 'stretch',
  },
  // Linha de ações (Alternar telas + Novo agendamento)
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    gap: 10,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    color: '#3A3F51',
    marginRight: 12,
  },
  monthYearContainer: {
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#3A3F51',
  },
  yearText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#7D8592',
    marginTop: 2,
  },
  calendarIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newScheduleButton: {
    flexDirection: 'row',
    backgroundColor: '#1777CF',
    borderRadius: 8,
    height: 35,
    width: 176,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'auto',
  },
  actionButtonMarginFix: {
    marginTop: 0,
    marginBottom: 0,
  },
  toggleButton: {
    width: 37,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newScheduleIcon: {
    marginRight: 8,
  },
  newScheduleText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FCFCFC',
  },
  // Linha de filtros
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  filtersRowFull: {
    // Quando o conteúdo total for menor que a largura do container,
    // o contentContainerStyle cresce para a largura do ScrollView
    flexGrow: 1,
  },
  filtersScroll: {
    marginBottom: 16,
  },
  // Espaçamento reduzido quando calendário de 7 dias está ativo
  filtersScrollCompact: {
    marginBottom: 6,
  },
  // Linha de filtros no modo 7 dias (flex distribuído, sem scroll)
  filtersRowWeekMode: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    marginBottom: 6,
  },
  // Card de filtro com flex para modo 7 dias
  filterCardFlex: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#D8E0F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  filterCard: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#D8E0F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  // Removido filterCardStretch; usamos largura fixa calculada por card quando esticando
  filterLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#7D8592',
    marginBottom: 4,
  },
  filterValue: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#3A3F51',
  },

  // Estado vazio da Agenda
  emptyContainer: {
    backgroundColor: '#FCFCFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    alignSelf: 'stretch',
    // Ocupa 100% da área com respiro de 10px sem provocar scroll
    ...Platform.select({
      web: { height: 'calc(100% - 15px)' } as any,
      default: { flexGrow: 1 },
    }),
  },
  emptyTitleWrapper: {
    marginTop: 6,
    marginBottom: 6,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#3A3F51',
    textAlign: 'center',
  },
  emptySubtitleWrapper: {
    marginTop: 2,
    alignItems: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#7D8592',
    textAlign: 'center',
  },

  // Cards

  scheduleCardRow: {
    flexDirection: 'row',
    backgroundColor: '#FCFCFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    paddingLeft: 4,
    paddingRight: 9,
    paddingTop: 5,
    paddingBottom: 5,
    gap: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  // Variações de altura conforme layout do Figma
  scheduleCardRowSmall: {
    minHeight: 130,
  },
  scheduleCardRowTall: {
    minHeight: 170,
  },
  // Estado selecionado: borda azul e fundo azul 3% de opacidade
  scheduleCardRowSelected: {
    borderColor: '#1777CF',
    backgroundColor: 'rgba(23, 119, 207, 0.03)',
  },
  leftTile: {
    width: 79,
    backgroundColor: '#F4F4F4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  // Estado selecionado do tile esquerdo (para cards sem foto): borda azul
  leftTileSelected: {
    borderColor: '#1777CF',
  },
  leftTileTop: {
    height: 60,
    paddingTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  leftTileToday: {
    color: '#3A3F51',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textDecorationLine: 'underline',
  },
  leftTileHour: {
    color: '#7D8592',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  leftTileBottom: {
    flex: 1,
  },
  leftTileImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  // Variação azul do tile
  leftTileBlue: {
    backgroundColor: '#1777CF',
    borderColor: '#D8E0F0',
  },
  leftTileTopBlue: {
    height: 60,
    paddingTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  leftTileTodayBlue: {
    color: '#FCFCFC',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textDecorationLine: 'underline',
  },
  leftTileHourBlue: {
    color: '#FCFCFC',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  rightContent: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 5,
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  personName: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#3A3F51',
  },
  moreIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#D8E0F0',
    marginVertical: 8,
  },
  // Divisória entre cards da lista
  cardsDivider: {
    height: 1,
    backgroundColor: '#D8E0F0',
    marginVertical: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#7D8592',
  },
  fieldRight: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#7D8592',
  },
  fieldValue: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#7D8592',
  },
  expertLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#7D8592',
  },
  expertValue: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#7D8592',
  },
  // Calendário mensal (Figma 02)
  monthCalendarContainer: {
    // Espaçamento antes dos cards de agendamentos no modo 30 dias
    marginTop: 8,
    marginBottom: 16,
    marginHorizontal: 0,
    backgroundColor: '#FCFCFC',
    borderWidth: 0.8,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: 'stretch',
  },
  monthCalendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthArrowButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderWidth: 0.6,
    borderColor: '#D8E0F0',
  },
  monthHeaderCenter: {
    flex: 1,
    marginHorizontal: 8,
    height: 28,
    borderRadius: 6,
    borderWidth: 0.6,
    borderColor: '#D8E0F0',
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthHeaderText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#3A3F51',
  },
  monthDayNamesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    marginBottom: 6,
  },
  monthDayNameCell: {
    flex: 1,
    alignItems: 'center',
  },
  monthDayName: {
    textAlign: 'center',
    color: '#7D8592',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  monthGrid: {
    gap: 6,
  },
  monthWeekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    marginBottom: 0,
  },
  monthDayCell: {
    width: (width - 32 - 6 * 6) / 7, // largura total menos padding e gaps
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FCFCFC',
    borderWidth: 0.8,
    borderColor: '#D8E0F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  monthDaySelected: {
    backgroundColor: '#1777CF',
    borderColor: '#1777CF',
  },
  monthDayText: {
    color: '#3A3F51',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  monthDayTextOut: {
    color: '#D0D6E0',
    fontFamily: 'Inter_500Medium',
  },
  monthDayTextSelected: {
    color: '#FCFCFC',
  },
  monthUnderline: {
    height: 2,
    backgroundColor: '#1777CF',
    borderRadius: 1,
    marginTop: 3,
    alignSelf: 'center',
    width: '60%',
  },
  monthUnderlineSelected: {
    backgroundColor: '#FCFCFC',
  },
  monthTodayDot: {
    position: 'absolute',
    top: -3,
    right: -3,
  },
  // Calendário semanal (Figma 03)
  weekCalendarContainer: {
    marginTop: 4,
    marginBottom: 10,
    // Usar toda a largura disponível do conteúdo
    marginHorizontal: 0,
  },
  weekCalendarDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekCalendarDayNameCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekCalendarDayName: {
    textAlign: 'center',
    color: '#7D8592',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  weekCalendarDayNameActive: {
    color: '#1777CF',
  },
  weekCalendarNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  weekCalendarColumn: {
    flex: 1,
  },
  weekCalendarTopCell: {
    height: 24,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: '#FCFCFC',
    borderWidth: 0.8,
    borderColor: '#D8E0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekCalendarTopCellActive: {
    backgroundColor: '#1777CF',
    borderColor: '#1777CF',
  },
  weekCalendarTopText: {
    color: '#3A3F51',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  weekCalendarTopTextActive: {
    color: '#FCFCFC',
  },
  weekCalendarBottomCell: {
    height: 24,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: '#FCFCFC',
    borderLeftWidth: 0.8,
    borderRightWidth: 0.8,
    borderBottomWidth: 0.8,
    borderColor: '#D8E0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekCalendarBottomText: {
    color: '#7D8592',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  // Remover padding lateral do container dos cards para alinhar com o Header
  scheduleCards: {
    marginHorizontal: 0,
    paddingTop: 10,
    // Espaço vertical entre cards
    gap: 10,
  },
});

export default CalendarHomeScreen;