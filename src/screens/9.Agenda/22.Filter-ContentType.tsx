import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { TxtDocIcon, PdfDocIcon, DocxDocIcon, PlayCircleIcon } from '../../components/content/ContentIcons';

export type ContentFilterType = 'all' | 'txt' | 'pdf' | 'docx' | 'audio';

type Props = {
  visible: boolean;
  selectedType?: ContentFilterType;
  onClose: () => void;
  onSelect: (type: ContentFilterType) => void;
  // Contagens por tipo de conteúdo
  counts?: {
    all: number;
    txt: number;
    pdf: number;
    docx: number;
    audio: number;
  };
};

// Ícone específico para "Todos" (fornecido pelo usuário)
const AllTypesIcon: React.FC<{ width?: number; height?: number }> = ({ width = 23, height = 25 }) => (
  <Svg width={width} height={height} viewBox="0 0 23 25" fill="none">
    <Path fillRule="evenodd" clipRule="evenodd" d="M3.09728 21.5721C3.02475 21.6422 2.92761 21.681 2.8268 21.6801C2.72598 21.6792 2.62954 21.6388 2.55825 21.5674C2.48696 21.496 2.44652 21.3995 2.44563 21.2986C2.44475 21.1977 2.48349 21.1004 2.55351 21.0278L10.6166 12.9567C10.6262 12.9471 10.6316 12.9341 10.6316 12.9204C10.6316 12.9068 10.6262 12.8938 10.6166 12.8842L2.55351 4.81306C2.48349 4.74045 2.44475 4.64323 2.44563 4.54231C2.44652 4.44139 2.48696 4.34486 2.55825 4.2735C2.62954 4.20214 2.72598 4.16165 2.8268 4.16077C2.92761 4.15988 3.02475 4.19866 3.09728 4.26876L11.164 12.3362C11.1736 12.3458 11.1867 12.3512 11.2003 12.3512C11.2138 12.3512 11.2269 12.3458 11.2365 12.3362L19.296 4.26881C19.3685 4.19872 19.4657 4.15994 19.5665 4.16083C19.6673 4.16171 19.7637 4.2022 19.835 4.27356C19.9063 4.34492 19.9468 4.44145 19.9477 4.54237C19.9485 4.64328 19.9098 4.74051 19.8398 4.81312L11.7806 12.8802C11.771 12.8898 11.7656 12.9029 11.7656 12.9165C11.7657 12.9301 11.7711 12.9431 11.7807 12.9528L19.8565 21.0278C20.0998 21.2705 19.9249 21.6838 19.5861 21.6838V21.6849C19.4669 21.6849 19.3741 21.651 19.2936 21.5697L11.2329 13.501C11.2233 13.4914 11.2102 13.486 11.1966 13.486C11.1831 13.486 11.17 13.4914 11.1604 13.501L3.09728 21.5721ZM19.3688 10.6958V14.4865C19.3688 14.5054 19.3781 14.5215 19.3944 14.531L22.9231 16.5711C22.9394 16.5806 22.958 16.5806 22.9743 16.5711C22.9906 16.5617 23 16.5456 23 16.5267V8.65558C23 8.63671 22.9907 8.62057 22.9744 8.61114C22.9581 8.60171 22.9394 8.60171 22.9231 8.61114L19.5196 10.5781L19.5201 10.5788L19.3945 10.6514C19.3866 10.6557 19.38 10.6622 19.3755 10.67C19.371 10.6778 19.3687 10.6868 19.3688 10.6958ZM16.0316 11.0598V14.1225C16.0316 14.2293 16.1027 14.3378 16.2065 14.3378H18.5092C18.5228 14.3378 18.5358 14.3323 18.5454 14.3227C18.555 14.3131 18.5604 14.3001 18.5604 14.2865V10.8958C18.5604 10.8822 18.555 10.8692 18.5454 10.8595C18.5358 10.8499 18.5228 10.8445 18.5092 10.8445H16.2065C16.1028 10.8445 16.0316 10.9529 16.0316 11.0598ZM10.3191 20.2201C9.00514 20.2201 7.93148 21.2948 7.93148 22.61C7.93148 23.9253 9.00514 25 10.3191 25H10.4299C11.7438 25 12.8175 23.9253 12.8175 22.6101V18.4735C12.8174 18.463 12.8205 18.4528 12.8265 18.4442C12.8324 18.4356 12.8409 18.429 12.8507 18.4255C12.8605 18.4216 12.8711 18.421 12.8813 18.4235C12.8914 18.426 12.9005 18.4316 12.9073 18.4396L14.1079 19.8051C14.1756 19.8802 14.2702 19.9255 14.3711 19.9313C14.4719 19.937 14.571 19.9028 14.6469 19.836C14.7227 19.7691 14.7692 19.6751 14.7763 19.5742C14.7834 19.4733 14.7505 19.3737 14.6847 19.2969L12.7318 17.0755L12.7312 17.0748C12.489 16.7893 12.0486 16.9672 12.0486 17.3179V20.7427C12.0486 20.7631 12.0375 20.7806 12.019 20.7892C12.0005 20.7978 11.9799 20.7951 11.9643 20.7819C11.5488 20.4317 11.013 20.22 10.43 20.22L10.3191 20.2201ZM8.47145 0C7.95809 0 7.53927 0.419115 7.53927 0.933041V6.40711C7.53927 6.92109 7.95809 7.34015 8.47145 7.34015H13.9401C14.4535 7.34015 14.8722 6.92104 14.8722 6.40711V0.933041C14.8722 0.419115 14.4535 0 13.9401 0H8.47145ZM8.37187 4.45161L10.0433 2.23156C10.1951 2.03001 10.4932 2.04105 10.6384 2.23839L12.3792 4.55058C12.3892 4.56387 12.4035 4.57105 12.4201 4.57105C12.4368 4.57105 12.4511 4.56393 12.4611 4.55058L14.1215 2.34518C14.1283 2.33635 14.132 2.32545 14.1318 2.31427V0.933041C14.1318 0.828203 14.0448 0.741105 13.94 0.741105H8.47139C8.36665 0.741105 8.27964 0.828203 8.27964 0.933041V4.4207C8.27964 4.44313 8.29339 4.46223 8.31461 4.46935C8.33595 4.47647 8.35836 4.46953 8.37187 4.45161ZM7.11494 13.3171C7.37129 13.1733 7.37805 12.7997 7.11938 12.65L3.84808 10.7595L3.84773 10.7601L0.608075 8.8878C0.607416 8.88742 0.606764 8.88702 0.60612 8.88662C0.309461 8.69693 0 8.92026 0 9.20119V16.7634H0.00160038C0.00136329 17.0548 0.318826 17.2435 0.575298 17.0957L7.11494 13.3171Z" fill="#1777CF"/>
  </Svg>
);

