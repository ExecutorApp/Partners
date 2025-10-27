import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a4}>
      <p className={styles.digiteOcDigoDe6DGito}>
        Digite o código de 6 dígitos <br />
        que enviamos para o seu WhatsApp
      </p>
      <div className={styles.dGitos}>
        <div className={styles.a01}>
          <p className={styles.a1}>1</p>
        </div>
        <div className={styles.a01}>
          <p className={styles.a1}>2</p>
        </div>
        <div className={styles.a01}>
          <p className={styles.a1}>3</p>
        </div>
        <div className={styles.a01}>
          <p className={styles.a1}>4</p>
        </div>
        <div className={styles.a01}>
          <p className={styles.a1}>5</p>
        </div>
        <div className={styles.a01}>
          <p className={styles.a1}>6</p>
        </div>
      </div>
      <p className={styles.reenviarCDigoEm0028}>Reenviar código em 00:28</p>
      <div className={styles.a03}>
        <p className={styles.aProntoParaContinuar}>✓ Pronto para continuar</p>
      </div>
    </div>
  );
}

export default Component;
