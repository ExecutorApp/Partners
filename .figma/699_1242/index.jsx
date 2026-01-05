import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a023}>
      <div className={styles.foto2}>
        <div className={styles.foto}>
          <div className={styles.a01}>
            <p className={styles.hOje}>HOJE</p>
            <p className={styles.a9H30}>9h30</p>
          </div>
          <div className={styles.a02}>
            <img
              src="../image/mi5xebiw-ei6ypoz.png"
              className={styles.rectangle1196}
            />
          </div>
        </div>
      </div>
      <div className={styles.informaEs}>
        <div className={styles.a5}>
          <p className={styles.milesTone}>Joaquim Aparecido Bernardo</p>
          <img src="../image/mi5xebiv-vya7n5d.svg" className={styles.a09} />
        </div>
        <img src="../image/mi5xebiv-ehahs6j.svg" className={styles.a} />
        <div className={styles.a022}>
          <p className={styles.a012}>Produto:</p>
          <p className={styles.holdingPatrimonial}>Holding Patrimonial</p>
        </div>
        <img src="../image/mi5xebiv-ehahs6j.svg" className={styles.a} />
        <div className={styles.a022}>
          <p className={styles.a012}>Atividade:&nbsp;</p>
          <p className={styles.holdingPatrimonial}>Reunião inicial</p>
        </div>
        <img src="../image/mi5xebiv-ehahs6j.svg" className={styles.a} />
        <div className={styles.a022}>
          <p className={styles.a012}>Expert:</p>
          <p className={styles.holdingPatrimonial}>Lima Neto</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
