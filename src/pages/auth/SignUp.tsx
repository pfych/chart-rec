import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import Page from '../../components/page/Page';

const SignUp = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [waitingForVerification, setWaitingForVerification] = useState(false);

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
      await Auth.signUp({
        username: email,
        password: password,
      });

      setWaitingForVerification(true);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleVerification = async () => {
    try {
      await Auth.confirmSignUp(email, verificationCode);
      await Auth.signIn(email, password);
      navigate('/sign-in');
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
