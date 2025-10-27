import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a08}>
      <div className={styles.a012}>
        <img src="../image/mh8c048h-vyg4pgz.svg" className={styles.a01} />
        <img src="../image/mh8c048h-oxrtmit.svg" className={styles.a02} />
      </div>
      <img src="../image/mh8c048h-ftz53nz.svg" className={styles.image} />
      <div className={styles.a014}>
        <div className={styles.a013}>
          <p className={styles.parabNsLinkon}>Parabéns, Linkon</p>
        </div>
        <div className={styles.a022}>
          <p className={styles.suaContaFoiCriadaCom}>
            Sua conta foi criada com sucesso!
          </p>
        </div>
        <div className={styles.a03}>
          <p className={styles.cliqueEmFinalizarPar3}>
            <span className={styles.cliqueEmFinalizarPar}>Clique em “</span>
            <span className={styles.cliqueEmFinalizarPar2}>Finalizar</span>
            <span className={styles.cliqueEmFinalizarPar}>
              ” para acessar sua conta <br />e aproveitar tudo o que preparamos pra
              você!
            </span>
          </p>
        </div>
      </div>
      <div className={styles.a024}>
        <div className={styles.a3}>
          <p className={styles.finalizar}>Finalizar</p>
        </div>
        <img src="../image/mh8c048h-ejftyb6.svg" className={styles.a023} />
      </div>
    </div>
  );
}

export default Component;
