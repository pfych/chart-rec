import React, { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/button-with-loader/Button';
import Page from '../../components/page/Page';
import styles from './auth.module.scss';

const SignIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [warnings, setWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setWarning(e.toString().split(':')[1]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page title={'Sign in'}>
      <div className={styles.container}>
        <div className={styles.card}>
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
              disabled={!password && !email}
              type="submit"
            >
              Sign in
            </Button>
          </form>
          <div className={styles.errorText}>{warnings}</div>
          <div className={styles.infoText}>
            No account? <Link to={'/sign-up'}>Sign up</Link>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default SignIn;
