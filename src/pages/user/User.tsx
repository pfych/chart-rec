import { Auth } from 'aws-amplify';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Page from '../../components/page/Page';

const User = (): JSX.Element => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>();
  const [response, setResponse] = useState<any>();

  useEffect(() => {
    (async () => {
      const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
      if (currentAuthenticatedUser) {
        setUser(currentAuthenticatedUser);
        console.log(currentAuthenticatedUser);
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
      {user ? (
        <div>
          <h1>Hi {user.attributes.sub}</h1>
          <p>
            Clicking or navigating to sign-in or sign-up while authed will
            navigate you here, The navbar does not account for Auth state yet
          </p>
          <p>email: {user.attributes.email}</p>
          <button onClick={sendRequest}>Test API</button>
          <button
            onClick={async () => {
              await Auth.signOut();
              navigate('/');
            }}
          >
            Sign Out
          </button>
          <p>Response Data: {JSON.stringify(response)}</p>
        </div>
      ) : (
        <div>
          Please <Link to={'/sign-in'}>Sign in</Link>
        </div>
      )}
    </Page>
  );
};

export default User;
