import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../api/AuthContext';
import { request } from '../../../api/Request';
import Button from '../../../components/button-with-loader/Button';
import styles from '../user.module.scss';
import {
  coolDownTimeInSeconds,
  getLastSuccess,
  getNiceErrorMessage,
  pullFromLocalStorage,
} from './CSVPull.utils';

const CSVPull = (): JSX.Element => {
  const { accessToken, idToken } = useContext(AuthContext);
  const { username: storageUsername, password: storagePassword } =
    pullFromLocalStorage();

  const [username, setUsername] = useState(storageUsername);
  const [password, setPassword] = useState(storagePassword);
  const [save, setSave] = useState(!!storageUsername || !!storagePassword);
  const [message, setMessage] = useState('');
  const [isPulling, setIsPulling] = useState(false);

  const saveToLocalStorage = () => {
    localStorage.setItem(
      'konami',
      JSON.stringify({
        username: username,
        password: password,
      }),
    );
  };

  useEffect(() => {
    if (save) {
      saveToLocalStorage();
    } else {
      localStorage.removeItem('konami');
    }
  }, [save]);

  const getCSV = async () => {
    setIsPulling(true);
    setMessage('');
    saveToLocalStorage();
    const data = await request({
      method: 'POST',
      endpoint: '/csv-pull',
      accessToken,
      idToken,
      data: {
        username,
        password,
      },
    });
    console.log(data);

    if (data.error) {
      setMessage(getNiceErrorMessage(data.error));
    } else {
      localStorage.setItem(
        'lastSuccess',
        JSON.stringify({ date: Math.floor(Date.now() / 1000) }),
      );
      setMessage('Scores submitted to Tachi successfully!');
    }

    setIsPulling(false);
  };

  const hasCoolDownPassed =
    getLastSuccess().date <
    Math.floor(Date.now() / 1000) - coolDownTimeInSeconds;

  return (
    <div>
      <h2>Konami Import</h2>
      <p>
        Pull Konami CSV for import on Tachi. Please login below with your Konami
        below. These details are not saved on any non-konami server. This
        feature is finicky and has a couple moving parts to make it work in a
        browser. If this breaks, please contact me with the error output.
        Thanks.
      </p>
      <input
        placeholder="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          name="checkbox"
          checked={save}
          onChange={(e) => {
            setSave(e.target.checked);
          }}
        />
        Save username and password to device localstorage in plain text.
      </label>
      <Button
        isLoading={isPulling}
        disabled={(!password && !username) || !hasCoolDownPassed}
        type="button"
        onClick={getCSV}
      >
        {hasCoolDownPassed
          ? 'Pull CSV'
          : `Please wait ${Math.floor(coolDownTimeInSeconds / 60)} minutes`}
      </Button>
      {message ? <p>{message}</p> : <></>}
    </div>
  );
};

export default CSVPull;
