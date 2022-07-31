import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Amplify from 'aws-amplify';
import AuthRouter from './pages/auth/AuthRouter';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Home from './pages/Home';
import Error from './pages/Error';
import User from './pages/user/User';

Amplify.configure({
  Auth: {
    userPoolId: `${
      process.env.COGNITO_USER_POOL_ID || 'ap-southeast-2_xleq72qni'
    }`,
    region: 'ap-southeast-2',
    userPoolWebClientId: `${
      process.env.COGNITO_CLIENT_ID || '2sseruav7jkb5caaflcutj34lh'
    }`,
  },
});

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/user" element={<User />} />
        <Route path="/auth" element={<AuthRouter />} />

        <Route path="*" element={<Error errorCode={404} />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);
