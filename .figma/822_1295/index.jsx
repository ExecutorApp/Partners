import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.lista}>
      <img src="../image/miejujy8-3wzqbts.svg" className={styles.a01} />
      <div className={styles.a02}>
        <p className={styles.nenhumConteDoEncontr}>
          Nenhum conteúdo
          <br />
          encontrado!
        </p>
      </div>
      <div className={styles.a03}>
        <p className={styles.paraCriarUmNovoConte}>
          Para criar um novo conteúdo, <br />
          toque no botão azul <br />
          “Nova Anotação” <br />
          no topo da tela.
        </p>
      </div>
    </div>
  );
}

export default Component;
