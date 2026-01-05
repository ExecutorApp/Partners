import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a10}>
      <div className={styles.principal}>
        <div className={styles.status}>
          <img src="../image/mhw4iw9g-lzzjxyq.svg" className={styles.seta} />
          <div className={styles.a02}>
            <p className={styles.nome}>03/03</p>
          </div>
          <div className={styles.autoWrapper}>
            <img src="../image/mhw4iw9g-vvsv6n2.png" className={styles.seta2} />
          </div>
        </div>
        <img src="../image/mhw4iw9g-uwzxhpd.svg" className={styles.fecharX} />
      </div>
      <div className={styles.a012}>
        <div className={styles.a01}>
          <p className={styles.placeholder}>Tipos de agenda</p>
        </div>
        <div className={styles.input}>
          <p className={styles.placeholder2}>Todos</p>
        </div>
      </div>
      <div className={styles.lista2}>
        <div className={styles.lista}>
          <div className={styles.a013}>
            <p className={styles.design}>Todos</p>
          </div>
          <img src="../image/mhw4iw9g-xt92tgl.svg" className={styles.a} />
          <div className={styles.a022}>
            <p className={styles.design2}>Individual</p>
          </div>
          <img src="../image/mhw4iw9g-xt92tgl.svg" className={styles.a} />
          <div className={styles.a023}>
            <p className={styles.design2}>Compartilhada</p>
          </div>
        </div>
        <div className={styles.botEs}>
          <div className={styles.a014}>
            <p className={styles.salvar}>Cancelar</p>
          </div>
          <div className={styles.a024}>
            <p className={styles.salvar2}>Aplicar</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
