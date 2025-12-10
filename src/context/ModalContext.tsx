import React, { createContext, useContext, useMemo, useState } from 'react';

// Identificadores de modais suportados
export type ModalId =
  | 'registerNow'
  | 'registrationDataPersonal'
  | 'modalRequiredFields'
  | 'modalCongratulations';

interface ModalContextValue {
  currentModal: ModalId | null;
  modalStack: ModalId[];
  openModal: (id: ModalId) => void;
  closeModal: () => void;
  isOpen: (id: ModalId) => boolean;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalStack, setModalStack] = useState<ModalId[]>([]);

  const currentModal: ModalId | null = modalStack.length ? modalStack[modalStack.length - 1] : null;

  const openModal = (id: ModalId) => {
    setModalStack((prev) => [...prev, id]);
  };

  const closeModal = () => {
    setModalStack((prev) => (prev.length ? prev.slice(0, -1) : prev));
  };

  const value = useMemo(
    () => ({
      currentModal,
      modalStack,
      openModal,
      closeModal,
      isOpen: (id: ModalId) => modalStack.includes(id),
    }),
    [modalStack]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};