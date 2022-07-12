import React, { useContext, useEffect } from 'react';
import { Context } from '../../api/Context';
import styles from './token.module.scss';

const Token = (): JSX.Element => {
  const { token, setToken } = useContext(Context);

  useEffect(() => {
    if (!token) {
      const localToken = localStorage.getItem('token');
      if (localToken) {
        setToken(localToken);
      }
    }
  });

  return (
    <div className={styles.token}>
      <h1>Token</h1>
      <p>Generate A Kamaitachi API token and paste it here</p>
      <input
        type="password"
        onChange={(e) => {
          setToken(e.target.value);
          localStorage.setItem('token', e.target.value);
        }}
        value={token}
      />
    </div>
  );
};

export default Token;
