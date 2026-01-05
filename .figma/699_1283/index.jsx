import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a014}>
      <div className={styles.foto2}>
        <div className={styles.foto}>
          <div className={styles.a01}>
            <p className={styles.hOje}>HOJE</p>
            <p className={styles.a8H}>8h</p>
          </div>
          <div className={styles.a02}>
            <img
              src="../image/mi5xz0pz-1l5a9xm.png"
              className={styles.rectangle1196}
            />
          </div>
        </div>
      </div>
      <div className={styles.informaEs}>
        <div className={styles.a012}>
          <p className={styles.milesTone}>Perola Marina Diniz</p>
          <img src="../image/mi5xz0px-cd0n5r2.svg" className={styles.a09} />
        </div>
        <img src="../image/mi5xz0px-zsbwz99.svg" className={styles.a} />
        <div className={styles.a022}>
          <p className={styles.a013}>Produto:</p>
          <p className={styles.holdingPatrimonial}>Holding Patrimonial</p>
        </div>
        <img src="../image/mi5xz0px-zsbwz99.svg" className={styles.a} />
        <div className={styles.a022}>
          <p className={styles.a013}>Atividade:&nbsp;</p>
          <p className={styles.holdingPatrimonial}>Reunião inicial</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
