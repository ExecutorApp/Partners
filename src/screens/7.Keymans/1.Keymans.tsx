import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Svg, Path, Rect } from 'react-native-svg';
import Header from '../5.Side Menu/2.Header';
import BottomMenu from '../5.Side Menu/3.BottomMenu';
import ModalSortBy from './2.ModalSortBy';
import NewKeymanModal from './4.NewKeyman';

// Cores do tema
const COLORS = {
  primary: '#1777CF',
  textPrimary: '#3A3F51',
  textSecondary: '#7D8592',
  textTertiary: '#91929E',
  background: '#F4F4F4',
  white: '#FCFCFC',
  border: '#D8E0F0',
  homeIndicator: '#D5D8E2',
};

// Componentes SVG dos ícones
const SearchIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path 
      d="M15 15L11.6556 11.6556M13.4444 7.22222C13.4444 10.6587 10.6587 13.4444 7.22222 13.4444C3.78578 13.4444 1 10.6587 1 7.22222C1 3.78578 3.78578 1 7.22222 1C10.6587 1 13.4444 3.78578 13.4444 7.22222Z" 
      stroke="#7D8592" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const ContactsIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <Svg width={size} height={size} viewBox="0 0 15 15" fill="none">
    <Path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M0.245432 14.9997C0.179108 14.9964 0.116629 14.9676 0.0709384 14.9194C0.0252479 14.8712 -0.000152138 14.8073 6.85634e-07 14.7409C-4.55063e-05 13.9258 0.16047 13.1188 0.472379 12.3658C0.784289 11.6128 1.24148 10.9286 1.81785 10.3523C2.39412 9.77596 3.07829 9.31877 3.83129 9.00686C4.58428 8.69495 5.39134 8.53444 6.20638 8.53448H8.7931C12.2211 8.53448 15 11.3134 15 14.7414C15 14.9853 14.7414 15 14.7414 15H0.258621L0.245432 14.9997ZM14.4768 14.4828H0.52319C0.589616 13.0201 1.21739 11.6394 2.27592 10.6278C3.33445 9.61626 4.74223 9.05175 6.20638 9.05172H8.7931C11.8487 9.05172 14.3418 11.4605 14.4768 14.4828ZM7.5 0C5.2875 0 3.49138 1.79612 3.49138 4.00862C3.49138 6.22112 5.2875 8.01724 7.5 8.01724C9.7125 8.01724 11.5086 6.22112 11.5086 4.00862C11.5086 1.79612 9.7125 0 7.5 0ZM7.5 0.517241C9.42698 0.517241 10.9914 2.08164 10.9914 4.00862C10.9914 5.9356 9.42698 7.5 7.5 7.5C5.57302 7.5 4.00862 5.9356 4.00862 4.00862C4.00862 2.08164 5.57302 0.517241 7.5 0.517241Z" 
      fill="#7D8592"
    />
  </Svg>
);

const ConversionsIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path 
      d="M10.0746 6.26099C10.0746 5.38343 9.36313 4.67201 8.48557 4.67201H7.21438C6.33682 4.67201 5.6254 5.38343 5.6254 6.26099C5.6254 7.13856 6.33682 7.84998 7.21438 7.84998H8.48557C9.36313 7.84998 10.0746 8.5614 10.0746 9.43896C10.0746 10.3165 9.36313 11.0279 8.48557 11.0279H7.21438C6.33682 11.0279 5.6254 10.3165 5.6254 9.43896M7.84998 4.67201V2.76523M7.84998 12.9347V11.0279M15.35 7.84998C15.35 11.9921 11.9921 15.35 7.84998 15.35C3.70785 15.35 0.349976 11.9921 0.349976 7.84998C0.349976 3.70785 3.70785 0.349976 7.84998 0.349976C11.9921 0.349976 15.35 3.70785 15.35 7.84998Z" 
      stroke="#7D8592" 
      strokeWidth="0.7" 
      strokeMiterlimit="10"
    />
  </Svg>
);

const RankIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <Svg width={size} height={size} viewBox="0 0 15 15" fill="none">
    <Path 
      d="M7.50015 8.91965C5.1572 8.92795 3.19808 7.48863 2.99549 5.61021L2.50633 0.621433C2.47208 0.307016 2.76103 0.0297632 3.15174 0.00219905C3.17247 0.000723193 3.19328 -1.05108e-05 3.21409 1.13743e-07H11.7859C12.1785 0.000123998 12.4965 0.256285 12.4964 0.572127C12.4964 0.588573 12.4955 0.605019 12.4937 0.621402L12.0048 5.60761C11.8037 7.48702 9.84417 8.92773 7.50015 8.91965ZM3.21409 0.428577C3.1894 0.42862 3.165 0.432791 3.14242 0.440826C3.11984 0.448861 3.09959 0.460584 3.08294 0.475252C3.06629 0.48992 3.05361 0.507212 3.0457 0.526032C3.0378 0.544852 3.03484 0.564789 3.03702 0.584578L3.52617 5.57401C3.72892 7.34016 5.67245 8.63961 7.86711 8.47645C9.78225 8.33408 11.2987 7.11271 11.4741 5.57144L11.963 0.584578C11.9653 0.564773 11.9624 0.544806 11.9545 0.525955C11.9466 0.507104 11.9339 0.489782 11.9173 0.475099C11.9006 0.460417 11.8803 0.448695 11.8577 0.440684C11.8351 0.432673 11.8106 0.42855 11.7859 0.428577H3.21409ZM12.5675 15H2.4488V13.3648C2.45041 12.2565 3.56643 11.3585 4.94357 11.3572H10.0727C11.4498 11.3585 12.5658 12.2566 12.5674 13.3648L12.5675 15ZM2.98137 14.5715H12.0349V13.3648C12.0336 12.4932 11.1558 11.7868 10.0727 11.7857H4.94357C3.86042 11.7868 2.98267 12.4931 2.98133 13.3648L2.98137 14.5715Z" 
      fill="#7D8592"
    />
    <Path 
      d="M9.95794 11.7857H5.04236V11.1577C5.04775 10.6705 5.54291 10.279 6.14833 10.2833C6.17227 10.2835 6.19621 10.2843 6.22011 10.2857H8.77988C9.38365 10.2494 9.90971 10.6138 9.9549 11.0997C9.9567 11.119 9.9577 11.1383 9.9579 11.1577L9.95794 11.7857ZM5.57493 11.3572H9.42537V11.1576C9.4144 10.9022 9.14812 10.7022 8.83068 10.7111C8.81371 10.7115 8.79678 10.7126 8.77992 10.7143H6.22015C5.90487 10.683 5.6178 10.8633 5.57893 11.117C5.57685 11.1305 5.57555 11.1441 5.57497 11.1576L5.57493 11.3572Z" 
      fill="#7D8592"
    />
    <Path 
      d="M8.30697 8.58278H8.83954V10.5004H8.30697V8.58278ZM6.17673 8.5873H6.7093V10.5004H6.17673V8.5873ZM2.71508 13.2857H12.3012V13.7143H2.71508V13.2857ZM13.64 5.36059H11.7846V4.93201H13.1384L13.3211 2.44628H12.0687V2.01773H13.8861L13.64 5.36059Z" 
      fill="#7D8592"
    />
    <Path 
      d="M13.6539 6.25713H11.6509V5.82856H13.6539C13.9546 5.82862 14.2032 5.64004 14.2208 5.39849L14.466 2.03569C14.4871 1.78467 14.2512 1.56744 13.9393 1.5505C13.9258 1.54976 13.9123 1.54942 13.8988 1.54948H12.1549V1.12093H13.8988C14.0493 1.12095 14.1982 1.14566 14.3364 1.19356C14.4747 1.24146 14.5993 1.31154 14.7027 1.39952C14.8059 1.48741 14.8853 1.59153 14.9361 1.70534C14.9868 1.81915 15.0077 1.94018 14.9975 2.06081L14.7525 5.42253C14.719 5.89103 14.2371 6.25713 13.6539 6.25713ZM3.21544 5.36059H1.35999L1.11395 2.01773H2.93157V2.44628H1.67896L1.86193 4.93201H3.21544V5.36059Z" 
      fill="#7D8592"
    />
    <Path 
      d="M3.3491 6.25713H1.34641C0.763308 6.25726 0.281311 5.89137 0.247482 5.42293L0.00248039 2.06056C-0.00764769 1.94014 0.0133127 1.81933 0.0640422 1.70575C0.114772 1.59216 0.194172 1.48825 0.297244 1.40057C0.400641 1.31257 0.525267 1.24247 0.663493 1.19457C0.80172 1.14667 0.950639 1.12197 1.10114 1.12199H2.84501V1.55056H1.10114C0.788632 1.54945 0.534163 1.7524 0.532778 2.00389C0.532701 2.01442 0.533124 2.02498 0.533971 2.03551L0.779203 5.39979C0.797638 5.64093 1.04618 5.8288 1.34637 5.82859H3.34906L3.3491 6.25713Z" 
      fill="#7D8592"
    />
  </Svg>
);

