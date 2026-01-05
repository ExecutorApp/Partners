import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a198}>
      <img src="../image/mi3jogmp-8sdru3e.svg" className={styles.a02} />
      <p className={styles.temCertezaDeQueDesej3}>
        <span className={styles.temCertezaDeQueDesej}>
          Tem certeza de que deseja excluir o horário das 08:30 às 09:30?
          <br />
        </span>
        <span className={styles.temCertezaDeQueDesej2}>
          Esta ação não pode ser desfeita.
        </span>
      </p>
      <div className={styles.a5}>
        <div className={styles.a4}>
          <p className={styles.cancelar}>Cancelar</p>
        </div>
        <div className={styles.a3}>
          <p className={styles.excluir}>Excluir</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
