import { APIGatewayEvent } from 'aws-lambda';
import serverless from 'serverless-http';
import express from 'express';
import * as AWS from 'aws-sdk';
import cors from 'cors';
import { get, put } from './db/db';
import { OAUTH_TABLE } from './db/tables';

AWS.config.update({ region: 'ap-southeast-2' });
const provider = new AWS.CognitoIdentityServiceProvider();

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

module.exports.handler = serverless(app, {
  request(request, event: APIGatewayEvent, context) {
    request.context = event.requestContext;
  },
});

app.get('/users', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify({ key: 'value' }));
});

app.post('/tachi-oauth', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const accessToken = req.body.accessToken;
    let responseBody = {};

    if (accessToken && req.body.code) {
      const user = (
        await provider.getUser({ AccessToken: `${accessToken}` }).promise()
      ).$response.data;

      console.log('USER', user);

      if (user) {
        await put<{ cognitoSub: string; tachiCode: string }>({
          table: OAUTH_TABLE,
          object: { cognitoSub: user.Username, tachiCode: req.body.code },
        });
      }

      responseBody = { status: 'success' };
    } else {
      responseBody = { status: 'missing accesstoken' };
    }

    res.end(JSON.stringify(responseBody));
  } catch (e) {
    res.end(JSON.stringify(e));
  }
});

app.post('/oauth-status', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    let responseBody = {};
    const accessToken = req.body.accessToken;

    if (accessToken) {
      const user = (
        await provider.getUser({ AccessToken: `${accessToken}` }).promise()
      ).$response.data;

      if (user) {
        const item = await get<{ cognitoSub: string; tachiCode: string }>({
          table: OAUTH_TABLE,
          keyName: 'cognitoSub',
          keyValue: user.Username,
        });

        responseBody = { tachiCode: !!item?.tachiCode };
      }
    } else {
      responseBody = { status: 'missing accesstoken' };
    }

    res.end(JSON.stringify(responseBody));
  } catch (e) {
    res.end(JSON.stringify(e));
  }
});
