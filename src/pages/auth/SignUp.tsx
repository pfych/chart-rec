import { ISignUpResult } from 'amazon-cognito-identity-js';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import Page from '../../components/page/Page';

const SignUp = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [waitingForVerification, setWaitingForVerification] = useState(false);

  const [user, setUser] = useState<ISignUpResult>();

  const handleSubmit = async () => {
    try {
      const newUser = await Auth.signUp({
        username: email,
        password: password,
      });

      setUser(newUser);
      setWaitingForVerification(true);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleVerification = async () => {
    try {
      await Auth.confirmSignUp(email, verificationCode);
      await Auth.signIn(email, password);
      console.log('Success', user);
      navigate('/');
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <Page title="Home">
      <h1>Sign up</h1>
      {waitingForVerification ? (
        <div>
          <p>A verification code has been sent to {email}</p>
          <input
            type="text"
            placeholder="Verification code"
            onChange={(e) => setVerificationCode(e.target.value)}
            value={verificationCode}
          />
          <br />
          <button onClick={handleVerification}>Verify</button>
        </div>
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
          <button onClick={handleSubmit}>Sign up</button>
        </div>
      )}
    </Page>
  );
};

export default SignUp;
