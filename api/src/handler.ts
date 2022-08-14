import { APIGatewayEvent } from 'aws-lambda';
import serverless from 'serverless-http';
import express from 'express';
import * as AWS from 'aws-sdk';
import cors from 'cors';
import { get, put } from './db/db';
import { OAUTH_TABLE } from './db/tables';
import { oAuthStatus, tachiOAuth } from './oAuth/tachi-oauth';
import { getScoresForUser } from './tachi/getScoresForUser';

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

app.post('/tachi-oauth', tachiOAuth);
app.post('/oauth-status', oAuthStatus);
app.post('/get-scores', getScoresForUser);
