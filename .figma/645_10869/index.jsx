import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a012}>
      <div className={styles.a2}>
        <p className={styles.novaAnotaO}>Nova anotação</p>
        <img src="../image/mieluua7-oxa9wlb.svg" className={styles.fecharX} />
      </div>
      <div className={styles.nome}>
        <div className={styles.label}>
          <p className={styles.criarSenha}>Nome</p>
        </div>
        <div className={styles.input}>
          <p className={styles.placeholder}>
            Digite o título da sua anotação aqui...
          </p>
        </div>
      </div>
      <div className={styles.input2}>
        <p className={styles.placeholder2}>Digite aqui...</p>
      </div>
      <div className={styles.tempo}>
        <div className={styles.a01}>
          <div className={styles.autoWrapper}>
            <img src="../image/mieluua7-ms2hkxg.png" className={styles.vector} />
          </div>
          <p className={styles.limparTudo}>Limpar tudo</p>
        </div>
        <div className={styles.a02}>
          <p className={styles.salvar}>Salvar</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
