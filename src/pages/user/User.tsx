import { Auth } from 'aws-amplify';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../api/AuthContext';
import { request } from '../../api/Request';
import Button from '../../components/button-with-loader/Button';
import Loading from '../../components/loading/Loading';
import Page from '../../components/page/Page';
import styles from './user.module.scss';

const User = (): JSX.Element => {
  const navigate = useNavigate();
  const [isOAuth, setIsOAuth] = useState(undefined);
  const { recheckAuth, user, accessToken, idToken } = useContext(AuthContext);

  useEffect(() => {
    recheckAuth();
  }, []);

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
          <p>
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
