import React, { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import { Link, useNavigate } from 'react-router-dom';
import Page from '../../components/page/Page';

const SignIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    (async () => {
      const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
      if (currentAuthenticatedUser) {
        navigate('/user');
      }
    })();
  }, []);

  const handleSubmit = async () => {
    try {
      const newUser = await Auth.signIn(email, password);
      if (newUser) {
        navigate('/user');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <Page title={'Sign in'}>
      <div>
        <input
          type="email"
          placeholder={'email'}
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <br />
        <input
          type={'password'}
          placeholder={'password'}
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <br />
        <button onClick={handleSubmit}>Sign in</button>
        <br />
        <p>
          No account? <Link to={'/sign-up'}>Sign up</Link>
        </p>
      </div>
    </Page>
  );
};

export default SignIn;
