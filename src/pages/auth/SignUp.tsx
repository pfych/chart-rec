import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import Button from '../../components/button-with-loader/Button';
import Page from '../../components/page/Page';
import styles from './auth.module.scss';

const SignUp = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [waitingForVerification, setWaitingForVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
      if (currentAuthenticatedUser) {
        navigate('/user');
      }
    })();
  }, []);

  const isValidEmail = useMemo(
    () =>
      email
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        ),
    [email],
  );

  const isValidPassword = useMemo(
    () =>
      password.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{6,}$/,
      ),
    [password],
  );

  const handleSubmit = async () => {
    try {
      await Auth.signUp({
        username: email,
        password: password,
      });

      setWaitingForVerification(true);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerification = async () => {
    try {
      await Auth.confirmSignUp(email, verificationCode);
      await Auth.signIn(email, password);
      navigate('/sign-in');
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page title="Home">
      <div className={styles.container}>
        <div className={styles.card}>
          {waitingForVerification ? (
            <form
              onSubmit={(e) => {
                setIsSubmitting(true);
                e.preventDefault();
                handleVerification();
              }}
            >
              <input
                type="text"
                placeholder="Verification code"
                onChange={(e) => setVerificationCode(e.target.value)}
                value={verificationCode}
              />
              <br />
              <Button
                isLoading={isSubmitting}
                disabled={!verificationCode}
                type="submit"
              >
                Verify
              </Button>
              <span className={styles.infoText}>
                A verification code has been sent to {email}
              </span>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                setIsSubmitting(true);
                e.preventDefault();
                handleSubmit();
              }}
            >
              <input
                type="email"
                placeholder={'Email'}
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
              <input
                type={'password'}
                placeholder={'Password'}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <Button
                isLoading={isSubmitting}
                disabled={!isValidPassword || !isValidEmail}
                type="submit"
              >
                Sign up
              </Button>
              <span className={styles.infoText}>
                {!isValidPassword
                  ? 'Password must contain Capitals, Numbers and Symbols'
                  : ''}
              </span>
            </form>
          )}
        </div>
      </div>
    </Page>
  );
};

export default SignUp;
