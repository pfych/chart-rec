import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../api/AuthContext';
import { request } from '../../api/Request';
import Page from '../../components/page/Page';

const TachiCallback = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accessToken, idToken } = useContext(AuthContext);

  const sendCode = async (code: string): Promise<void> => {
    console.log('Sending');
    if (accessToken) {
      await request({
        accessToken,
        idToken,
        method: 'POST',
        endpoint: '/tachi-oauth',
        data: {
          code,
        },
      });

      navigate('/user');
    } else {
      console.warn('No Token');
      navigate('/sign-in');
    }
  };

  useEffect(() => {
    (async () => {
      const oAuthCode = searchParams.get('code');

      if (oAuthCode && accessToken && idToken) {
        await sendCode(oAuthCode);
      }
    })();
  }, [accessToken, idToken]);

  return (
    <Page title={'Account'}>
      <h1>Handling Callback</h1>
      {accessToken ? <p>Success!</p> : <p>Please sign in and try again</p>}
    </Page>
  );
};

export default TachiCallback;
