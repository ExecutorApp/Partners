import React, { useEffect, useState } from 'react';
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useModal } from '../context/ModalContext';
import { checkIncompleteRegistration } from '../utils/registrationGuard';

const RegistrationGuardOverlay: React.FC = () => {
  const { currentModal, openModal } = useModal();
  const [incomplete, setIncomplete] = useState<boolean>(false);

  const evaluate = async () => {
    const inc = await checkIncompleteRegistration();
    setIncomplete(inc);
  };

  useEffect(() => {
    // Verifica ao montar
    evaluate();
  }, []);

  useEffect(() => {
    // Revalida sempre que um modal é aberto/fechado
    evaluate();
  }, [currentModal]);

  if (!incomplete) return null;

  return (
    <TouchableWithoutFeedback onPress={() => openModal('registerNow')}>
      <View style={styles.overlay} />
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
    backgroundColor: 'transparent',
  },
});

export default RegistrationGuardOverlay;