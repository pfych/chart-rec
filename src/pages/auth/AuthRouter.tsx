import { Auth } from 'aws-amplify';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthRouter = (): JSX.Element => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
        if (currentAuthenticatedUser) {
          navigate('/user');
        } else {
          navigate('/sign-in');
        }
      } catch (e) {
        navigate('/sign-in');
      }
    })();
  }, []);

  return <div></div>;
};

export default AuthRouter;