// Formata contagem com dois dígitos (ex: 01, 02, 10)
const formatCount = (count: number): string => {
  return String(count).padStart(2, '0');
};

const FilterContentTypeModal: React.FC<Props> = ({ visible, selectedType = 'all', onClose, onSelect, counts }) => {
  // Valores padrão para contagens
  const safeC = counts ?? { all: 0, txt: 0, pdf: 0, docx: 0, audio: 0 };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* TouchableWithoutFeedback na overlay para fechar ao clicar fora */}
      <TouchableWithoutFeedback onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar modal">
        <View style={styles.overlay}>
          {/* Impede que cliques no container fechem o modal */}
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <Text style={styles.label}>Tipo de conteúdo</Text>
              <View style={styles.divider} />

              {/* Opções */}
              <TouchableOpacity style={styles.optionRow} onPress={() => onSelect('all')} accessibilityRole="button" accessibilityLabel="Mostrar todos os tipos">
                <Text style={[styles.optionText, selectedType === 'all' ? styles.optionTextActive : null]}>
                  Todos ({formatCount(safeC.all)})
                </Text>
                <AllTypesIcon />
              </TouchableOpacity>
              <View style={styles.divider} />

              <TouchableOpacity style={styles.optionRow} onPress={() => onSelect('txt')} accessibilityRole="button" accessibilityLabel="Filtrar TXT">
                <Text style={[styles.optionText, selectedType === 'txt' ? styles.optionTextActive : null]}>
                  TXT ({formatCount(safeC.txt)})
                </Text>
                <TxtDocIcon width={25} height={27} />
              </TouchableOpacity>
              <View style={styles.divider} />

              <TouchableOpacity style={styles.optionRow} onPress={() => onSelect('pdf')} accessibilityRole="button" accessibilityLabel="Filtrar PDF">
                <Text style={[styles.optionText, selectedType === 'pdf' ? styles.optionTextActive : null]}>
                  PDF ({formatCount(safeC.pdf)})
                </Text>
                <PdfDocIcon width={25} height={27} />
              </TouchableOpacity>
              <View style={styles.divider} />

              <TouchableOpacity style={styles.optionRow} onPress={() => onSelect('docx')} accessibilityRole="button" accessibilityLabel="Filtrar DOCX">
                <Text style={[styles.optionText, selectedType === 'docx' ? styles.optionTextActive : null]}>
                  DOCX ({formatCount(safeC.docx)})
                </Text>
                <DocxDocIcon width={25} height={27} />
              </TouchableOpacity>
              <View style={styles.divider} />

              <TouchableOpacity style={styles.optionRow} onPress={() => onSelect('audio')} accessibilityRole="button" accessibilityLabel="Filtrar Áudio">
                <Text style={[styles.optionText, selectedType === 'audio' ? styles.optionTextActive : null]}>
                  Áudio ({formatCount(safeC.audio)})
                </Text>
                <PlayCircleIcon width={25} height={25} />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FilterContentTypeModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#FCFCFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0.12 : 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  label: {
    fontSize: 14,
    color: '#7D8592',
    fontFamily: 'Inter_500Medium',
    marginBottom: 15,
    paddingLeft: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F6',
  },
  optionText: {
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
  },
  optionTextActive: {
    color: '#1777CF',
  },
});