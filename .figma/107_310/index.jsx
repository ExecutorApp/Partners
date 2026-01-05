import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.lista}>
      <div className={styles.barraDeBusca2}>
        <div className={styles.barraDeBusca}>
          <img src="../image/mhz5p83f-cjkj1su.svg" className={styles.icone} />
          <p className={styles.nome}>pesquise aqui</p>
        </div>
      </div>
      <div className={styles.a012}>
        <div className={styles.a9}>
          <img src="../image/mhz5p83g-tngwooi.svg" className={styles.a01} />
          <p className={styles.nome2}>Nenhum</p>
        </div>
        <img src="../image/mhz5p83g-6ej4215.svg" className={styles.a} />
        <div className={styles.a7}>
          <img src="../image/mhz5p83g-ph5qlqc.svg" className={styles.a01} />
          <p className={styles.nome3}>Holding Patrimonial</p>
        </div>
        <img src="../image/mhz5p83g-6ej4215.svg" className={styles.a} />
        <div className={styles.a7}>
          <img src="../image/mhz5p83g-17bvf1g.svg" className={styles.a01} />
          <p className={styles.nome3}>Ativos fundiários</p>
        </div>
        <img src="../image/mhz5p83g-6ej4215.svg" className={styles.a} />
        <div className={styles.a7}>
          <img src="../image/mhz5p83g-0nzhyc4.svg" className={styles.a01} />
          <p className={styles.nome3}>Planejamento Tributário</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