const NotificationIcon = () => (
  <Svg width="20" height="24" viewBox="0 0 20 24" fill="none">
    <Path 
      d="M10 0C6.13401 0 3 3.13401 3 7V11.5858L1.29289 13.2929C0.902369 13.6834 0.902369 14.3166 1.29289 14.7071C1.68342 15.0976 2.31658 15.0976 2.70711 14.7071L4 13.4142V7C4 3.68629 6.68629 1 10 1C13.3137 1 16 3.68629 16 7V13.4142L17.2929 14.7071C17.6834 15.0976 18.3166 15.0976 18.7071 14.7071C19.0976 14.3166 19.0976 13.6834 18.7071 13.2929L17 11.5858V7C17 3.13401 13.866 0 10 0Z" 
      fill={COLORS.textSecondary}
    />
    <Path 
      d="M6 18C6 20.2091 7.79086 22 10 22C12.2091 22 14 20.2091 14 18H6Z" 
      fill={COLORS.textSecondary}
    />
  </Svg>
);

const MenuIcon = () => (
  <Svg width="18" height="12" viewBox="0 0 18 12" fill="none">
    <Path d="M0 1H18" stroke={COLORS.textSecondary} strokeWidth="2"/>
    <Path d="M0 6H18" stroke={COLORS.textSecondary} strokeWidth="2"/>
    <Path d="M0 11H18" stroke={COLORS.textSecondary} strokeWidth="2"/>
  </Svg>
);

