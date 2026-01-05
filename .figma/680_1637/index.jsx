import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a018}>
      <div className={styles.a016}>
        <div className={styles.a01}>
          <img src="../image/miapzz2t-8a6vdg0.svg" className={styles.vector} />
          <p className={styles.design}>Velocidade de reprodução</p>
        </div>
        <div className={styles.a013}>
          <div className={styles.a012}>
            <p className={styles.design2}>-</p>
          </div>
          <div className={styles.a02}>
            <p className={styles.design3}>1.00x</p>
            <div className={styles.progresso}>
              <div className={styles.line} />
              <div className={styles.line2} />
              <div className={styles.oval} />
            </div>
          </div>
          <div className={styles.a012}>
            <p className={styles.design2}>+</p>
          </div>
        </div>
        <div className={styles.a015}>
          <div className={styles.a014}>
            <p className={styles.design4}>1,0</p>
          </div>
          <div className={styles.a014}>
            <p className={styles.design4}>1,25</p>
          </div>
          <div className={styles.a014}>
            <p className={styles.design4}>1,5</p>
          </div>
          <div className={styles.a014}>
            <p className={styles.design4}>2,0</p>
          </div>
          <div className={styles.a014}>
            <p className={styles.design4}>2,5</p>
          </div>
          <div className={styles.a014}>
            <p className={styles.design4}>3,0</p>
          </div>
        </div>
      </div>
      <img src="../image/miapzz2t-coyf8ws.svg" className={styles.a} />
      <div className={styles.a03}>
        <img src="../image/miapzz2t-2rk6v64.svg" className={styles.fixo} />
        <div className={styles.a017}>
          <p className={styles.design}>Modo repetição</p>
          <div className={styles.a022}>
            <div className={styles.aCone}>
              <div className={styles.bullet} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
