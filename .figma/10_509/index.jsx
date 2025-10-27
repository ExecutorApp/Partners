import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a012}>
      <p className={styles.qualOSeuMelhorEmailL}>
        Qual o seu melhor email, Linkon?
      </p>
      <div className={styles.senha}>
        <div className={styles.a01}>
          <div className={styles.frame2131331276}>
            <p className={styles.email}>Email *</p>
          </div>
          <div className={styles.frame2}>
            <p className={styles.seuEmailCom}>seu@email.com</p>
          </div>
        </div>
        <div className={styles.a03}>
          <p className={styles.preenchaOsCamposObri}>
            Preencha os campos obrigatórios para continuar
          </p>
        </div>
      </div>
    </div>
  );
}

export default Component;
