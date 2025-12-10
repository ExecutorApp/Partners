import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Svg, Path } from 'react-native-svg';

interface ModalSortByProps {
  visible: boolean;
  onClose: () => void;
  onSortSelect: (category: 'contacts' | 'conversions' | 'rank', order: 'asc' | 'desc') => void;
}

const ModalSortBy: React.FC<ModalSortByProps> = ({ visible, onClose, onSortSelect }) => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSelect = (category: 'contacts' | 'conversions' | 'rank', order: 'asc' | 'desc') => {
    onSortSelect(category, order);
    onClose();
  };

  const COLORS = {
    textPrimary: '#3A3F51',
    textSecondary: '#7D8592',
  };

  const ContactsIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 15 15" fill="none">
      <Path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M0.245432 14.9997C0.179108 14.9964 0.116629 14.9676 0.0709384 14.9194C0.0252479 14.8712 -0.000152138 14.8073 6.85634e-07 14.7409C-4.55063e-05 13.9258 0.16047 13.1188 0.472379 12.3658C0.784289 11.6128 1.24148 10.9286 1.81785 10.3523C2.39412 9.77596 3.07829 9.31877 3.83129 9.00686C4.58428 8.69495 5.39134 8.53444 6.20638 8.53448H8.7931C12.2211 8.53448 15 11.3134 15 14.7414C15 14.9853 14.7414 15 14.7414 15H0.258621L0.245432 14.9997ZM14.4768 14.4828H0.52319C0.589616 13.0201 1.21739 11.6394 2.27592 10.6278C3.33445 9.61626 4.74223 9.05175 6.20638 9.05172H8.7931C11.8487 9.05172 14.3418 11.4605 14.4768 14.4828ZM7.5 0C5.2875 0 3.49138 1.79612 3.49138 4.00862C3.49138 6.22112 5.2875 8.01724 7.5 8.01724C9.7125 8.01724 11.5086 6.22112 11.5086 4.00862C11.5086 1.79612 9.7125 0 7.5 0ZM7.5 0.517241C9.42698 0.517241 10.9914 2.08164 10.9914 4.00862C10.9914 5.9356 9.42698 7.5 7.5 7.5C5.57302 7.5 4.00862 5.9356 4.00862 4.00862C4.00862 2.08164 5.57302 0.517241 7.5 0.517241Z" 
        fill={COLORS.textSecondary}
      />
    </Svg>
  );

  const ConversionsIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path 
        d="M10.0746 6.26099C10.0746 5.38343 9.36313 4.67201 8.48557 4.67201H7.21438C6.33682 4.67201 5.6254 5.38343 5.6254 6.26099C5.6254 7.13856 6.33682 7.84998 7.21438 7.84998H8.48557C9.36313 7.84998 10.0746 8.5614 10.0746 9.43896C10.0746 10.3165 9.36313 11.0279 8.48557 11.0279H7.21438C6.33682 11.0279 5.6254 10.3165 5.6254 9.43896M7.84998 4.67201V2.76523M7.84998 12.9347V11.0279M15.35 7.84998C15.35 11.9921 11.9921 15.35 7.84998 15.35C3.70785 15.35 0.349976 11.9921 0.349976 7.84998C0.349976 3.70785 3.70785 0.349976 7.84998 0.349976C11.9921 0.349976 15.35 3.70785 15.35 7.84998Z" 
        stroke={COLORS.textSecondary} 
        strokeWidth="0.7" 
        strokeMiterlimit="10"
      />
    </Svg>
  );

  const RankIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 15 15" fill="none">
      <Path d="M7.50015 8.91965C5.1572 8.92795 3.19808 7.48863 2.99549 5.61021L2.50633 0.621433C2.47208 0.307016 2.76103 0.0297632 3.15174 0.00219905C3.17247 0.000723193 3.19328 -1.05108e-05 3.21409 1.13743e-07H11.7859C12.1785 0.000123998 12.4965 0.256285 12.4964 0.572127C12.4964 0.588573 12.4955 0.605019 12.4937 0.621402L12.0048 5.60761C11.8037 7.48702 9.84417 8.92773 7.50015 8.91965ZM3.21409 0.428577C3.1894 0.42862 3.165 0.432791 3.14242 0.440826C3.11984 0.448861 3.09959 0.460584 3.08294 0.475252C3.06629 0.48992 3.05361 0.507212 3.0457 0.526032C3.0378 0.544852 3.03484 0.564789 3.03702 0.584578L3.52617 5.57401C3.72892 7.34016 5.67245 8.63961 7.86711 8.47645C9.78225 8.33408 11.2987 7.11271 11.4741 5.57144L11.963 0.584578C11.9653 0.564773 11.9624 0.544806 11.9545 0.525955C11.9466 0.507104 11.9339 0.489782 11.9173 0.475099C11.9006 0.460417 11.8803 0.448695 11.8577 0.440684C11.8351 0.432673 11.8106 0.42855 11.7859 0.428577H3.21409ZM12.5675 15H2.4488V13.3648C2.45041 12.2565 3.56643 11.3585 4.94357 11.3572H10.0727C11.4498 11.3585 12.5658 12.2566 12.5674 13.3648L12.5675 15ZM2.98137 14.5715H12.0349V13.3648C12.0336 12.4932 11.1558 11.7868 10.0727 11.7857H4.94357C3.86042 11.7868 2.98267 12.4931 2.98133 13.3648L2.98137 14.5715Z" fill="#7D8592" />
      <Path d="M9.95794 11.7857H5.04236V11.1577C5.04775 10.6705 5.54291 10.279 6.14833 10.2833C6.17227 10.2835 6.19621 10.2843 6.22011 10.2857H8.77988C9.38365 10.2494 9.90971 10.6138 9.9549 11.0997C9.9567 11.119 9.9577 11.1383 9.9579 11.1577L9.95794 11.7857ZM5.57493 11.3572H9.42537V11.1576C9.4144 10.9022 9.14812 10.7022 8.83068 10.7111C8.81371 10.7115 8.79678 10.7126 8.77992 10.7143H6.22015C5.90487 10.683 5.6178 10.8633 5.57893 11.117C5.57685 11.1305 5.57555 11.1441 5.57497 11.1576L5.57493 11.3572Z" fill="#7D8592" />
      <Path d="M8.30697 8.58278H8.83954V10.5004H8.30697V8.58278ZM6.17673 8.5873H6.7093V10.5004H6.17673V8.5873ZM2.71508 13.2857H12.3012V13.7143H2.71508V13.2857ZM13.64 5.36059H11.7846V4.93201H13.1384L13.3211 2.44628H12.0687V2.01773H13.8861L13.64 5.36059Z" fill="#7D8592" />
      <Path d="M13.6539 6.25713H11.6509V5.82856H13.6539C13.9546 5.82862 14.2032 5.64004 14.2208 5.39849L14.466 2.03569C14.4871 1.78467 14.2512 1.56744 13.9393 1.5505C13.9258 1.54976 13.9123 1.54942 13.8988 1.54948H12.1549V1.12093H13.8988C14.0493 1.12095 14.1982 1.14566 14.3364 1.19356C14.4747 1.24146 14.5993 1.31154 14.7027 1.39952C14.8059 1.48741 14.8853 1.59153 14.9361 1.70534C14.9868 1.81915 15.0077 1.94018 14.9975 2.06081L14.7525 5.42253C14.719 5.89103 14.2371 6.25713 13.6539 6.25713ZM3.21544 5.36059H1.35999L1.11395 2.01773H2.93157V2.44628H1.67896L1.86193 4.93201H3.21544V5.36059Z" fill="#7D8592" />
      <Path d="M3.3491 6.25713H1.34641C0.763308 6.25726 0.281311 5.89137 0.247482 5.42293L0.00248039 2.06056C-0.00764769 1.94014 0.0133127 1.81933 0.0640422 1.70575C0.114772 1.59216 0.194172 1.48825 0.297244 1.40057C0.400641 1.31257 0.525267 1.24247 0.663493 1.19457C0.80172 1.14667 0.950639 1.12197 1.10114 1.12199H2.84501V1.55056H1.10114C0.788632 1.54945 0.534163 1.7524 0.532778 2.00389C0.532701 2.01442 0.533124 2.02498 0.533971 2.03551L0.779203 5.39979C0.797638 5.64093 1.04618 5.8288 1.34637 5.82859H3.34906L3.3491 6.25713Z" fill="#7D8592" />
    </Svg>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.container}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.content}>
              <Text style={styles.title}>Ordenar por</Text>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}><ContactsIcon /></View>
                  <Text style={styles.sectionTitle}>Base de contatos:</Text>
                </View>
                <TouchableOpacity style={styles.option} onPress={() => handleSelect('contacts', 'desc')}>
                  <Text style={styles.optionText}>Maior para o menor</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => handleSelect('contacts', 'asc')}>
                  <Text style={styles.optionText}>Menor para o maior</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}><ConversionsIcon /></View>
                  <Text style={styles.sectionTitle}>Conversões:</Text>
                </View>
                <TouchableOpacity style={styles.option} onPress={() => handleSelect('conversions', 'desc')}>
                  <Text style={styles.optionText}>Maior para o menor</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => handleSelect('conversions', 'asc')}>
                  <Text style={styles.optionText}>Menor para o maior</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}><RankIcon /></View>
                  <Text style={styles.sectionTitle}>Rank:</Text>
                </View>
                <TouchableOpacity style={styles.option} onPress={() => handleSelect('rank', 'asc')}>
                  <Text style={styles.optionText}>Primeiro para o último</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => handleSelect('rank', 'desc')}>
                  <Text style={styles.optionText}>Último para o primeiro</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  container: { width: '100%', maxWidth: 340 },
  content: { backgroundColor: '#FCFCFC', borderRadius: 12, padding: 20},
  
  title: { 
  fontSize: 16, 
  fontFamily: 'Inter_700Bold', 
  color: '#3A3F51', 
  marginBottom: 20, 
  textAlign: 'left' },

  section: { 
  marginBottom: 5 },
  sectionTitle: { 
  fontSize: 14, 
  fontFamily: 'Inter_700Bold', 
  color: '#7D8592', 
  marginBottom: 0,
  lineHeight: 20 },

  sectionHeader: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  marginBottom: 5,
  minHeight: 20 },
  
  sectionIcon: { marginRight: 10 },
  option: { paddingVertical: 10 },
  optionText: { 
  fontSize: 14, 
  fontFamily: 'Inter_400Regular',
  color: '#3A3F51' },

  divider: { height: 0.5, backgroundColor: '#D8E0F0', marginBottom: 15 },
});

export default ModalSortBy;