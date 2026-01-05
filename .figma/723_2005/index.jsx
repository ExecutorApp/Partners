import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a200}>
      <p className={styles.horaInicial}>Hora inicial</p>
      <img src="../image/mi6f0p57-xq8u31r.svg" className={styles.a02} />
      <div className={styles.a032}>
        <div className={styles.a3}>
          <div className={styles.a01}>
            <p className={styles.horas}>Horas</p>
          </div>
          <div className={styles.a022}>
            <p className={styles.minutos}>Minutos</p>
          </div>
        </div>
        <div className={styles.hora}>
          <div className={styles.a012}>
            <p className={styles.a00}>00</p>
            <p className={styles.a00}>15</p>
          </div>
          <div className={styles.a012}>
            <p className={styles.a00}>01</p>
            <p className={styles.a00}>16</p>
          </div>
          <img src="../image/mi6f0p57-d2jzvzk.svg" className={styles.a} />
          <div className={styles.a03}>
            <p className={styles.a023}>02</p>
            <p className={styles.a2}>:</p>
            <p className={styles.a023}>17</p>
          </div>
          <img src="../image/mi6f0p57-d2jzvzk.svg" className={styles.a} />
          <div className={styles.a012}>
            <p className={styles.a00}>03</p>
            <p className={styles.a00}>18</p>
          </div>
          <div className={styles.a012}>
            <p className={styles.a00}>04</p>
            <p className={styles.a00}>19</p>
          </div>
        </div>
      </div>
      <div className={styles.a6}>
        <div className={styles.a4}>
          <p className={styles.cancelar}>Cancelar</p>
        </div>
        <div className={styles.a32}>
          <p className={styles.confirmar}>Confirmar</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
