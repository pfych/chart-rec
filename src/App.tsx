import { Auth } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthContext, ExtendedCognitoUser } from './api/AuthContext';
import AuthRouter from './pages/auth/AuthRouter';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Error from './pages/Error';
import Home from './pages/Home';
import TachiCallback from './pages/oAuth/TachiCallback';
import User from './pages/user/User';

const App = (): JSX.Element => {
  const [accessToken, setAccessToken] = useState<string>(undefined);
  const [idToken, setIdToken] = useState<string>(undefined);
  const [user, setUser] = useState<ExtendedCognitoUser>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
        if (currentAuthenticatedUser) {
          const userSession = await Auth.currentSession();

          const idJWT = userSession.getIdToken().getJwtToken();
          const accessJWT = userSession.getAccessToken().getJwtToken();

          setUser(currentAuthenticatedUser);
          setAccessToken(accessJWT);
          setIdToken(idJWT);
        }
      } catch (e) {
        console.warn('Not signed in');
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, idToken, user }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/user" element={<User />} />
          <Route path="/auth" element={<AuthRouter />} />
          <Route path="/tachi-callback" element={<TachiCallback />} />

          <Route path="*" element={<Error errorCode={404} />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;
