import React from 'react';
import { useModal } from '../context/ModalContext';
import RegisterNowModal from '../screens/6.CompleteRegistration/1.RegisterNow';
import RegistrationDataPersonal from '../screens/6.CompleteRegistration/2.RegistrationData-Personal';
import ModalRequiredFields from '../screens/6.CompleteRegistration/5.ModalRequiredFields';
import ModalCongratulations from '../screens/6.CompleteRegistration/6.ModalCongratulations';
import { RegistrationStorage, RegistrationValidation } from '../utils/registrationStorage';

const ModalRoot: React.FC = () => {
  const { modalStack, closeModal, openModal } = useModal();

  if (!modalStack.length) return null;

  // Renderiza todos os modais presentes na pilha, garantindo sobreposição pelo order
  return (
    <>
      {modalStack.map((id, idx) => {
        switch (id) {
          case 'registerNow':
            return (
              <RegisterNowModal
                key={`modal-${id}-${idx}`}
                visible={true}
                onClose={closeModal}
                onRegister={() => {}}
              />
            );
          case 'registrationDataPersonal':
            return (
              <RegistrationDataPersonal
                key={`modal-${id}-${idx}`}
                visible={true}
                onClose={closeModal}
                onCancel={closeModal}
                onSave={async () => {
                  try {
                    const data = await RegistrationStorage.getRegistrationData();
                    const isComplete = !!data && RegistrationValidation.isAllDataComplete(data);
                    if (isComplete) {
                      openModal('modalCongratulations');
                    } else {
                      openModal('modalRequiredFields');
                    }
                  } catch (error) {
                    // Em caso de erro na verificação, mantemos comportamento seguro
                    openModal('modalRequiredFields');
                  }
                }}
              />
            );
          case 'modalCongratulations':
            return (
              <ModalCongratulations
                key={`modal-${id}-${idx}`}
                visible={true}
                onClose={() => {
                  // Fecha apenas o modal de parabéns
                  closeModal();
                }}
                onContinue={async () => {
                  try {
                    await RegistrationStorage.markRegistrationComplete();
                  } finally {
                    // Fecha o modal de parabéns e o cadastro ao fundo
                    closeModal(); // fecha 'modalCongratulations'
                    closeModal(); // fecha 'registrationDataPersonal'
                  }
                }}
              />
            );
          case 'modalRequiredFields':
            return (
              <ModalRequiredFields
                key={`modal-${id}-${idx}`}
                visible={true}
                onClose={() => {
                  // "Voltar" fecha este modal; cadastro permanece aberto ao fundo
                  closeModal();
                }}
                onGoToRegistration={() => {
                  // "Sair" deve fechar este modal e o de cadastro ao fundo
                  closeModal(); // fecha o 'modalRequiredFields'
                  closeModal(); // fecha o 'registrationDataPersonal'
                }}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
};

export default ModalRoot;