const PlusIcon = () => (
  <Svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <Path d="M4 0V8M0 4H8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const DropdownIcon = () => (
  <Svg width="37" height="37" viewBox="0 0 37 37" fill="none">
    <Rect 
      x="0.25" 
      y="0.25" 
      width="36.5" 
      height="36.5" 
      fill="#F4F4F4" 
      stroke="#D8E0F0" 
      strokeWidth="0.5" 
      rx="3.75"
    />
    <Path 
      d="M18.5002 20.3929C15.3763 20.4039 12.7641 18.4848 12.494 15.9803L11.8418 9.32858C11.7961 8.90935 12.1814 8.53968 12.7023 8.50293C12.73 8.50096 12.7577 8.49999 12.7855 8.5H24.2146C24.7379 8.50017 25.1621 8.84171 25.1619 9.26284C25.1619 9.28476 25.1607 9.30669 25.1583 9.32854L24.5065 15.9768C24.2382 18.4827 21.6256 20.4036 18.5002 20.3929ZM12.7855 9.07144C12.7525 9.07149 12.72 9.07705 12.6899 9.08777C12.6598 9.09848 12.6328 9.11411 12.6106 9.13367C12.5884 9.15323 12.5715 9.17628 12.5609 9.20138C12.5504 9.22647 12.5465 9.25305 12.5494 9.27944L13.2016 15.932C13.4719 18.2869 16.0633 20.0195 18.9895 19.8019C21.543 19.6121 23.5649 17.9836 23.7988 15.9286L24.4507 9.27944C24.4537 9.25303 24.4498 9.22641 24.4393 9.20127C24.4288 9.17614 24.4119 9.15304 24.3897 9.13347C24.3675 9.11389 24.3404 9.09826 24.3102 9.08758C24.2801 9.0769 24.2475 9.0714 24.2145 9.07144H12.7855ZM25.2566 28.5H11.7651V26.3197C11.7672 24.842 13.2552 23.6446 15.0914 23.6429H21.9302C23.7665 23.6446 25.2544 24.8421 25.2566 26.3197L25.2566 28.5ZM12.4752 27.9286H24.5465V26.3198C24.5448 25.1576 23.3745 24.2158 21.9302 24.2143H15.0914C13.6472 24.2157 12.4769 25.1575 12.4751 26.3198L12.4752 27.9286Z" 
      fill="#3A3F51"
    />
    <Path 
      d="M21.7772 24.2143H15.2232V23.3769C15.2303 22.7273 15.8905 22.2053 16.6978 22.2111C16.7297 22.2114 16.7616 22.2124 16.7935 22.2143H20.2065C21.0115 22.1659 21.713 22.6517 21.7732 23.2996C21.7756 23.3253 21.7769 23.3511 21.7772 23.3769L21.7772 24.2143ZM15.9332 23.6429H21.0672V23.3769C21.0525 23.0362 20.6975 22.7696 20.2742 22.7814C20.2516 22.7821 20.229 22.7835 20.2066 22.7857H16.7935C16.3732 22.744 15.9904 22.9844 15.9386 23.3227C15.9358 23.3407 15.9341 23.3588 15.9333 23.3769L15.9332 23.6429Z" 
      fill="#3A3F51"
    />
    <Path 
      d="M19.576 19.9437H20.286V22.5005H19.576V19.9437ZM16.7356 19.9497H17.4457V22.5006H16.7356V19.9497ZM12.1201 26.2143H24.9016V26.7857H12.1201V26.2143ZM26.6867 15.6474H24.2128V15.076H26.0178L26.2614 11.7617H24.5916V11.1903H27.0148L26.6867 15.6474Z" 
      fill="#3A3F51"
    />
    <Path 
      d="M26.7052 16.8428H24.0346V16.2714H26.7052C27.1061 16.2715 27.4375 16.02 27.461 15.698L27.788 11.2143C27.8161 10.8796 27.5016 10.5899 27.0857 10.5673C27.0677 10.5663 27.0498 10.5659 27.0318 10.566H24.7066V9.99458H27.0318C27.2324 9.9946 27.431 10.0275 27.6152 10.0914C27.7995 10.1553 27.9657 10.2487 28.1036 10.366C28.2412 10.4832 28.3471 10.622 28.4148 10.7738C28.4824 10.9255 28.5103 11.0869 28.4966 11.2477L28.17 15.73C28.1253 16.3547 27.4828 16.8428 26.7052 16.8428ZM12.7872 15.6474H10.3133L9.98527 11.1903H12.4088V11.7617H10.7386L10.9826 15.076H12.7872V15.6474Z" 
      fill="#3A3F51"
    />
    <Path 
      d="M12.9655 16.8428H10.2952C9.51774 16.843 8.87508 16.3552 8.82998 15.7306L8.50331 11.2474C8.4898 11.0869 8.51775 10.9258 8.58539 10.7743C8.65303 10.6229 8.7589 10.4843 8.89633 10.3674C9.03419 10.2501 9.20036 10.1566 9.38466 10.0928C9.56896 10.0289 9.76752 9.99596 9.96818 9.99598H12.2933V10.5674H9.96818C9.55151 10.5659 9.21222 10.8365 9.21037 11.1718C9.21027 11.1859 9.21083 11.2 9.21196 11.214L9.53894 15.6997C9.56352 16.0212 9.89491 16.2717 10.2952 16.2715H12.9654L12.9655 16.8428Z" 
      fill="#3A3F51"
    />
  </Svg>
);

// Ícones do menu inferior
const ProductsIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M20 7H4V5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V7Z" fill={COLORS.textSecondary}/>
    <Path d="M4 7V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V7H4Z" fill={COLORS.textSecondary}/>
  </Svg>
);

const ClientsIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill={COLORS.textSecondary}/>
    <Path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill={COLORS.textSecondary}/>
  </Svg>
);

const SalesIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="white"/>
  </Svg>
);

const AgendaIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3.01 3.9 3.01 5L3 19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z" fill={COLORS.textSecondary}/>
  </Svg>
);

const CommissionIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13.5 6L15.5 8L13.5 10V8.5H10.5V7.5H13.5V6ZM10.5 18L8.5 16L10.5 14V15.5H13.5V16.5H10.5V18Z" fill={COLORS.textSecondary}/>
  </Svg>
);

const MoreIcon = () => (
  <Svg width="4" height="18" viewBox="0 0 4 18" fill="none">
    <Path d="M2 4C3.1 4 4 3.1 4 2C4 0.9 3.1 0 2 0C0.9 0 0 0.9 0 2C0 3.1 0.9 4 2 4ZM2 6C0.9 6 0 6.9 0 8C0 9.1 0.9 10 2 10C3.1 10 4 9.1 4 8C4 6.9 3.1 6 2 6ZM2 12C0.9 12 0 12.9 0 14C0 15.1 0.9 16 2 16C3.1 16 4 15.1 4 14C4 12.9 3.1 12 2 12Z" fill={COLORS.textSecondary}/>
  </Svg>
);

