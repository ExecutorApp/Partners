import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, TextInput } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import ModalAlertExitText from './28.ModalAlert-ExitText';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave?: (payload: { name: string; content: string }) => void;
  onReset?: () => void;
  mode?: 'create' | 'edit';
  initialName?: string;
  initialContent?: string;
};

// Ãcone: Fechar (X) conforme SVG fornecido
const CloseIconBox: React.FC = () => (
  <View style={styles.closeInnerBox}>
    <Svg width={13} height={12} viewBox="0 0 13 12" fill="none">
      <Path d="M12.655 0.247926C12.2959 -0.0821192 11.7339 -0.0827124 11.374 0.246573L6.5 4.70646L1.62595 0.246573C1.26609 -0.0827126 0.704125 -0.0821187 0.344999 0.247926L0.291597 0.297004C-0.0977822 0.654853 -0.0971065 1.25701 0.293074 1.61404L5.08634 6L0.293074 10.386C-0.0971063 10.743 -0.0977808 11.3451 0.291598 11.703L0.345 11.7521C0.704126 12.0821 1.26609 12.0827 1.62595 11.7534L6.5 7.29354L11.374 11.7534C11.7339 12.0827 12.2959 12.0821 12.655 11.7521L12.7084 11.703C13.0978 11.3451 13.0971 10.743 12.7069 10.386L7.91366 6L12.7069 1.61404C13.0971 1.25701 13.0978 0.654853 12.7084 0.297004L12.655 0.247926Z" fill="#3A3F51" />
    </Svg>
  </View>
);

// Ãcone: Limpar tudo conforme SVG fornecido
const ClearAllIcon: React.FC<{ width?: number; height?: number }> = ({ width = 23, height = 20 }) => (
  <Svg width={width} height={height} viewBox="0 0 23 20" fill="none">
    <Path d="M0.673838 18.6912H9.1695L10.5168 20H0.673838C-0.219254 19.9678 -0.21858 18.723 0.673838 18.6912ZM16.0616 7.66359L22.8026 14.2101C23.0658 14.4657 23.0658 14.88 22.8027 15.1355L17.9923 19.8083C17.8659 19.931 17.6945 20 17.5158 20H12.7017C12.5229 20 12.3515 19.931 12.2251 19.8083L7.89089 15.5987L16.0616 7.66359ZM0.197351 8.12628C-0.0657558 7.87076 -0.0657997 7.45645 0.197306 7.20089L7.41481 0.191638C7.67791 -0.0638793 8.10458 -0.0638793 8.36773 0.191638L15.1087 6.73815L6.93805 14.6731L0.197351 8.12628Z" fill="#1777CF" />
  </Svg>
);

const ModalTextAnnotation: React.FC<Props> = ({ visible, onClose, onSave, onReset, mode = 'create', initialName, initialContent }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [confirmExitVisible, setConfirmExitVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(mode === 'edit' ? (initialName ?? '') : '');
      setContent(mode === 'edit' ? (initialContent ?? '') : '');
    }
  }, [visible, mode, initialName, initialContent]);

  const handleNameChange = (text: string) => {
    if (!text) { setName(''); return; }
    const formatted = text.charAt(0).toUpperCase() + text.slice(1);
    setName(formatted);
  };

  const handleContentChange = (text: string) => {
    if (!text) { setContent(''); return; }
    const formatted = text.charAt(0).toUpperCase() + text.slice(1);
    setContent(formatted);
  };

  const handleReset = () => {
    // Limpa apenas o conteÃºdo da descriÃ§Ã£o
    setContent('');
    onReset?.();
  };

  const handleConfirmExit = () => {
    setConfirmExitVisible(false);
    onClose();
  };

  const headerTitle = mode === 'edit' ? 'Editar conteúdo' : 'Novo conteúdo';
  const canSave = (name.trim().length > 0) || (content.trim().length > 0);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>{headerTitle}</Text>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setConfirmExitVisible(true)} accessibilityLabel="Fechar">
              <CloseIconBox />
            </TouchableOpacity>
          </View>

          {/* Corpo (flexí­vel) */}
          <View style={styles.body}>
            {/* Campo Nome */}
            <View style={styles.nameSection}>
              <View style={styles.nameLabelRow}>
                <Text style={styles.nameLabel}>Tí­tulo</Text>
              </View>
              <View style={styles.inputBox}>
                <TextInput
                  value={name}
                  onChangeText={handleNameChange}
                  placeholder="Digite aqui..."
                  placeholderTextColor="#91929E"
                  autoCapitalize="sentences"
                  style={styles.inputText}
                />
              </View>
            </View>

            {/* Label Descrição */}
            <View style={styles.descLabelRow}>
              <Text style={styles.nameLabel}>Descrição</Text>
            </View>

            {/* Ãrea de texto */}
            <View style={styles.textAreaBox}>
              <TextInput
                value={content}
                onChangeText={handleContentChange}
                placeholder="Digite aqui..."
                placeholderTextColor="#91929E"
                multiline
                style={styles.textArea}
              />
            </View>
          </View>

          {/* Rodapé */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.clearBtn} onPress={handleReset} accessibilityRole="button" accessibilityLabel="Limpar">
              <ClearAllIcon width={23} height={20} />
              <Text style={styles.clearText}>Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !canSave ? styles.saveBtnDisabled : null]}
              disabled={!canSave}
              onPress={() => { onSave?.({ name: name.trim(), content: content.trim() }); onClose(); }}
              accessibilityRole="button"
              accessibilityLabel="Salvar"
              accessibilityState={{ disabled: !canSave }}
            >
              <Text style={[styles.saveText, !canSave ? styles.saveTextDisabled : null]}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ModalAlertExitText
        visible={confirmExitVisible}
        itemLabel={mode === 'edit' ? (initialName ?? 'Conteúdo de texto') : (name.trim() || 'Conteúdo de texto')}
        onCancel={() => setConfirmExitVisible(false)}
        onConfirm={handleConfirmExit}
      />
    </Modal>
  );
};

export default ModalTextAnnotation;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignSelf: 'stretch',
    margin: 10,
    backgroundColor: '#FCFCFC',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0.12 : 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  body: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    color: '#3A3F51',
    fontFamily: 'Inter_600SemiBold',
  },
  closeIcon: {
    padding: 0,
  },
  closeInnerBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
  },
  nameSection: {
    marginTop: 20,
    rowGap: 6,
  },
  nameLabelRow: {
    paddingHorizontal: 6,
  },
  nameLabel: {
    color: '#7D8592',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  descLabelRow: {
    paddingHorizontal: 6,
    marginTop: 16,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    backgroundColor: '#FCFCFC',
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: 40,
    justifyContent: 'center',
  },
  inputText: {
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'center',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  textAreaBox: {
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    backgroundColor: '#FCFCFC',
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 240,
    flex: 1,
    marginTop: 12,
  },
  textArea: {
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
    flex: 1,
    height: '100%',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  footerRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 309,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    backgroundColor: '#D3D3D31F',
    paddingHorizontal: 14,
    paddingVertical: 9,
    height: 40,
  },
  clearText: {
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 19,
  },
  saveBtn: {
    borderRadius: 8,
    backgroundColor: '#1777CF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 40,
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#D8E0F0',
  },
  saveText: {
    color: '#FCFCFC',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },
  saveTextDisabled: {
    color: '#FCFCFCB3',
  },
});