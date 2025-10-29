import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.lista}>
      <p className={styles.design}>Ordenar por</p>
      <img src="../image/mhbyve2c-unhockr.svg" className={styles.a} />
      <div className={styles.a012}>
        <p className={styles.design2}>Data de adição:</p>
        <div className={styles.a01}>
          <p className={styles.design3}>Mais recentes primeiro</p>
        </div>
        <div className={styles.a02}>
          <p className={styles.design3}>Mais antigos primeiro</p>
        </div>
      </div>
      <img src="../image/mhbyve2c-unhockr.svg" className={styles.a} />
      <div className={styles.a012}>
        <p className={styles.design2}>Comissão:</p>
        <div className={styles.a01}>
          <p className={styles.design3}>Maior para o menor</p>
        </div>
        <div className={styles.a02}>
          <p className={styles.design3}>Menor para o maior</p>
        </div>
      </div>
      <img src="../image/mhbyve2c-unhockr.svg" className={styles.a} />
      <div className={styles.a012}>
        <p className={styles.design2}>Ticket médio:</p>
        <div className={styles.a01}>
          <p className={styles.design3}>Maior para o menor</p>
        </div>
        <div className={styles.a02}>
          <p className={styles.design3}>Menor para o maior</p>
        </div>
      </div>
      <img src="../image/mhbyve2c-unhockr.svg" className={styles.a} />
      <div className={styles.a012}>
        <p className={styles.design2}>Tempo médio de fechamento:</p>
        <div className={styles.a01}>
          <p className={styles.design3}>Maior para o menor</p>
        </div>
        <div className={styles.a02}>
          <p className={styles.design3}>Menor para o maior</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
