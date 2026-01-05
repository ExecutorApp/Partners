import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a209}>
      <img src="../image/mid9vusl-f82gn1b.svg" className={styles.a02} />
      <p className={styles.desejaRealmenteExclu3}>
        <span className={styles.desejaRealmenteExclu}>
          Deseja realmente excluir o conteúdo <br />
          (Anotação 02)?
          <br />
          <br />
        </span>
        <span className={styles.desejaRealmenteExclu2}>
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
