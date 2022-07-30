import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Amplify from 'aws-amplify';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Home from './pages/Home';
import Error from './pages/Error';

Amplify.configure({
  Auth: {
    userPoolId: `${
      process.env.COGNITO_USER_POOL_ID || 'ap-southeast-2_oLSeWN6PB'
    }`,
    region: 'ap-southeast-2',
    userPoolWebClientId: `${
      process.env.COGNITO_CLIENT_ID || '7vsffeornn2a2h5fsemsfp5efa'
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

        <Route path="*" element={<Error errorCode={404} />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);
