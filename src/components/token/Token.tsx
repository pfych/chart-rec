import React, { useContext, useEffect } from 'react';
import { Context } from '../../api/Context';
import styles from './token.module.scss';

const Token = (): JSX.Element => {
  const { token, setToken, userId, setUserId } = useContext(Context);

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
      <label htmlFor="key">API Key:&nbsp;</label>
      <input
        id="key"
        type="password"
        onChange={(e) => {
          setToken(e.target.value);
          localStorage.setItem('token', e.target.value);
        }}
        value={token}
      />
      <br />
      <label htmlFor="userId">User ID:&nbsp;</label>
      <input
        id="userId"
        type="text"
        onChange={(e) => {
          setUserId(e.target.value);
        }}
        value={userId}
      />
    </div>
  );
};

export default Token;
