import { Auth } from 'aws-amplify';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../api/AuthContext';
import { request } from '../../api/Request';
import Button from '../../components/button-with-loader/Button';
import Loading from '../../components/loading/Loading';
import Page from '../../components/page/Page';
import styles from './user.module.scss';

const coolDownTimeInSeconds = 300;

const pullFromLocalStorage = () => {
  const storage = JSON.parse(localStorage.getItem('konami'));

  return {
    username: storage?.username || '',
    password: storage?.password || '',
  };
};

const getLastSuccess = () => {
  const storage = JSON.parse(localStorage.getItem('lastSuccess'));

  return {
    date: storage?.date || 0,
  };
};

const User = (): JSX.Element => {
  const navigate = useNavigate();
  const [isOAuth, setIsOAuth] = useState(undefined);

  const { username: storageUsername, password: storagePassword } =
    pullFromLocalStorage();

  const [username, setUsername] = useState(storageUsername);
  const [password, setPassword] = useState(storagePassword);
  const [save, setSave] = useState(!!storageUsername || !!storagePassword);
  const [message, setMessage] = useState('');
  const [isPulling, setIsPulling] = useState(false);

  const { recheckAuth, user, accessToken, idToken } = useContext(AuthContext);

  useEffect(() => {
    recheckAuth();
  }, []);

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

  useEffect(() => {
    if (accessToken && idToken) {
      (async () => {
        const data = await request({
          method: 'POST',
          endpoint: '/oauth-status',
          accessToken,
          idToken,
        });

        setIsOAuth(data.tachiCode);
      })();
    }
  }, [accessToken, idToken]);

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
      setMessage(data.error);
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
    <Page title={'Account'}>
      {user ? (
        <div className={styles.user}>
          <h1>Hi {user.attributes.email}</h1>
          <p>id: {user.attributes.sub}</p>
          {isOAuth === undefined ? (
            <p>Fetching OAuth State...</p>
          ) : (
            <span>
              {isOAuth ? (
                <p>Signed into Kamaitachi!</p>
              ) : (
                <p>
                  Please{' '}
                  <a href="https://kamaitachi.xyz/oauth/request-auth?clientID=CIa631a6f1cc474efe82e44a6ca0aff8d03d0b3f9e">
                    Sign in with Kamaitachi
                  </a>
                </p>
              )}
            </span>
          )}
          <Button onClick={() => navigate('/recommend')} disabled={!isOAuth}>
            View Recommendations
          </Button>
          <hr />
          <h2>Konami Export</h2>
          <p>Pull Konami CSV for import on Tachi.</p>
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
            Save username and&nbsp;<b>password</b>&nbsp;to device localstorage
            in&nbsp;
            <b>plain text</b>.
          </label>
          {message ? <p>{message}</p> : <></>}
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
          <hr />
          <h2>Algorithm Explanation</h2>
          <p>The algorithm weights charts based on the following:</p>
          <ol>
            <li>Tier-list</li>
            <li>Lamp</li>
            <li>Time since last played</li>
          </ol>
          <h3>Tier-list</h3>
          <ul>
            <li>
              Greater than 12% cleared <b>x 1.25</b>
            </li>
            <li>
              Greater than 25% cleared <b>x 1.50</b>
            </li>
            <li>
              Greater than 37% cleared <b>x 2.00</b>
            </li>
            <li>
              Greater than 50% cleared <b>x 2.25</b>
            </li>
            <li>
              Greater than 62% cleared <b>x 2.50</b>
            </li>
            <li>
              Greater than 75% cleared <b>x 2.75</b>
            </li>
            <li>
              Greater than 87% cleared <b>x 3.00</b>
            </li>
          </ul>
          <h3>Lamp</h3>
          <ul>
            <li>
              NO PLAY <b>x 2.00</b>
            </li>
            <li>
              ASSIST <b>x 1.75</b>
            </li>
            <li>
              EASY <b>x 1.50</b>
            </li>
            <li>
              FAILED <b>x 1.25</b>
            </li>
            <li>
              CLEAR <b>x 0.50</b>
            </li>
          </ul>
          <h3>Time since last play</h3>
          <p>This only applies if you have more than 25% of the tier cleared</p>
          <ul>
            <li>
              2 Months ago <b>x 3.00</b>
            </li>
            <li>
              1 Month ago <b>x 2.00</b>
            </li>
            <li>
              15 Days ago <b>x 1.50</b>
            </li>
          </ul>
          <p>
            <b>TLDR;</b> This algorithm is more focused towards going for new
            clear lamps.
          </p>
          <p
            onClick={() => {
              /** Bypass time limit on making CSV requests */
              localStorage.setItem('lastSuccess', JSON.stringify({ date: 0 }));
            }}
          >
            This algorithm is{' '}
            <b>
              <i>NOT</i>
            </b>{' '}
            perfect at all. Please let me know if you think of a better one!
          </p>
          <Button
            onClick={async () => {
              await Auth.signOut();
              navigate('/');
            }}
          >
            Sign Out
          </Button>
        </div>
      ) : (
        <Loading />
      )}
    </Page>
  );
};

export default User;
