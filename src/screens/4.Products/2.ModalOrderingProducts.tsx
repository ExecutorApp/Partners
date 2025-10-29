import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
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

interface SortOption {
  category: string;
  option: string;
}

interface ModalOrderingProductsProps {
  isVisible: boolean;
  onClose: () => void;
  onSortSelection: (category: string, option: string) => void;
  selectedSortOption: SortOption;
}

const ModalOrderingProducts: React.FC<ModalOrderingProductsProps> = ({
  isVisible,
  onClose,
  onSortSelection,
  selectedSortOption,
}) => {
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
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ordenar por</Text>
              
              {/* Data de adição */}
              <View style={styles.sortSection}>
                <Text style={styles.sectionTitle}>Data de adição:</Text>
                <TouchableOpacity 
                  style={styles.sortOption}
                  onPress={() => onSortSelection('Data de adição', 'Mais recentes primeiro')}
                >
                  <Text style={styles.optionText}>Mais recentes primeiro</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.sortOption}
                  onPress={() => onSortSelection('Data de adição', 'Mais antigos primeiro')}
                >
                  <Text style={styles.optionText}>Mais antigos primeiro</Text>
                </TouchableOpacity>
              </View>

              {/* Divisor */}
              <View style={styles.divider} />

              {/* Comissão */}
              <View style={styles.sortSection}>
                <Text style={styles.sectionTitle}>Comissão:</Text>
                <TouchableOpacity 
                  style={styles.sortOption}
                  onPress={() => onSortSelection('Comissão', 'Maior para o menor')}
                >
                  <Text style={styles.optionText}>Maior para o menor</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.sortOption}
                  onPress={() => onSortSelection('Comissão', 'Menor para o maior')}
                >
                  <Text style={styles.optionText}>Menor para o maior</Text>
                </TouchableOpacity>
              </View>

              {/* Divisor */}
              <View style={styles.divider} />

              {/* Ticket médio */}
              <View style={styles.sortSection}>
                <Text style={styles.sectionTitle}>Ticket médio:</Text>
                <TouchableOpacity 
                  style={styles.sortOption}
                  onPress={() => onSortSelection('Ticket médio', 'Maior para o menor')}
                >
                  <Text style={styles.optionText}>Maior para o menor</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.sortOption}
                  onPress={() => onSortSelection('Ticket médio', 'Menor para o maior')}
                >
                  <Text style={styles.optionText}>Menor para o maior</Text>
                </TouchableOpacity>
              </View>

              {/* Divisor */}
              <View style={styles.divider} />

              {/* Tempo médio de fechamento */}
              <View style={styles.sortSection}>
                <Text style={styles.sectionTitle}>Tempo médio de fechamento:</Text>
                <TouchableOpacity 
                  style={styles.sortOption}
                  onPress={() => onSortSelection('Tempo médio de fechamento', 'Maior para o menor')}
                >
                  <Text style={styles.optionText}>Maior para o menor</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.sortOption}
                  onPress={() => onSortSelection('Tempo médio de fechamento', 'Menor para o maior')}
                >
                  <Text style={styles.optionText}>Menor para o maior</Text>
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
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
  },
  modalContent: {
    backgroundColor: '#FCFCFC',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#3A3F51',
    marginBottom: 20,
    textAlign: 'left',
  },
  sortSection: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#7D8592',
    marginBottom: 5,
  },
  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#3A3F51',
  },
  divider: {
    height: 0.1,
    backgroundColor: '#D8E0F0',
    marginBottom: 15,
  },
});

export default ModalOrderingProducts;