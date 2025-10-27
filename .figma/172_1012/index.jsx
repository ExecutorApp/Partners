import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a01}>
      <img src="../image/mh59f018-p33yp2f.svg" className={styles.a02} />
      <div className={styles.a03}>
        <p className={styles.aTeno}>ATENÇÃO!</p>
        <p className={styles.aoVoltarOsDadosPreen}>
          Ao voltar, os dados preenchidos serão perdidos. Deseja continuar?
        </p>
      </div>
      <div className={styles.a5}>
        <div className={styles.a4}>
          <p className={styles.cancelar}>Cancelar</p>
        </div>
        <div className={styles.a3}>
          <p className={styles.confirmar}>Confirmar</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
