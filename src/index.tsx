import React from 'react';
import ReactDOM from 'react-dom';
import Amplify from 'aws-amplify';
import App from './App';

Amplify.configure({
  Auth: {
    userPoolId: `${
      process.env.COGNITO_USER_POOL_ID || 'ap-southeast-2_ta7PPUeMo'
    }`,
    region: 'ap-southeast-2',
    userPoolWebClientId: `${
      process.env.COGNITO_CLIENT_ID || '11k7h5qj2e4gnqkhjon2lofbi4'
    }`,
  },
});

ReactDOM.render(<App />, document.getElementById('root'));