// Dados dos keymans
const keymansData = [
  {
    id: 1,
    name: 'Camila Betanea',
    photo: require('../../../assets/0000001.png'),
    contacts: 85,
    conversions: 4,
    rank: 1,
  },
  {
    id: 2,
    name: 'Ruan de Londres',
    photo: require('../../../assets/0000002.png'),
    contacts: 120,
    conversions: 1,
    rank: 2,
  },
  {
    id: 3,
    name: 'Gabriela de Assis',
    photo: require('../../../assets/0000003.png'),
    contacts: 96,
    conversions: 1,
    rank: 3,
  },
];

const KeymansScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [newKeymanModalVisible, setNewKeymanModalVisible] = useState(false);
  
  // Estados para controlar a ordenação selecionada
  const [selectedCategory, setSelectedCategory] = useState<'contacts' | 'conversions' | 'rank'>('contacts');
  const [selectedOrder, setSelectedOrder] = useState<'asc' | 'desc'>('desc');

  // Lista derivada filtrada e ordenada (sempre chamada, antes de qualquer retorno condicional)
  const displayedKeymans = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    const base = keymansData.filter(k =>
      term.length === 0 ? true : k.name.toLowerCase().includes(term)
    );

    const key: 'contacts' | 'conversions' | 'rank' = selectedCategory;

    return base.slice().sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (selectedOrder === 'asc') {
        return aVal - bVal;
      }
      return bVal - aVal;
    });
  }, [searchText, selectedCategory, selectedOrder]);
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  // Função para mapear categoria para ícone correspondente
  const getCategoryIcon = (category: 'contacts' | 'conversions' | 'rank') => {
    switch (category) {
      case 'contacts':
        return <ContactsIcon size={20} />;
      case 'conversions':
        return <ConversionsIcon size={20} />;
      case 'rank':
        return <RankIcon size={20} />;
      default:
        return <ContactsIcon size={20} />;
    }
  };

  // Função para mapear categoria para texto de categoria
  const getCategoryText = (category: 'contacts' | 'conversions' | 'rank') => {
    switch (category) {
      case 'contacts':
        return 'Base de contatos';
      case 'conversions':
        return 'Conversões';
      case 'rank':
        return 'Rank';
      default:
        return 'Base de contatos';
    }
  };

  // Função para mapear categoria e ordem para texto de ordenação
  const getOrderText = (category: 'contacts' | 'conversions' | 'rank', order: 'asc' | 'desc') => {
    if (category === 'rank') {
      return order === 'asc' ? 'Primeiro para o último' : 'Último para o primeiro';
    } else {
      return order === 'desc' ? 'Maior para o menor' : 'Menor para o maior';
    }
  };

  

  const handleOpenSortModal = () => {
    setSortModalVisible(true);
  };

  const handleCloseSortModal = () => {
    setSortModalVisible(false);
  };

  const handleSortSelect = (
    category: 'contacts' | 'conversions' | 'rank',
    order: 'asc' | 'desc'
  ) => {
    setSelectedCategory(category);
    setSelectedOrder(order);
  };

  const handleOpenNewKeymanModal = () => {
    setNewKeymanModalVisible(true);
  };

  const handleCloseNewKeymanModal = () => {
    setNewKeymanModalVisible(false);
  };

  const handleSaveNewKeyman = (data: any) => {
    // Aqui você pode implementar a lógica para salvar o novo keyman
    // Por exemplo, adicionar à lista de keymans, fazer uma requisição para API, etc.
  };

  const renderKeymanCard = (keyman: typeof keymansData[0]) => (
    <View key={keyman.id} style={styles.keymanCard}>
      <Image source={keyman.photo} style={styles.keymanPhoto} />
      <View style={styles.keymanInfo}>
        <View style={styles.keymanHeader}>
          <Text style={styles.keymanName}>{keyman.name}</Text>
          <TouchableOpacity style={styles.moreButton}>
            <MoreIcon />
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statRow}>
          <ContactsIcon />
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Base de contatos</Text>
            <Text style={styles.statValue}>{keyman.contacts}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statRow}>
          <ConversionsIcon />
          <Text style={styles.statLabel}>Conversões</Text>
          <Text style={styles.statValue}>{keyman.conversions.toString().padStart(2, '0')}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statRow}>
          <RankIcon />
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Rank</Text>
            <Text style={styles.statValue}>{keyman.rank.toString().padStart(2, '0')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header padrão */}
      <Header 
        title={"Keymans (22)"}
        notificationCount={6}
        onMenuPress={() => setSideMenuVisible(true)}
        showBackButton={false}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Controls Section */}
        <View style={styles.controlsSection}>
          {/* Add KeyMan Button */}
          <View style={styles.addButtonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={handleOpenNewKeymanModal}>
              <PlusIcon />
              <Text style={styles.addButtonText}>KeyMan</Text>
            </TouchableOpacity>
          </View>
          
          {/* Sort Dropdown */}
          <View style={styles.sortSection}>
            <Text style={styles.sortLabel}>Ordenar por</Text>
            <TouchableOpacity style={styles.sortDropdown} onPress={handleOpenSortModal}>
              <View style={styles.iconContainer}>
                {getCategoryIcon(selectedCategory)}
              </View>
              <View style={styles.sortContent}>
                <Text style={styles.sortTitle}>{getCategoryText(selectedCategory)}:</Text>
                <Text style={styles.sortValue}>{getOrderText(selectedCategory, selectedOrder)}</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="pesquise aqui"
              placeholderTextColor={COLORS.textTertiary}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Keymans List (filtrada e ordenada) */}
        <ScrollView style={styles.keymansList} showsVerticalScrollIndicator={false}>
          {displayedKeymans.map((keyman, index) => (
            <View key={keyman.id}>
              {renderKeymanCard(keyman)}
              {index < displayedKeymans.length - 1 && <View style={styles.cardDivider} />}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Menu inferior padrão */}
      <BottomMenu activeScreen="Clients" />

      {/* Modal de Ordenação */}
      <ModalSortBy
        visible={sortModalVisible}
        onClose={handleCloseSortModal}
        onSortSelect={handleSortSelect}
      />

      {/* Modal Novo Keyman */}
      <NewKeymanModal
        visible={newKeymanModalVisible}
        onClose={handleCloseNewKeymanModal}
        onSave={handleSaveNewKeyman}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 1,
    paddingBottom: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  timeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: COLORS.textPrimary,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    backgroundColor: COLORS.textPrimary,
    width: 3,
  },
  bar1: { height: 4 },
  bar2: { height: 6 },
  bar3: { height: 8 },
  bar4: { height: 10 },
  wifiIcon: {
    width: 15,
    height: 11,
    backgroundColor: COLORS.textPrimary,
    borderRadius: 2,
  },
  batteryIcon: {
    width: 24,
    height: 12,
    backgroundColor: COLORS.textPrimary,
    borderRadius: 2,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 5,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: COLORS.white,
  },
  menuButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop: 2,
  },
  controlsSection: {
    paddingHorizontal: 15,
    paddingTop: 15,
    gap: 17,
  },
  addButtonContainer: {
    alignItems: 'flex-end',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 15,
    marginBottom: -15,
    
    gap: 10,
    height: 32,
  },
  addButtonText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 17,
  },
  sortSection: {
    gap: 5,
  },
  sortLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 15,
    paddingHorizontal: 5,
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 9,
    gap: 10,
  },
  iconContainer: {
    backgroundColor: '#F4F4F4',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 37,
    height: 37,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortContent: {
    flex: 1,
    gap: 5,
  },
  sortTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  sortValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 17,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingLeft: 14,
    height: 35,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.textPrimary,
    paddingVertical: 0,
    ...(Platform.OS === 'web'
      ? ({ outlineStyle: 'none', outlineWidth: 0, outlineColor: 'transparent' } as any)
      : {}),
  },
  keymansList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 17,
  },
  keymanCard: {
    flexDirection: 'row',
    gap: 12,
  },
  keymanPhoto: {
    width: 78,
    height: 135,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  keymanInfo: {
    flex: 1,
    gap: 10,
  },
  keymanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 17,
  },
  keymanName: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  moreButton: {
    padding: 4,
  },
  divider: {
    height: 0.1,
    backgroundColor: COLORS.border,
    alignSelf: 'stretch',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 17,
  },
  bottomMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 103,
  },
  bottomMenuCurve: {
    height: 30,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 21,
    borderTopRightRadius: 20,
  },
  bottomMenuContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 27,
    paddingTop: 15,
    position: 'relative',
  },
  bottomMenuSide: {
    flexDirection: 'row',
    gap: 10,
    width: 130,
  },
  bottomMenuItem: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralButton: {
    position: 'absolute',
    top: -23,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeIndicatorContainer: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    height: 35,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: COLORS.homeIndicator,
    borderRadius: 100,
  },
});

export default KeymansScreen;