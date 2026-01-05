import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a012}>
      <div className={styles.a01}>
        <img src="../image/mi640ceq-ew4t37l.svg" className={styles.aCone} />
        <p className={styles.design}>Editar Agendamento</p>
      </div>
      <img src="../image/mi640ceq-9h8wk5y.svg" className={styles.a} />
      <div className={styles.a01}>
        <img src="../image/mi640cer-nuai53p.svg" className={styles.aCone} />
        <p className={styles.design}>Copiar link da reunião</p>
      </div>
      <img src="../image/mi640ceq-9h8wk5y.svg" className={styles.a} />
      <div className={styles.a3}>
        <img src="../image/mi640cer-75f5nfv.svg" className={styles.aCone2} />
        <p className={styles.design}>Excluir</p>
      </div>
    </div>
  );
}

export default Component;
