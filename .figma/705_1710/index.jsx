import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.lista}>
      <img src="../image/mi6353ym-jczvg4b.svg" className={styles.a01} />
      <div className={styles.a02}>
        <p className={styles.nenhumAgendamentoEnc}>
          Nenhum agendamento encontrado!
        </p>
      </div>
      <div className={styles.a03}>
        <p className={styles.paraCriarUmNovoAgend}>
          Para criar um novo agendamento, toque no botão azul <br />
          “Novo agendamento” <br />
          no topo da tela.
        </p>
      </div>
    </div>
  );
}

export default Component;
