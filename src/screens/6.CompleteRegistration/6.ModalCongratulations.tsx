import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface ModalCongratulationsProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const ModalCongratulations: React.FC<ModalCongratulationsProps> = ({
  visible,
  onClose,
  onContinue,
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header com ícone de parabéns */}
            <View style={styles.headerContainer}>
              <View style={styles.iconContainer}>
                <View style={{width: 185.93, height: 180, position: 'relative'}}>
                  <View style={{width: 141, height: 141, left: 24.97, top: 20, position: 'absolute', backgroundColor: '#1777CF', borderRadius: 9999}} />
                  <View style={{left: 170.93, top: 20, position: 'absolute'}}>
                    <Svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Circle cx="7.5" cy="7.5" r="7.5" fill="#1777CF"/>
                    </Svg>
                  </View>
                  <View style={{left: 10, top: 0, position: 'absolute'}}>
                    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Circle cx="10" cy="10" r="10" fill="#1777CF"/>
                    </Svg>
                  </View>
                  <View style={{left: 5, top: 128, position: 'absolute'}}>
                    <Svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Circle cx="5" cy="5" r="5" fill="#1777CF"/>
                    </Svg>
                  </View>
                  <View style={{left: 163, top: 158, position: 'absolute'}}>
                    <Svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Circle cx="2.5" cy="2.5" r="2.5" fill="#1777CF"/>
                    </Svg>
                  </View>
                  <View style={{left: 65.97, top: 61, position: 'absolute'}}>
                    <Svg width="59" height="59" viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Path d="M27.8786 5.17844C28.8438 4.83612 29.9205 4.82916 30.903 5.16183L47.2204 10.6364C49.0466 11.2464 50.2818 12.9242 50.2917 14.8044L50.3952 31.1286C50.4273 36.0777 48.623 40.8778 45.319 44.6384C43.7995 46.3643 41.852 47.8468 39.3649 49.1726L30.5934 53.8611C30.3187 54.0057 30.017 54.0813 29.7126 54.0837C29.4082 54.0861 29.1039 54.013 28.8317 53.8708L19.9792 49.2907C17.4647 47.9866 15.4989 46.5259 13.9645 44.8239C10.6062 41.102 8.74088 36.324 8.70865 31.3679L8.60416 15.0544C8.59443 13.1718 9.80724 11.4823 11.6237 10.8484L27.8786 5.17844ZM38.7057 22.6628C37.9756 21.9613 36.7999 21.9663 36.0797 22.6775L27.7995 30.8396L24.4088 27.5808C23.6788 26.8793 22.5055 26.8863 21.7829 27.5974C21.0628 28.3084 21.0698 29.4505 21.7995 30.1521L26.5094 34.6843C26.8756 35.0361 27.3508 35.2095 27.8258 35.2048C28.301 35.2024 28.7741 35.0244 29.1354 34.6677L38.7204 25.2175C39.4406 24.5064 39.4333 23.3643 38.7057 22.6628Z" fill="white"/>
                    </Svg>
                  </View>
                  <View style={{left: 104, top: 2, position: 'absolute'}}>
                    <Svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Circle cx="2.5" cy="2.5" r="2.5" fill="#1777CF"/>
                    </Svg>
                  </View>
                  <View style={{left: 59, top: 173, position: 'absolute'}}>
                    <Svg width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Circle cx="3.5" cy="3.5" r="3.5" fill="#1777CF"/>
                    </Svg>
                  </View>
                  <View style={{left: 121, top: 170, position: 'absolute'}}>
                    <Svg width="2" height="2" viewBox="0 0 2 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Circle cx="1" cy="1" r="1" fill="#1777CF"/>
                    </Svg>
                  </View>
                  <View style={{left: 163, top: 108, position: 'absolute'}}>
                    <Svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Circle cx="2.5" cy="2.5" r="2.5" fill="#1777CF"/>
                    </Svg>
                  </View>
                  <View style={{left: 0, top: 74, position: 'absolute'}}>
                    <Svg width="2" height="2" viewBox="0 0 2 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Circle cx="1" cy="1" r="1" fill="#1777CF"/>
                    </Svg>
                  </View>
                </View>
              </View>
              <Text style={styles.title}>Parabéns!</Text>
            </View>

            {/* Conteúdo do modal */}
            <View style={styles.contentContainer}>
              <Text style={styles.subtitle}>
                Seu cadastro foi concluído com sucesso!
              </Text>
              
              <Text style={styles.description}>
                Agora você pode utilizar todos os recursos do sistema.
              </Text>
            </View>

            {/* Botões */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onContinue}>
                <Text style={styles.confirmButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#3A3F51',
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: '#3A3F51',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
    fontFamily: 'Inter_500Medium',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
  confirmButton: {
    backgroundColor: '#1777CF',
    width: '100%',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FCFCFC',
    fontFamily: 'Inter_600SemiBold',
  },
});

export default ModalCongratulations;