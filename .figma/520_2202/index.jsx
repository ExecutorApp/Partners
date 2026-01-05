import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a01}>
      <div className={styles.a5}>
        <p className={styles.criarSenha}>Setores</p>
        <p className={styles.placeholder}>Operacional</p>
      </div>
      <div className={styles.a5}>
        <p className={styles.criarSenha}>Áreas</p>
        <p className={styles.placeholder}>Jurídico</p>
      </div>
    </div>
  );
}

export default Component;
