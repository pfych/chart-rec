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
  const { user, accessToken, idToken } = useContext(AuthContext);

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
          <Button
            onClick={() =>
              request({
                endpoint: '/get-scores',
                method: 'POST',
                accessToken,
                idToken,
              })
            }
          >
            Test API
          </Button>
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
