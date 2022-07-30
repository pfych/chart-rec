import { ISignUpResult } from 'amazon-cognito-identity-js';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import Page from '../../components/page/Page';

const SignIn = () => {
  const [user, setUser] = useState();
  const [hasSignedIn, setHasSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      const newUser = await Auth.signIn(email, password);
      setUser(newUser);
      setHasSignedIn(true);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <Page title={'Sign in'}>
      {hasSignedIn ? (
        <div>{JSON.stringify(user)}</div>
      ) : (
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
        </div>
      )}
    </Page>
  );
};

export default SignIn;
