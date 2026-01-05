import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a015}>
      <div className={styles.a013}>
        <img src="../image/mhz7w12e-4urmntu.svg" className={styles.a01} />
        <div className={styles.a012}>
          <p className={styles.nome}>Guiado</p>
          <p className={styles.nome2}>
            Siga a ordem predefinida de reuniões do sistema
          </p>
        </div>
      </div>
      <img src="../image/mhz7w12e-tg5ynr8.svg" className={styles.a} />
      <div className={styles.a02}>
        <div className={styles.border}>
          <img src="../image/mhz7w12e-cedpdad.svg" className={styles.a2} />
        </div>
        <div className={styles.a014}>
          <p className={styles.nome}>Livre</p>
          <p className={styles.nome3}>Você define manualmente cada reunião</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
