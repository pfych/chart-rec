import { Auth } from 'aws-amplify';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/button-with-loader/Button';
import Page from '../../components/page/Page';
import styles from './user.module.scss';

const User = (): JSX.Element => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>();
  const [response, setResponse] = useState<any>();

  useEffect(() => {
    (async () => {
      try {
        const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
        if (currentAuthenticatedUser) {
          setUser(currentAuthenticatedUser);
          console.log(currentAuthenticatedUser);
        }
      } catch (e) {
        navigate('/sign-in');
      }
    })();
  }, []);

  const sendRequest = async () => {
    const userSession = await Auth.currentSession();
    const userToken = userSession.getIdToken().getJwtToken();
    const data = await axios({
      url: 'https://oct0d83v0g.execute-api.ap-southeast-2.amazonaws.com/dev/users',
      method: 'GET',
      headers: {
        Authorization: userToken,
      },
    });

    setResponse(data);
  };

  return (
    <Page title={'Account'}>
      <div className={styles.user}>
        <h1>Hi {user.attributes.email}</h1>
        <p>id: {user.attributes.sub}</p>
        <Button onClick={sendRequest}>Test API</Button>
        <Button
          onClick={async () => {
            await Auth.signOut();
            navigate('/');
          }}
        >
          Sign Out
        </Button>
        <p>Response Data: {JSON.stringify(response)}</p>
      </div>
    </Page>
  );
};

export default User;
