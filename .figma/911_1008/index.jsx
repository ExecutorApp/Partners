import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a024}>
      <div className={styles.a012}>
        <div className={styles.a01}>
          <p className={styles.nome}>Total:</p>
          <p className={styles.nome2}>R$ 800,00</p>
        </div>
        <div className={styles.a01}>
          <p className={styles.nome}>Restante:</p>
          <p className={styles.nome2}>R$ 00,00</p>
        </div>
      </div>
      <div className={styles.a02}>
        <div className={styles.botO}>
          <img src="../image/mip1w6fj-ldy8ugc.svg" className={styles.a03} />
          <p className={styles.formaDePagamento}>Forma de Pagamento</p>
        </div>
      </div>
      <div className={styles.lista}>
        <div className={styles.a022}>
          <div className={styles.a013}>
            <p className={styles.criarSenha}>Pix</p>
          </div>
          <div className={styles.a014}>
            <p className={styles.criarSenha2}>Crédito</p>
          </div>
          <div className={styles.a014}>
            <p className={styles.criarSenha2}>Débito</p>
          </div>
          <div className={styles.a014}>
            <p className={styles.criarSenha2}>Dinheiro</p>
          </div>
          <div className={styles.a014}>
            <p className={styles.criarSenha2}>Boleto</p>
          </div>
          <div className={styles.a014}>
            <p className={styles.criarSenha2}>TED</p>
          </div>
          <div className={styles.a014}>
            <p className={styles.criarSenha2}>DOC</p>
          </div>
        </div>
        <div className={styles.a017}>
          <div className={styles.a016}>
            <img src="../image/mip1w6fj-cccj0s1.svg" className={styles.a015} />
            <p className={styles.nome3}>
              Valor
              total&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </p>
          </div>
          <img src="../image/mip1w6fj-0cs7vx8.svg" className={styles.a} />
          <div className={styles.a023}>
            <img src="../image/mip1w6fj-wwua0sp.svg" className={styles.a015} />
            <p className={styles.nome3}>Valor parcial</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
