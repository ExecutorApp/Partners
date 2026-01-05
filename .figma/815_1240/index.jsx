import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a212}>
      <img src="../image/miejd6km-w379wm5.svg" className={styles.a02} />
      <div className={styles.a022}>
        <p className={styles.desejaRealmenteSair}>Deseja realmente sair?</p>
        <p className={styles.aoSairSeuUdioAnotaOn}>
          Ao sair, seu áudio (Anotação) não será salvo. Confirmar saída?
        </p>
      </div>
      <div className={styles.a6}>
        <div className={styles.a4}>
          <p className={styles.cancelar}>Cancelar</p>
        </div>
        <div className={styles.a3}>
          <p className={styles.sair}>Sair</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
